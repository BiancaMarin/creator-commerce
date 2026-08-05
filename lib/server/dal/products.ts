import "server-only";

import { cache } from "react";
import { and, asc, desc, eq, isNull, ne, sql } from "drizzle-orm";

import db from "@/lib/server/db";
import { user } from "@/lib/server/db/schemas/auth";
import { productsTable } from "@/lib/server/db/schemas/product";

export type Product = typeof productsTable.$inferSelect;

/**
 * The columns a create or update writes. Derived from the table so adding a
 * column can't silently leave this behind, and deliberately without `userId`:
 * ownership is an argument to the write, never part of its payload.
 */
export type ProductWrite = Pick<
  typeof productsTable.$inferInsert,
  "name" | "slug" | "tag" | "description" | "price" | "files" | "imageUrls"
>;

/** What a write hands back — enough to build the product's URLs. */
export type ProductRef = Pick<Product, "id" | "slug">;

/**
 * Products are soft-deleted: `deleted_at` NULL means live. Every read below
 * carries this predicate — a missing one silently resurrects deleted products
 * on a storefront, which no test would catch.
 */
const isLive = isNull(productsTable.deletedAt);

/** Column list for public reads, which join `user` to resolve the handle. */
const publicColumns = {
  id: productsTable.id,
  userId: productsTable.userId,
  name: productsTable.name,
  slug: productsTable.slug,
  tag: productsTable.tag,
  description: productsTable.description,
  price: productsTable.price,
  currency: productsTable.currency,
  files: productsTable.files,
  imageUrls: productsTable.imageUrls,
  createdAt: productsTable.createdAt,
  updatedAt: productsTable.updatedAt,
  // Always NULL in practice — these reads filter on it — but kept so the
  // selection still satisfies `Product`.
  deletedAt: productsTable.deletedAt,
};

/** The seller's catalog, newest first. */
export const listProductsForUser = cache(
  async (userId: string): Promise<Product[]> => {
    return db
      .select()
      .from(productsTable)
      .where(and(eq(productsTable.userId, userId), isLive))
      .orderBy(desc(productsTable.createdAt));
  },
);

/**
 * One product, scoped to its owner. Ownership is part of the lookup rather
 * than a check afterwards, so an edit page can never load someone else's row.
 */
export const getProductForUser = cache(
  async (id: number, userId: string): Promise<Product | null> => {
    const [row] = await db
      .select()
      .from(productsTable)
      .where(
        and(eq(productsTable.id, id), eq(productsTable.userId, userId), isLive),
      )
      .limit(1);

    return row ?? null;
  },
);

/** The public catalog of a storefront, oldest first so ordering is stable. */
export const listProductsByHandle = cache(
  async (handle: string): Promise<Product[]> => {
    return db
      .select(publicColumns)
      .from(productsTable)
      .innerJoin(user, eq(user.id, productsTable.userId))
      .where(and(sql`lower(${user.handle}) = ${handle.toLowerCase()}`, isLive))
      .orderBy(asc(productsTable.createdAt));
  },
);

/**
 * A single product on a storefront. Keyed by handle *and* id so that
 * /alice/7/anything can't render a product belonging to bob.
 */
export const getProductByHandleAndId = cache(
  async (handle: string, id: number): Promise<Product | null> => {
    const [row] = await db
      .select(publicColumns)
      .from(productsTable)
      .innerJoin(user, eq(user.id, productsTable.userId))
      .where(
        and(
          sql`lower(${user.handle}) = ${handle.toLowerCase()}`,
          eq(productsTable.id, id),
          isLive,
        ),
      )
      .limit(1);

    return row ?? null;
  },
);

/**
 * Inserts a product owned by `userId`. Not wrapped in `cache()` — that is
 * request-level memoization for reads, and would be actively wrong on a write.
 */
export async function createProductForUser(
  userId: string,
  values: ProductWrite,
): Promise<ProductRef | null> {
  const [row] = await db
    .insert(productsTable)
    .values({ ...values, userId })
    .returning({ id: productsTable.id, slug: productsTable.slug });

  return row ?? null;
}

/**
 * Updates a product in place, scoped to its owner. Like `getProductForUser`,
 * the `userId` predicate *is* the authorization check rather than a test run
 * afterwards: someone else's product simply matches no rows, and the caller
 * gets `null` — indistinguishable from a product that never existed.
 */
export async function updateProductForUser(
  id: number,
  userId: string,
  values: ProductWrite,
): Promise<ProductRef | null> {
  const [row] = await db
    .update(productsTable)
    .set({ ...values, updatedAt: new Date() })
    .where(
      and(eq(productsTable.id, id), eq(productsTable.userId, userId), isLive),
    )
    .returning({ id: productsTable.id, slug: productsTable.slug });

  return row ?? null;
}

/**
 * Soft-deletes a product by stamping `deleted_at`. The row stays in the table,
 * so future order history keeps resolving, but every read here filters it out
 * and the storefront 404s it immediately.
 *
 * Scoped to its owner exactly like the update: someone else's product matches
 * no rows and comes back `null`, indistinguishable from one that never existed.
 * `isLive` also makes a second delete a no-op rather than re-stamping a newer
 * timestamp over the original.
 *
 * Releasing the slug is a side effect of the partial unique index on
 * `(user_id, slug) WHERE deleted_at IS NULL` — see schemas/product.ts. The
 * creator can re-create a product under the same name and get the same URL.
 */
export async function deleteProductForUser(
  id: number,
  userId: string,
): Promise<ProductRef | null> {
  const [row] = await db
    .update(productsTable)
    .set({ deletedAt: new Date() })
    .where(
      and(eq(productsTable.id, id), eq(productsTable.userId, userId), isLive),
    )
    .returning({ id: productsTable.id, slug: productsTable.slug });

  return row ?? null;
}

/**
 * Is this slug already used inside this creator's storefront? Slugs are only
 * unique per user, and `exceptId` lets an edit keep its own slug.
 *
 * `isLive` here must mirror the WHERE on the partial unique index exactly. If
 * the two ever disagree, one of two bugs follows: a stricter check hands out
 * pointless "-2" suffixes, and a looser one lets uniqueSlug propose a slug the
 * database then rejects with a constraint violation.
 */
export async function isSlugTaken(
  userId: string,
  slug: string,
  exceptId?: number,
) {
  const matches = and(
    eq(productsTable.userId, userId),
    eq(productsTable.slug, slug),
    isLive,
  );

  const [row] = await db
    .select({ id: productsTable.id })
    .from(productsTable)
    .where(exceptId ? and(matches, ne(productsTable.id, exceptId)) : matches)
    .limit(1);

  return Boolean(row);
}
