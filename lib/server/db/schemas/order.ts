import { sql } from "drizzle-orm";
import {
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

import { user } from "@/lib/server/db/schemas/auth";
import { productsTable } from "@/lib/server/db/schemas/product";

/**
 * One checkout attempt — a Stripe Checkout Session and its outcome.
 *
 * A row is written *before* the buyer is redirected to Stripe, in `pending`,
 * and only the webhook moves it to `paid`. That ordering is what makes the
 * webhook idempotent: it has a row to find rather than a row to invent, so a
 * redelivered event updates the same order instead of creating a second one.
 *
 * Money is stored in minor units (cents) as an integer, not `numeric` like
 * `products.price`. That is Stripe's unit — `amount_total` comes back as an
 * integer — and converting once at the boundary beats rounding a decimal
 * string on every comparison. The conversion lives in lib/server/money.ts.
 */
export const ordersTable = pgTable(
  "orders",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    // The buyer. Checkout is gated on a session (lib/actions/cart.ts), so this
    // is never anonymous.
    //
    // No cascade: deleting a user must not silently erase the sellers' revenue
    // history. `restrict` makes that deletion fail loudly instead.
    buyerId: text("buyer_id")
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),
    status: varchar({ length: 20 }).notNull().default("pending"),
    // Snapshot of Stripe's `amount_total`, in cents. Written by the webhook
    // from what Stripe actually charged, not from what the cart hoped to
    // charge — the two can differ, and Stripe is the one holding the money.
    amountTotal: integer("amount_total").notNull(),
    currency: varchar({ length: 3 }).notNull().default("USD"),
    // The email the receipt went to. Denormalized from the buyer on purpose:
    // it records where the receipt was actually sent, which stays true after
    // they later change their account email.
    email: text().notNull(),
    // Set when the Checkout Session is created; the webhook looks the order up
    // by this. Nullable only because the column would otherwise need a value
    // before Stripe has issued one — see `createPendingOrder`.
    stripeSessionId: text("stripe_session_id"),
    // Kept for reconciliation and refunds, which act on the PaymentIntent
    // rather than the session.
    stripePaymentIntentId: text("stripe_payment_intent_id"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    // NULL until the webhook confirms payment. Distinct from `createdAt`,
    // which is when the buyer *started* checkout — an abandoned session keeps
    // its created_at forever and never gets a paid_at.
    paidAt: timestamp("paid_at"),
  },
  (table) => [
    // The webhook's lookup key, and the guard that makes redelivery safe: two
    // orders can never claim the same session.
    //
    // Partial, because the column is NULL for the instant between the insert
    // and the session being attached — and NULLs are distinct in a plain
    // unique index, but a partial one keeps the intent explicit.
    uniqueIndex("orders_stripe_session_id_key")
      .on(table.stripeSessionId)
      .where(sql`${table.stripeSessionId} is not null`),

    // Backs the buyer's own purchase history (/downloads), newest first.
    index("orders_buyer_id_created_at_idx").on(
      table.buyerId,
      table.createdAt.desc(),
    ),

    // Serves the seller-facing reads, which only ever count paid orders.
    index("orders_status_created_at_idx").on(
      table.status,
      table.createdAt.desc(),
    ),
  ],
);

/**
 * A line on an order: one product, at the price it cost *then*.
 *
 * Separate from `orders` because a cart spans storefronts — `lib/actions/cart.ts`
 * lets a buyer collect products from several creators and pay once, so a single
 * order can owe money to more than one seller. That is also why `sellerId`
 * lives here and not on the order.
 *
 * Every display field is snapshotted rather than joined at read time. Products
 * are soft-deleted and freely renamed and repriced, so joining `products` for
 * a name or a price would silently rewrite order history the next time a
 * creator edited a listing. The `productId` reference is kept for entitlement
 * checks (does this buyer own this product?), not for display.
 */
export const orderItemsTable = pgTable(
  "order_items",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    orderId: integer("order_id")
      .notNull()
      .references(() => ordersTable.id, { onDelete: "cascade" }),
    // `restrict` mirrors the soft delete: nothing hard-deletes a product
    // (dal/products.ts stamps `deleted_at`), so this reference always resolves
    // and a sold product can't be erased out from under an order.
    productId: integer("product_id")
      .notNull()
      .references(() => productsTable.id, { onDelete: "restrict" }),
    // Who gets paid for this line. Denormalized from the product's owner at
    // purchase time, so the seller's order list stays correct even if the
    // product were ever reassigned.
    sellerId: text("seller_id")
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),
    // Snapshots — see the note above.
    name: varchar({ length: 255 }).notNull(),
    unitAmount: integer("unit_amount").notNull(),
    currency: varchar({ length: 3 }).notNull().default("USD"),
  },
  (table) => [
    // The join back from an order to its lines.
    index("order_items_order_id_idx").on(table.orderId),

    // The seller's Orders page: every line billed to this creator.
    index("order_items_seller_id_idx").on(table.sellerId),

    // The entitlement check — "has this buyer paid for this product?" — which
    // filters on the product and then joins up to a paid order.
    index("order_items_product_id_idx").on(table.productId),
  ],
);
