import "server-only";

/**
 * Server-side helpers for reaching files in UploadThing storage.
 *
 * This is not `lib/uploadthing.ts` — that one is the browser's typed binding to
 * the file router. This is the read side, and it must never reach a client
 * bundle: the URL it builds is the permanent, unguessable address of a paid
 * product, and the whole download design rests on it staying server-side.
 */

/** Cached across requests — decoding the token per download would be silly. */
let cachedAppId: string | null = null;

/**
 * The app's UploadThing id, decoded from `UPLOADTHING_TOKEN`.
 *
 * The token is base64 JSON of `{ apiKey, appId, regions }`. Only `appId` is
 * read here, and it is public — it appears in the URL of every file this app
 * has ever uploaded, and is hardcoded in `next.config.ts`'s `remotePatterns`
 * for the image optimizer. The `apiKey` beside it is not, which is why this
 * decodes rather than exporting the parsed object.
 *
 * Derived rather than hardcoded a second time: the two would drift the first
 * time this app is pointed at a different UploadThing project, and the failure
 * would be 404s on paid downloads.
 */
function getAppId() {
  if (cachedAppId) {
    return cachedAppId;
  }

  const token = process.env.UPLOADTHING_TOKEN;

  if (!token) {
    throw new Error("UPLOADTHING_TOKEN is not set");
  }

  const { appId } = JSON.parse(
    Buffer.from(token, "base64").toString("utf8"),
  ) as { appId?: string };

  if (!appId) {
    throw new Error("UPLOADTHING_TOKEN carries no appId");
  }

  cachedAppId = appId;

  return appId;
}

/**
 * The storage URL for an uploaded file key.
 *
 * **This URL is public and permanent.** Private-ACL files are a paid
 * UploadThing feature, so on this plan every uploaded file is readable by
 * anyone who knows its key, forever, and no signature or expiry can revoke
 * that. The only thing standing between a stranger and a paid product is that
 * the key never leaves the server — which is why `products` stores `file_key`
 * and deliberately no URL column, why nothing in `lib/schemas/product.ts`
 * carries one to the client, and why the download route streams the response
 * instead of redirecting to this address.
 *
 * Never return the result of this function to a browser.
 */
export function storageUrl(fileKey: string) {
  return `https://${getAppId()}.ufs.sh/f/${encodeURIComponent(fileKey)}`;
}
