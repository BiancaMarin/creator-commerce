import { generateReactHelpers } from "@uploadthing/react";

import type { UploadRouter } from "@/app/api/uploadthing/core";

/**
 * Typed browser-side bindings to the file router in
 * `app/api/uploadthing/core.ts`. Endpoint names and the shape of what
 * `onClientUploadComplete` receives are both inferred from it, so renaming a
 * route there is a compile error here rather than a 404 at runtime.
 *
 * The `UploadRouter` import is **type-only** on purpose: it's erased at compile
 * time, so pulling the router's type into a Client Component doesn't drag
 * `lib/server/*` (and the auth/DB modules behind it) into the browser bundle.
 * Keep it `import type` — a value import would break the build.
 *
 * Note this file deliberately doesn't use UploadThing's prebuilt `UploadButton`
 * / `UploadDropzone`. Those ship their own stylesheet and `ut-*` class API,
 * which fights this project's token-based Tailwind v4 setup, and `UploadDropzone`
 * would replace the whole control rather than slot into it — the thumbnail
 * strip, cover badge and per-product cap all live in the same component.
 * `useUploadThing` keeps the UI on the existing primitives, with drag-and-drop
 * done through native DOM drag events. See
 * `components/dashboard/product-image-field.tsx`.
 */
export const { useUploadThing } = generateReactHelpers<UploadRouter>();
