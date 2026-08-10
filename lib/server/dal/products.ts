import "server-only";

import { cache } from "react";
import {
  and,
  asc,
  desc,
  eq,
  ilike,
  inArray,
  isNull,
  ne,
  or,
  sql,
} from "drizzle-orm";

import {
  isSearchable,
  SEARCH_RESULT_LIMIT,
  type ProductTypeFacet,
  type SearchSort,
} from "@/lib/schemas/search";
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

/** A search hit carries its creator's handle, so the card can build a URL. */
export type ProductSearchResult = Product & { handle: string };

/**
 * Resolves the product ids in a cart cookie to rows to display.
 *
 * Carries the creator's handle for the same reason `searchProducts` does: a
 * cart spans storefronts, so each row needs its own `/handle/id/slug` link.
 *
 * `isLive` here is what makes a soft-deleted product disappear from a cart that
 * still lists it — the id simply resolves to nothing and the caller drops it.
 * The cart cookie itself is left stale, because a page can't write cookies; the
 * next add or remove prunes it.
 *
 * Deliberately **not** wrapped in `cache()`. As noted on `searchProducts`,
 * `cache()` memoizes on argument identity, and an array argument is a fresh
 * object on every call — the entry would be written and never read.
 */
export async function listProductsByIds(
  ids: readonly number[],
): Promise<ProductSearchResult[]> {
  // `inArray` with an empty list is a SQL syntax error in some dialects and a
  // guaranteed-empty scan at best. Answer without a round trip.
  if (ids.length === 0) {
    return [];
  }

  return db
    .select({ ...publicColumns, handle: user.handle })
    .from(productsTable)
    .innerJoin(user, eq(user.id, productsTable.userId))
    .where(and(inArray(productsTable.id, [...ids]), isLive));
}

/**
 * Does this id name a product someone can still buy?
 *
 * The validation behind `addToCart`: the cart is a cookie the server writes on
 * request, so without this any integer could be pushed into it and would then
 * have to be filtered out of every read forever.
 */
export const isLiveProduct = cache(async (id: number): Promise<boolean> => {
  const [row] = await db
    .select({ id: productsTable.id })
    .from(productsTable)
    .where(and(eq(productsTable.id, id), isLive))
    .limit(1);

  return Boolean(row);
});

/**
 * Escapes the LIKE metacharacters in a user's search term.
 *
 * `ilike()` parameterizes the *value*, so there is no injection risk here — but
 * `%`, `_` and `\` keep their pattern meaning inside that value. Without this,
 * searching for "50%" matches every product whose description contains "50"
 * followed by anything, and a lone "_" matches the entire catalog.
 *
 * The backslash must be replaced first, or the escapes added for `%` and `_`
 * would themselves get escaped on a later pass.
 */
function escapeLike(term: string) {
  return term.replace(/[\\%_]/g, (character) => `\\${character}`);
}

/**
 * Platform-wide product search for /explore, newest or oldest first.
 *
 * Two modes, deliberately one function: with a term at or above
 * `MIN_SEARCH_LENGTH` it filters, and below that the predicate is dropped
 * entirely and it browses the most recent products. The page needs both and
 * they differ by one clause, so splitting them would duplicate the join, the
 * `isLive` filter and the ordering.
 *
 * Scoped to nobody: the viewer's own products are included like everyone
 * else's. An earlier version excluded them — "you can't buy your own" — but
 * that also hid the creator's own product types from the filter, which made
 * the page look broken to the person best placed to notice. Consistency with
 * `listProductTypes` matters more than the tidiness of the results, and the two
 * must carry the same predicates or a facet count stops matching its filter.
 *
 * Matching is `ILIKE '%term%'` on name and description. That's a substring
 * match, not a ranked one — a term in a product's name sorts no higher than one
 * buried in a description, because the ORDER BY is purely by date. Ranking
 * would want `similarity()` or a tsvector; this is the agreed starting point.
 *
 * `type` and the `min`/`max` price bounds narrow further and compose with the
 * search rather than replacing it — every predicate present is ANDed. Each is
 * independently optional, so a max with no min reads as "under $25".
 */
export const searchProducts = cache(
  async (
    // Positional primitives rather than an options object: `cache()` memoizes
    // on argument identity, and a fresh object literal per call would never
    // hit. Matches the other reads in this file.
    query: string,
    sort: SearchSort,
    /** The product "Type" (`tag`) to narrow to; empty means every type. */
    type: string,
    /** Inclusive price bounds as decimal strings; empty means unbounded. */
    min: string,
    max: string,
  ): Promise<ProductSearchResult[]> => {
    // Only filter once the term can actually drive the trigram index. Below
    // the floor this stays undefined and `and()` ignores it, which is what
    // makes an empty box a browse rather than an empty result set.
    const matches = isSearchable(query)
      ? or(
          ilike(productsTable.name, `%${escapeLike(query.trim())}%`),
          ilike(productsTable.description, `%${escapeLike(query.trim())}%`),
        )
      : undefined;

    // Compared case-insensitively, and not optional politeness: the catalog
    // already contains both "Test" and "test" as spellings of one type. An
    // `eq()` here would split them into two filters that each hide half the
    // products. Mirrors how handles are matched in dal/creators.ts.
    const matchesType = type
      ? sql`lower(${productsTable.tag}) = ${type.toLowerCase()}`
      : undefined;

    // Cast the bound explicitly. `price` is `numeric` and these arrive as
    // strings, so without ::numeric Postgres would compare them as text —
    // where "9.00" sorts above "10.00" and the filter quietly lies.
    //
    // Inclusive on both ends: a max of 50 should include a product priced
    // exactly 50, which is what someone setting that bound expects.
    const matchesMin = min
      ? sql`${productsTable.price} >= ${min}::numeric`
      : undefined;
    const matchesMax = max
      ? sql`${productsTable.price} <= ${max}::numeric`
      : undefined;

    return db
      .select({ ...publicColumns, handle: user.handle })
      .from(productsTable)
      .innerJoin(user, eq(user.id, productsTable.userId))
      .where(and(isLive, matches, matchesType, matchesMin, matchesMax))
      .orderBy(
        sort === "oldest"
          ? asc(productsTable.createdAt)
          : desc(productsTable.createdAt),
      )
      .limit(SEARCH_RESULT_LIMIT);
  },
);

/**
 * The product types on offer, most common first, for the /explore filter.
 *
 * Grouped by `lower(tag)` rather than `tag`, because the column is free text
 * typed per product: the catalog already holds both "Test" and "test", which
 * ungrouped would render as two chips that each find half the products. The
 * label shown is the most common spelling of the group (alphabetical on a tie,
 * so the choice is stable between requests rather than whatever the planner
 * happened to return first).
 *
 * Carries exactly the same row-visibility predicate as the search — `isLive`,
 * and nothing else — so the filter can never offer a type that yields nothing.
 * If a predicate is ever added to one of these two queries it has to be added
 * to the other, or a facet's count stops matching what clicking it returns.
 *
 * One deliberate difference: this ignores the current search term and price
 * bounds. Facets that disappeared as you typed would make the filter shift
 * under the cursor.
 */
export const listProductTypes = cache(
  async (): Promise<ProductTypeFacet[]> => {
    const rows = await db
      .select({
        type: sql<string>`mode() within group (order by ${productsTable.tag})`,
        products: sql<number>`count(*)::int`,
      })
      .from(productsTable)
      .where(isLive)
      .groupBy(sql`lower(${productsTable.tag})`)
      .orderBy(
        sql`count(*) desc`,
        sql`mode() within group (order by ${productsTable.tag}) asc`,
      );

    return rows;
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
