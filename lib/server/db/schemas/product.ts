import { sql } from "drizzle-orm";
import {
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
    files: varchar({ length: 160 }),
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
  ],
);
