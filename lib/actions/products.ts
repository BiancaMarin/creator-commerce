"use server";

import { revalidatePath } from "next/cache";

import { strings } from "@/constants/strings";
import {
  productDescriptionRequestSchema,
  productSchema,
  type ProductDescriptionRequest,
  type ProductDraft,
  type ProductValues,
} from "@/lib/schemas/product";
import { generateProductDraft } from "@/lib/server/ai";
import { requireUser } from "@/lib/server/dal/session";
import {
  createProductForUser,
  deleteProductForUser,
  isFileKeyOfOtherSeller,
  isSlugTaken,
  listProductTypes,
  updateProductForUser,
  type ProductWrite,
} from "@/lib/server/dal/products";
import { isOwnStorageUrl } from "@/lib/server/uploadthing";
import { slugify } from "@/lib/utils";

export type ProductActionResult =
  | { ok: true; id: number; slug: string }
  | { ok: false; error: string };

/** Slugs are 60 chars; leave room for the "-2" style disambiguator. */
const SLUG_BASE_MAX_LENGTH = 56;

/**
 * Derives a storefront-unique slug from the product name. On collision it
 * appends -2, -3, … rather than failing: the creator named two products the
 * same thing, which is their business, but the URLs still have to differ.
 */
async function uniqueSlug(userId: string, name: string, exceptId?: number) {
  // A name of only punctuation ("!!!") slugifies to "", which is not a URL.
  const base = slugify(name, SLUG_BASE_MAX_LENGTH) || "product";

  if (!(await isSlugTaken(userId, base, exceptId))) {
    return base;
  }

  for (let suffix = 2; suffix < 100; suffix++) {
    const candidate = `${base}-${suffix}`;

    if (!(await isSlugTaken(userId, candidate, exceptId))) {
      return candidate;
    }
  }

  return `${base}-${Date.now().toString(36)}`;
}

/** Maps the validated form values onto the columns the DAL writes. */
function toRow(values: ProductValues, slug: string): ProductWrite {
  return {
    name: values.name,
    slug,
    tag: values.tag,
    description: values.description,
    // `numeric` is a string in Drizzle; normalise to 2dp so "48" and "48.00"
    // are stored identically.
    price: Number(values.price).toFixed(2),
    // Spread across three columns — see the schema. Non-null here because this
    // takes the *parsed* values, where the file is guaranteed; the columns are
    // nullable only for rows written before product files existed.
    fileKey: values.file.key,
    fileName: values.file.name,
    fileSize: values.file.size,
    // Stored as-is, order included — the first image is the product's cover.
    // Removing every image writes `[]`, never NULL.
    imageUrls: values.imageUrls,
  };
}

/**
 * Refresh every surface a product appears on: the seller's catalog and the
 * public storefront. The storefront pages are dynamic today, so this is
 * mostly insurance against them being cached later.
 */
function revalidateProduct(handle: string | null | undefined, id: number, slug: string) {
  revalidatePath("/products");
  revalidatePath(`/products/${id}`);

  if (handle) {
    revalidatePath(`/${handle}`);
    revalidatePath(`/${handle}/${id}/${slug}`);
  }
}

export async function createProduct(
  input: ProductValues,
): Promise<ProductActionResult> {
  // Ownership comes from the session, never from the payload.
  const user = await requireUser();
  const parsed = productSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? strings.errors.generic,
    };
  }

  const slug = await uniqueSlug(user.id, parsed.data.name);
  const row = await createProductForUser(user.id, toRow(parsed.data, slug));

  if (!row) {
    return { ok: false, error: strings.errors.generic };
  }

  revalidateProduct(user.handle, row.id, row.slug);

  return { ok: true, id: row.id, slug: row.slug };
}

export async function updateProduct(
  id: number,
  input: ProductValues,
): Promise<ProductActionResult> {
  const user = await requireUser();
  const parsed = productSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? strings.errors.generic,
    };
  }

  // Renaming re-derives the slug, so the URL keeps matching the product name.
  const slug = await uniqueSlug(user.id, parsed.data.name, id);

  // Passing user.id is what scopes the write to its owner — see the DAL.
  const row = await updateProductForUser(id, user.id, toRow(parsed.data, slug));

  if (!row) {
    return { ok: false, error: strings.errors.productNotFound };
  }

  revalidateProduct(user.handle, row.id, row.slug);

  return { ok: true, id: row.id, slug: row.slug };
}

/**
 * Retires a product. The row is soft-deleted rather than dropped (see the DAL),
 * so this stays a normal write from the action's point of view.
 *
 * There is no schema to validate — the only input is an id, and it is not
 * trusted: ownership comes from the session and is enforced inside the write's
 * WHERE clause, not by a check here.
 */
export async function deleteProduct(id: number): Promise<ProductActionResult> {
  const user = await requireUser();
  const row = await deleteProductForUser(id, user.id);

  if (!row) {
    return { ok: false, error: strings.errors.productNotFound };
  }

  revalidateProduct(user.handle, row.id, row.slug);

  return { ok: true, id: row.id, slug: row.slug };
}

export type DraftActionResult =
  | { ok: true; draft: ProductDraft }
  | { ok: false; error: string };

/**
 * Drafts a name, type and description for the product form. Writes nothing:
 * the text goes back into the form, and only reaches the row if the creator
 * saves it. Which fields the form actually fills is its own decision.
 *
 * Signed-in only (`requireUser`), because every call spends AI Gateway credit
 * — an open endpoint would let anyone drain the balance.
 */
export async function draftProduct(
  input: ProductDescriptionRequest,
): Promise<DraftActionResult> {
  const user = await requireUser();
  const parsed = productDescriptionRequestSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? strings.errors.generic,
    };
  }

  // The Gateway fetches this URL, so it has to be one of this app's own
  // uploads rather than whatever address the client sent.
  if (parsed.data.imageUrl && !isOwnStorageUrl(parsed.data.imageUrl)) {
    return { ok: false, error: strings.validation.productImage };
  }

  // The server downloads this file and hands its contents to the model. A key
  // that is another creator's product is their paid download, so it's refused
  // rather than summarised back to whoever sent it.
  if (
    parsed.data.file &&
    (await isFileKeyOfOtherSeller(parsed.data.file.key, user.id))
  ) {
    return { ok: false, error: strings.validation.productFile };
  }

  // The labels /explore already filters on, so a new product can join one of
  // them rather than start a near-duplicate spelling.
  const knownTypes = (await listProductTypes()).map((facet) => facet.type);
  const draft = await generateProductDraft(parsed.data, knownTypes);

  if (!draft) {
    return { ok: false, error: strings.errors.descriptionGeneration };
  }

  return { ok: true, draft };
}
