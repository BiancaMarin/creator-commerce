import { sql } from "drizzle-orm";
import {
  index,
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

import { user } from "@/lib/server/db/schemas/auth";

export const productsTable = pgTable(
  "products",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    // The owning creator. Products are always reached through a storefront,
    // so every row belongs to exactly one user.
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: varchar({ length: 255 }).notNull(),
    // Derived from `name` — the cosmetic segment of /:handle/:id/:slug.
    slug: varchar({ length: 60 }).notNull(),
    tag: varchar({ length: 60 }).notNull(),
    description: text().notNull(),
    // numeric maps to string in Drizzle: money never round-trips through a
    // float. Convert at the edges, not in the query layer.
    price: numeric({ precision: 10, scale: 2 }).notNull(),
    currency: varchar({ length: 3 }).notNull().default("USD"),
    // The digital product itself, uploaded through the `productFile` route in
    // app/api/uploadthing/core.ts. Three columns rather than one URL:
    //
    //  - `file_key` is UploadThing's storage key, and the only one delivery
    //    needs — a signed download URL is minted from it per request. The
    //    public https://<appId>.ufs.sh/f/<key> address is derivable from it and
    //    deliberately *not* stored, so no component can render an ungated
    //    download link by reaching for a convenient column.
    //  - `file_name` is the original filename. Shown to the buyer, and what the
    //    download should be saved as — a key is opaque.
    //  - `file_size` is bytes, capped at 100 MB (MAX_PRODUCT_FILE_BYTES in
    //    lib/schemas/product.ts), so integer is three orders of magnitude
    //    clear of overflowing.
    //
    // Nullable, though `productSchema` requires a file: products created before
    // this existed have none, and a NOT NULL column would have needed a lie to
    // backfill them. Every save from now on attaches one; a null means "predates
    // the feature", which is what the storefront and /downloads say.
    fileKey: varchar("file_key", { length: 512 }),
    fileName: varchar("file_name", { length: 255 }),
    fileSize: integer("file_size"),
    // Product images, uploaded through UploadThing (app/api/uploadthing/core.ts)
    // and stored in the `ufsUrl` form — https://<appId>.ufs.sh/f/<key> — since
    // the older `url`/`appUrl` fields are deprecated as of uploadthing v7.
    //
    // NOT NULL with a '{}' default rather than a nullable column: "no images" is
    // an empty array, so reads never have to branch on NULL before indexing, and
    // `imageUrls[0]` is simply undefined. Order is meaningful — the first entry
    // is the cover.
    imageUrls: varchar("image_urls", { length: 512 })
      .array()
      .notNull()
      .default([]),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
    // Soft delete. NULL means live; a timestamp means the creator removed it.
    // Nothing in the app hard-deletes a product, so every read has to filter
    // on this — see lib/server/dal/products.ts.
    deletedAt: timestamp("deleted_at"),
  },
  (table) => [
    // Slugs only need to be unique within a storefront — two creators can both
    // sell a "starter-pack".
    //
    // Partial on purpose: the constraint only applies to live rows, so deleting
    // a product releases its slug. Without the WHERE, a deleted "starter-pack"
    // would reserve that URL forever and a re-created one would silently become
    // "starter-pack-2".
    uniqueIndex("products_user_id_slug_key")
      .on(table.userId, table.slug)
      .where(sql`${table.deletedAt} is null`),

    // Backs the /explore search (lib/server/dal/products.ts → searchProducts).
    //
    // GIN + gin_trgm_ops, not B-tree: the search matches with ILIKE '%term%',
    // and a leading wildcard makes a B-tree useless — it can only seek on a
    // known prefix. Trigram indexes are the only kind that serve this shape.
    // The extension is installed by the migration before this one.
    //
    // Two indexes rather than one over `name || ' ' || description`: the query
    // ORs two separate predicates, and Postgres can BitmapOr two index scans,
    // whereas an expression index is only usable by that exact expression.
    //
    // Neither index seeks usefully below 3 characters: a shorter pattern
    // yields no complete trigram, so GIN reads the entire index and rechecks
    // every row instead of narrowing (measured here: estimated cost 304 for a
    // 2-character term vs 8.5 for a 3-character one). MIN_SEARCH_LENGTH in
    // lib/schemas/search.ts is that floor, which is why the minimum is a
    // storage constraint and not only a UX nicety.
    index("products_name_trgm_idx").using("gin", table.name.op("gin_trgm_ops")),
    index("products_description_trgm_idx").using(
      "gin",
      table.description.op("gin_trgm_ops"),
    ),

    // Serves the ORDER BY, and carries the whole query in the browse case where
    // there's no search term to filter on. Partial so it mirrors the `deleted_at
    // IS NULL` predicate every read in dal/products.ts already carries.
    index("products_created_at_idx")
      .on(table.createdAt.desc())
      .where(sql`${table.deletedAt} is null`),

    // The /explore type filter, and the GROUP BY behind its facet list. On the
    // expression rather than the bare column: both compare `lower(tag)`, since
    // the column is free text and "Test" and "test" are the same type. An index
    // on `tag` alone would go unused by either query.
    index("products_tag_lower_idx")
      .on(sql`lower(${table.tag})`)
      .where(sql`${table.deletedAt} is null`),

    // The /explore price range. A plain B-tree is the right shape here — unlike
    // the text search, a range scan is exactly what one is for.
    //
    // It competes with products_created_at_idx rather than combining with it:
    // the planner can use this to satisfy the range or that one to satisfy the
    // ORDER BY, not both, so which wins depends on how selective the bounds
    // are. That's the correct trade-off to leave to the planner.
    index("products_price_idx")
      .on(table.price)
      .where(sql`${table.deletedAt} is null`),
  ],
);
