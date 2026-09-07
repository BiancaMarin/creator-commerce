import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

import { strings } from "@/constants/strings";
import {
  MAX_PRODUCT_FILE_BYTES,
  MAX_PRODUCT_IMAGES,
} from "@/lib/schemas/product";
import { getSession } from "@/lib/server/dal/session";

const f = createUploadthing();

/**
 * The upload endpoints this app exposes. Served by ./route.ts, consumed through
 * the typed client helpers in `lib/uploadthing.ts`.
 *
 * Uploads go straight from the browser to UploadThing's storage — the file
 * never passes through this server. That makes `.middleware()` the *only* place
 * authorization can happen, so it runs the same rule the rest of the app does:
 * identity comes from the session, never from the request body.
 */
export const uploadRouter = {
  /**
   * A product's images. Small enough that a creator can't use the storefront as
   * free file hosting; these limits are enforced by UploadThing before the
   * upload starts, not just by the form.
   *
   * `maxFileCount` caps a single batch, not the product — a creator could
   * upload six, then six more. The real ceiling is the `imageUrls` array in
   * `lib/schemas/product.ts`, which the server action checks on save.
   */
  productImage: f({
    image: { maxFileSize: "4MB", maxFileCount: MAX_PRODUCT_IMAGES },
  })
    .middleware(async () => {
      // Deliberately `getSession()` and not `requireUser()`: this runs inside a
      // POST from the browser's uploader, where a redirect to /login would come
      // back as an opaque failure. Throwing gives the client a real error.
      const session = await getSession();

      if (!session) {
        // The `code` is not optional in practice: without it UploadThingError
        // defaults to INTERNAL_SERVER_ERROR, and a signed-out upload comes back
        // as a 500 that the client can't tell apart from a real outage.
        throw new UploadThingError({
          code: "FORBIDDEN",
          message: strings.errors.uploadUnauthorized,
        });
      }

      // Whatever is returned here is handed to `onUploadComplete` below, and is
      // the only trustworthy identity available at that point.
      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ file }) => {
      // The row isn't written here. The uploaded URL is just a form value until
      // the creator saves the product, so that an abandoned form doesn't mutate
      // the catalog — `lib/actions/products.ts` persists it.
      //
      // `ufsUrl` rather than `file.url`/`file.appUrl`: both are deprecated in
      // uploadthing v7 and are slated for removal in v9.
      return { imageUrl: file.ufsUrl };
    }),

  /**
   * The digital product itself — the thing the buyer pays for. Separate from
   * `productImage` rather than a second use of it, because almost nothing about
   * the two is the same: this one takes any file type, allows exactly one, and
   * is ~25× the size limit. Sharing an endpoint would mean the loosest of each
   * rule applied to both, and a 100 MB "cover image" would be accepted.
   *
   * `blob` is UploadThing's any-type key: a digital product is a zip, a PDF, a
   * video, a Lightroom preset — there is no useful allowlist.
   *
   * `maxFileSize: "128MB"` is **not** the product rule. UploadThing types the
   * limit as a power of two plus a unit, so 100MB is unrepresentable, and
   * rounding *down* to 64MB would reject files the requirement allows. 128MB is
   * the closest value that doesn't; the real 100 MB ceiling is enforced in the
   * middleware below, where the client can't skip it.
   */
  productFile: f({
    blob: { maxFileSize: "128MB", maxFileCount: 1 },
  })
    // `files` carries the name/size/type the browser declared, before any bytes
    // move — which is what makes rejecting an oversized upload here cheap.
    .middleware(async ({ files }) => {
      const session = await getSession();

      if (!session) {
        throw new UploadThingError({
          code: "FORBIDDEN",
          message: strings.errors.uploadUnauthorized,
        });
      }

      // The 100 MB rule. The field checks it too, so this is rarely the message
      // a creator sees — but the field is the browser's copy of the rule, and
      // this endpoint is reachable without it.
      if (files.some((file) => file.size > MAX_PRODUCT_FILE_BYTES)) {
        // BAD_REQUEST, not FORBIDDEN: the caller is allowed here, the file is
        // the problem. Without an explicit code this would surface as a 500.
        throw new UploadThingError({
          code: "BAD_REQUEST",
          message: strings.products.fileTooLarge,
        });
      }

      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ file }) => {
      // Same rule as the images above: nothing is written here. This is a form
      // value until the creator saves, so an abandoned form leaves the catalog
      // alone.
      //
      // The key rather than a URL — see the note on `productFileSchema`. Name
      // and size come back so the field can render the file it just took
      // without holding on to the browser's `File` object.
      return { key: file.key, name: file.name, size: file.size };
    }),
} satisfies FileRouter;

export type UploadRouter = typeof uploadRouter;
