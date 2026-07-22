import "server-only";

import { cache } from "react";
import { and, asc, desc, eq, ne, sql } from "drizzle-orm";

import db from "@/lib/server/db";
import { user } from "@/lib/server/db/schemas/auth";
import { productsTable } from "@/lib/server/db/schemas/product";

export type Product = typeof productsTable.$inferSelect;

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
  createdAt: productsTable.createdAt,
  updatedAt: productsTable.updatedAt,
};

/** The seller's catalog, newest first. */
export const listProductsForUser = cache(
  async (userId: string): Promise<Product[]> => {
    return db
      .select()
      .from(productsTable)
      .where(eq(productsTable.userId, userId))
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
      .where(and(eq(productsTable.id, id), eq(productsTable.userId, userId)))
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
      .where(sql`lower(${user.handle}) = ${handle.toLowerCase()}`)
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
        ),
      )
      .limit(1);

    return row ?? null;
  },
);

/**
 * Is this slug already used inside this creator's storefront? Slugs are only
 * unique per user, and `exceptId` lets an edit keep its own slug.
 */
export async function isSlugTaken(
  userId: string,
  slug: string,
  exceptId?: number,
) {
  const matches = and(
    eq(productsTable.userId, userId),
    eq(productsTable.slug, slug),
  );

  const [row] = await db
    .select({ id: productsTable.id })
    .from(productsTable)
    .where(exceptId ? and(matches, ne(productsTable.id, exceptId)) : matches)
    .limit(1);

  return Boolean(row);
}
