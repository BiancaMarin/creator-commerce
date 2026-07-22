import {
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
  unique,
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
  },
  (table) => [
    // Slugs only need to be unique within a storefront — two creators can both
    // sell a "starter-pack".
    unique("products_user_id_slug_key").on(table.userId, table.slug),
  ],
);
