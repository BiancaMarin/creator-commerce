import { z } from "zod";

import { strings } from "@/constants/strings";

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
  // string in Drizzle, and money should never pass through a float.
  price: z
    .string()
    .trim()
    .regex(/^\d{1,8}(\.\d{1,2})?$/, strings.validation.productPrice),
  files: z.string().trim().max(160, strings.validation.productFiles),
});

export type ProductValues = z.infer<typeof productSchema>;
