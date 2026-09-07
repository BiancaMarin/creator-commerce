import { getSession } from "@/lib/server/dal/session";
import { hasPurchasedProduct } from "@/lib/server/dal/orders";
import { getProductFile } from "@/lib/server/dal/products";
import { storageUrl } from "@/lib/server/uploadthing";

/**
 * Serves a product file to someone who paid for it.
 *
 * **This route streams the bytes; it does not redirect.** That is the whole
 * design, and it is forced by the plan: private-ACL files are a paid
 * UploadThing feature, so every file here is publicly readable by anyone
 * holding its key, permanently. A 302 to the storage URL would hand the buyer
 * that permanent key, and from then on nothing — not expiry, not a refund, not
 * deleting the order — could take the file back. Proxying keeps the key on the
 * server, which makes the check below the only way in.
 *
 * The cost of that choice is real and worth naming: up to 100 MB flows through
 * this function on every download. It is streamed, not buffered, so memory
 * stays flat — but on a serverless host the *duration* limit still applies, and
 * a buyer on a slow connection is the case that will hit it first. The escape
 * hatch is a paid UploadThing plan: with private files, this becomes
 * `generateSignedURL()` + a redirect, and the same entitlement check still
 * gates the mint. Nothing else about this route would change.
 *
 * There is no token in the URL and nothing here expires. The session is the
 * expiry: entitlement is re-read on every single click, so a refund or a
 * chargeback revokes access the moment `orders.status` stops being `paid`,
 * with no window to wait out.
 */
export async function GET(
  _request: Request,
  context: RouteContext<"/api/downloads/[productId]">,
) {
  const { productId } = await context.params;
  const id = Number(productId);

  // The id is a path segment, so it is a string that might be anything.
  // Rejected here rather than passed to a query that would coerce NaN.
  if (!Number.isInteger(id) || id <= 0) {
    return new Response("Not found", { status: 404 });
  }

  // `getSession()`, not `requireUser()`: this is a route handler, and
  // `requireUser`'s redirect() throws a navigation signal that has no meaning
  // outside a page render. A 401 is also the honest answer for a fetch, and
  // for a click it is a broken download rather than a mystery login page.
  const session = await getSession();

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  // The gate. Identity from the session, product from the URL — never the
  // other way round, and never a `buyerId` the caller supplies.
  if (!(await hasPurchasedProduct(session.user.id, id))) {
    // 404, not 403: whether a stranger has bought a given product is not
    // something this endpoint should confirm, and there is nothing they could
    // do with a 403 anyway.
    return new Response("Not found", { status: 404 });
  }

  const file = await getProductFile(id);

  if (!file) {
    // Bought, but the creator never attached a file — a product that predates
    // product files. Distinct from "you don't own this", and the buyer can act
    // on it (ask the creator), so it says so.
    return new Response("This product has no file attached", { status: 404 });
  }

  const upstream = await fetch(storageUrl(file.fileKey));

  if (!upstream.ok || !upstream.body) {
    // The row points at a key storage doesn't have. Log it — this is the
    // creator's product silently failing to deliver, and nobody else will
    // notice until a buyer complains.
    console.error(
      `[download] product ${id}: storage returned ${upstream.status}`,
    );

    return new Response("The file could not be fetched", { status: 502 });
  }

  const headers = new Headers();

  // `attachment` is what makes this a download rather than a tab. Without it a
  // PDF, an image or an MP4 renders inline, and the browser saves it under the
  // opaque storage key instead of the name the creator uploaded.
  //
  // The filename is quoted and stripped of quotes and control characters: it is
  // creator-supplied text going into a header, and an unescaped `"` ends the
  // parameter early. `filename*` carries the UTF-8 form for names the ASCII
  // parameter can't spell, and browsers prefer it when both are present.
  const safeName = file.fileName.replace(/["\\\r\n]/g, "");

  headers.set(
    "content-disposition",
    `attachment; filename="${safeName}"; filename*=UTF-8''${encodeURIComponent(file.fileName)}`,
  );
  headers.set(
    "content-type",
    upstream.headers.get("content-type") ?? "application/octet-stream",
  );

  // Passed through so the browser can show a progress bar and an ETA rather
  // than an indeterminate spinner.
  //
  // **Upstream wins over `products.file_size`**, and the order matters more
  // than it looks. This header has to describe the bytes actually in this
  // response, and the only authority on that is the response being copied. The
  // stored size is a *display* value written at upload time; if the two ever
  // disagree — a re-upload, a bad backfill, a row edited by hand — announcing
  // the stored one makes the browser truncate the download at that count or
  // fail it outright. A missing content-length only costs a progress bar.
  const contentLength = upstream.headers.get("content-length");

  if (contentLength) {
    headers.set("content-length", contentLength);
  }

  // The response is authorized for exactly one person, so it must not be held
  // anywhere shared. Without this a CDN in front of the app could serve one
  // buyer's paid download to the next visitor who asks for the same path.
  headers.set("cache-control", "no-store, private");

  return new Response(upstream.body, { status: 200, headers });
}
