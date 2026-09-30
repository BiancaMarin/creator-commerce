import { z } from "zod";

import { strings } from "@/constants/strings";

/**
 * How many images one product can carry. Lives here because three places have
 * to agree on it: this schema (the authoritative check), the upload endpoint's
 * `maxFileCount`, and the form, which stops offering the button at the cap.
 */
export const MAX_PRODUCT_IMAGES = 6;

/**
 * The ceiling on the digital product itself, in bytes. This is the number the
 * requirement names (100 MB) and the one enforced twice — in the file field
 * before an upload is spent, and again in the `productFile` route's middleware,
 * which is the only place the browser can't skip.
 *
 * The route's own `maxFileSize` can't say "100MB": UploadThing types it as a
 * power of two followed by a unit, so the nearest value that doesn't reject a
 * legitimate 100 MB file is `128MB`. That's the backstop UploadThing enforces;
 * this is the rule the app enforces.
 */
export const MAX_PRODUCT_FILE_BYTES = 100 * 1024 * 1024;

/**
 * What the product form holds for an uploaded digital product, and what the
 * `products.file_*` columns store. Everything here comes back from the
 * `productFile` upload route — see `app/api/uploadthing/core.ts`.
 *
 * There is no URL: an UploadThing file's public address is derivable from its
 * key, and not storing one keeps a raw, ungated download link out of every
 * component that renders a product. Delivery is a signed URL minted per
 * request from `key`, gated on `hasPurchasedProduct()`.
 *
 * Like `imageUrls`, this is validated but not trusted — it arrives from the
 * client like any other form value. The upload itself was authorized in the
 * route's middleware.
 */
export const productFileSchema = z.object({
  /** UploadThing's storage key — what a signed download URL is minted from. */
  key: z
    .string()
    .trim()
    .min(1, strings.validation.productFile)
    .max(512, strings.validation.productFile),
  /** The original filename, shown to the buyer and used for the download. */
  name: z
    .string()
    .trim()
    .min(1, strings.validation.productFile)
    .max(255, strings.validation.productFile),
  size: z
    .int()
    .positive(strings.validation.productFile)
    .max(MAX_PRODUCT_FILE_BYTES, strings.validation.productFileSize),
});

export type ProductFile = z.infer<typeof productFileSchema>;

/**
 * Shared by the product form and the create/edit server actions, so the two
 * can never disagree on what a valid product is. Mirrors the column widths in
 * `lib/server/db/schemas/product.ts`.
 *
 * `slug` is absent on purpose: it's derived from `name` server-side, never
 * submitted by the client.
 */
export const productSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, strings.validation.productName)
    .max(255, strings.validation.productName),
  tag: z
    .string()
    .trim()
    .min(2, strings.validation.productTag)
    .max(60, strings.validation.productTag),
  description: z
    .string()
    .trim()
    .min(10, strings.validation.productDescription)
    .max(2000, strings.validation.productDescription),
  // Kept as a string all the way to the database: `numeric` round-trips as a
  // string in Drizzle, and money should never pass through a float. The regex
  // is what makes it a number — digits, at most 2 decimals, no sign or
  // exponent — so the refine only has to rule out the zero the regex allows.
  price: z
    .string()
    .trim()
    .regex(/^\d{1,8}(\.\d{1,2})?$/, strings.validation.productPrice)
    .refine((value) => Number(value) > 0, strings.validation.productPricePositive),
  // The digital product itself, and the one field whose input and output types
  // differ — which is deliberate, not incidental:
  //
  //  - **In** (`ProductInput`, what the form holds) it is `ProductFile | null`.
  //    A form starts with no file, and a driven field needs *some* value before
  //    one is picked; `undefined` would read as "field not registered" to
  //    react-hook-form, and an editable product created before this feature
  //    existed genuinely has none.
  //  - **Out** (`ProductValues`, what the server action receives) the refine
  //    rules `null` out, so it is `ProductFile`. A product with nothing to
  //    download isn't a product, and the action never has to re-check.
  //
  // The form declares both — `useForm<ProductInput, unknown, ProductValues>` —
  // so the split is enforced at the one boundary it matters at.
  file: z
    .nullable(productFileSchema)
    .refine((value) => value !== null, strings.validation.productFileRequired),
  // The image URLs handed back by UploadThing, in display order — the first is
  // the cover. No images is `[]`, never null, matching the NOT NULL DEFAULT '{}'
  // column, so neither side ever has to branch on a missing value.
  //
  // Validated but not trusted: these arrive from the client like any other
  // field, so the shape check is all this is. The uploads themselves were
  // authorized separately, in the file router's middleware.
  imageUrls: z
    .array(
      z
        .url(strings.validation.productImage)
        .max(512, strings.validation.productImage),
    )
    .max(
      MAX_PRODUCT_IMAGES,
      strings.validation.productImageCount.replace(
        "{count}",
        String(MAX_PRODUCT_IMAGES),
      ),
    ),
});

/**
 * What the product form sends to have a description written for it. Either a
 * name worth writing about or an image to look at is enough — the refine
 * requires at least one — so the creator can start from whichever they have.
 *
 * Deliberately looser than `productSchema`: the form is half-filled when this
 * runs, so `tag` may be empty and nothing here is required on its own.
 */
export const productDescriptionRequestSchema = z
  .object({
    name: z.string().trim().max(255),
    tag: z.string().trim().max(60),
    // Checked again server-side against this app's own UploadThing host — the
    // model fetches it, so it must not be an arbitrary address.
    imageUrl: z.url().max(512).nullable(),
  })
  .refine(
    (value) => value.name.length >= 3 || value.imageUrl !== null,
    strings.validation.productDescriptionSource,
  );

export type ProductDescriptionRequest = z.infer<
  typeof productDescriptionRequestSchema
>;

/** What the form holds while it's being filled in — see `file` above. */
export type ProductInput = z.input<typeof productSchema>;

/** What a *valid* product is: what the server action and the DAL work with. */
export type ProductValues = z.output<typeof productSchema>;
