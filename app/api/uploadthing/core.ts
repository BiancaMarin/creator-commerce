import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

import { strings } from "@/constants/strings";
import { MAX_PRODUCT_IMAGES } from "@/lib/schemas/product";
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
} satisfies FileRouter;

export type UploadRouter = typeof uploadRouter;
