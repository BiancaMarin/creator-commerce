"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";

import { strings } from "@/constants/strings";
import { productSchema, type ProductValues } from "@/lib/schemas/product";
import { requireUser } from "@/lib/server/dal/session";
import { isSlugTaken } from "@/lib/server/dal/products";
import db from "@/lib/server/db";
import { productsTable } from "@/lib/server/db/schemas/product";
import { slugify } from "@/lib/slug";

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

/** Shared shape written on both create and update. */
function toRow(values: ProductValues, slug: string) {
  return {
    name: values.name,
    slug,
    tag: values.tag,
    description: values.description,
    // `numeric` is a string in Drizzle; normalise to 2dp so "48" and "48.00"
    // are stored identically.
    price: Number(values.price).toFixed(2),
    files: values.files || null,
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

  const [row] = await db
    .insert(productsTable)
    .values({ ...toRow(parsed.data, slug), userId: user.id })
    .returning({ id: productsTable.id, slug: productsTable.slug });

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

  const [row] = await db
    .update(productsTable)
    .set({ ...toRow(parsed.data, slug), updatedAt: new Date() })
    // The userId predicate is the authorization check: a product belonging to
    // someone else simply matches no rows.
    .where(and(eq(productsTable.id, id), eq(productsTable.userId, user.id)))
    .returning({ id: productsTable.id, slug: productsTable.slug });

  if (!row) {
    return { ok: false, error: strings.errors.productNotFound };
  }

  revalidateProduct(user.handle, row.id, row.slug);

  return { ok: true, id: row.id, slug: row.slug };
}
