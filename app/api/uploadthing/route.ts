import { createRouteHandler } from "uploadthing/next";

import { uploadRouter } from "./core";

/**
 * The UploadThing endpoint. Handles both the presigned-URL request (POST) and
 * the router config lookup (GET) for every route declared in ./core.ts.
 *
 * Config is read from `UPLOADTHING_TOKEN` in the environment — nothing to pass
 * here, and no secret ever reaches the client.
 */
export const { GET, POST } = createRouteHandler({ router: uploadRouter });
