import "server-only";

import { cache } from "react";
import { and, asc, desc, eq, inArray, sql } from "drizzle-orm";

import db from "@/lib/server/db";
import { user } from "@/lib/server/db/schemas/auth";
import { orderItemsTable, ordersTable } from "@/lib/server/db/schemas/order";
import { productsTable } from "@/lib/server/db/schemas/product";

export type Order = typeof ordersTable.$inferSelect;
export type OrderItem = typeof orderItemsTable.$inferSelect;

/**
 * The lifecycle of an order. `pending` is written before the buyer leaves for
 * Stripe; every other value is written by the webhook
 * (app/api/stripe/webhook/route.ts) and nowhere else.
 */
export const ORDER_STATUS = {
  pending: "pending",
  paid: "paid",
  failed: "failed",
  refunded: "refunded",
} as const;

export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];

/** One line to record, resolved from a live product by the caller. */
export type PendingItem = {
  productId: number;
  sellerId: string;
  name: string;
  /** Minor units — see lib/server/money.ts. */
  unitAmount: number;
  currency: string;
};

/**
 * Opens an order in `pending` and records what it is for.
 *
 * Written before the redirect to Stripe so the webhook has a row to find. The
 * amount here is what the *cart* came to; the webhook overwrites it with what
 * Stripe actually charged, which is the figure that counts.
 *
 * Not a transaction: `@neondatabase/serverless` over HTTP has no interactive
 * transaction, so this is two round trips. The failure it can leave behind is
 * an order with no lines, which is inert — it stays `pending`, it never reaches
 * Stripe (the caller throws before creating the session), and no read in this
 * file looks at anything but paid orders. That is a better failure than the
 * alternative shape, where a paid session has no order to attach itself to.
 */
export async function createPendingOrder(
  buyerId: string,
  email: string,
  items: readonly PendingItem[],
): Promise<number> {
  if (items.length === 0) {
    throw new Error("Refusing to open an order with no items");
  }

  const amountTotal = items.reduce((sum, item) => sum + item.unitAmount, 0);

  const [order] = await db
    .insert(ordersTable)
    .values({
      buyerId,
      email,
      amountTotal,
      currency: items[0].currency,
      status: ORDER_STATUS.pending,
    })
    .returning({ id: ordersTable.id });

  if (!order) {
    throw new Error("Could not open an order");
  }

  await db
    .insert(orderItemsTable)
    .values(items.map((item) => ({ ...item, orderId: order.id })));

  return order.id;
}

/**
 * Records which Checkout Session belongs to this order.
 *
 * A separate step from the insert because the session cannot be created until
 * the order exists — the session carries the order id in its metadata and its
 * success URL, so the two references would otherwise be circular.
 */
export async function attachCheckoutSession(
  orderId: number,
  stripeSessionId: string,
): Promise<void> {
  await db
    .update(ordersTable)
    .set({ stripeSessionId })
    .where(eq(ordersTable.id, orderId));
}

/**
 * Marks an order paid. **The only place an order becomes `paid`.**
 *
 * Idempotent by predicate, not by check-then-write: the `status = 'pending'`
 * clause means a redelivered webhook — Stripe retries, and it can deliver the
 * same event more than once — updates zero rows the second time instead of
 * re-stamping `paid_at` or double-counting revenue. Returns whether this call
 * was the one that did it, so the caller can log the difference.
 *
 * The amount comes from Stripe rather than from the order's own `amountTotal`,
 * because Stripe is what actually charged the card.
 */
export async function markOrderPaid(
  stripeSessionId: string,
  paid: {
    stripePaymentIntentId: string | null;
    amountTotal: number;
    currency: string;
  },
): Promise<boolean> {
  const rows = await db
    .update(ordersTable)
    .set({
      status: ORDER_STATUS.paid,
      paidAt: new Date(),
      stripePaymentIntentId: paid.stripePaymentIntentId,
      amountTotal: paid.amountTotal,
      currency: paid.currency.toUpperCase(),
    })
    .where(
      and(
        eq(ordersTable.stripeSessionId, stripeSessionId),
        eq(ordersTable.status, ORDER_STATUS.pending),
      ),
    )
    .returning({ id: ordersTable.id });

  return rows.length > 0;
}

/**
 * Closes out a session that expired or whose payment failed. Same idempotence
 * as `markOrderPaid`, and it deliberately cannot touch a `paid` order: Stripe
 * can deliver `checkout.session.expired` after a late success, and that must
 * not revoke a download the buyer already paid for.
 */
export async function markOrderFailed(
  stripeSessionId: string,
): Promise<boolean> {
  const rows = await db
    .update(ordersTable)
    .set({ status: ORDER_STATUS.failed })
    .where(
      and(
        eq(ordersTable.stripeSessionId, stripeSessionId),
        eq(ordersTable.status, ORDER_STATUS.pending),
      ),
    )
    .returning({ id: ordersTable.id });

  return rows.length > 0;
}

/** A stale `pending` order, as the expiry sweep sees it. */
export type StalePendingOrder = {
  id: number;
  stripeSessionId: string | null;
};

/**
 * `pending` orders older than `minutes` — checkouts that were opened and, on
 * the face of it, never finished.
 *
 * Deliberately returns candidates rather than closing them itself. "Old and
 * still pending" is not proof of abandonment: the webhook may simply be late,
 * or never configured (which is the normal state in local development). Each
 * one is checked against Stripe before anything is written — see
 * `expireStalePendingOrders` in lib/server/checkout.ts.
 *
 * `created_at`, not `paid_at`: the row is pending, so it has no `paid_at`. The
 * clock starts when the buyer left for Stripe.
 *
 * `sellerId` narrows to one creator's orders, for the cheap opportunistic sweep
 * on their own Orders page. Omit it for the cron sweep, which covers everyone.
 */
export const listStalePendingOrders = cache(
  async (
    minutes: number,
    options: { sellerId?: string; limit?: number } = {},
  ): Promise<StalePendingOrder[]> => {
    const { sellerId, limit = 50 } = options;

    // Computed by Postgres rather than from a JS `Date`, so the cutoff uses the
    // same clock the rows were stamped with. A drifting app server would
    // otherwise expire orders early or never.
    const isStale = sql`${ordersTable.createdAt} < now() - (${minutes} || ' minutes')::interval`;

    if (!sellerId) {
      return db
        .select({
          id: ordersTable.id,
          stripeSessionId: ordersTable.stripeSessionId,
        })
        .from(ordersTable)
        .where(and(eq(ordersTable.status, ORDER_STATUS.pending), isStale))
        .orderBy(ordersTable.id)
        .limit(limit);
    }

    // DISTINCT because an order can hold several of this seller's lines and
    // would otherwise come back once per line.
    return db
      .selectDistinct({
        id: ordersTable.id,
        stripeSessionId: ordersTable.stripeSessionId,
      })
      .from(ordersTable)
      .innerJoin(
        orderItemsTable,
        eq(orderItemsTable.orderId, ordersTable.id),
      )
      .where(
        and(
          eq(ordersTable.status, ORDER_STATUS.pending),
          eq(orderItemsTable.sellerId, sellerId),
          isStale,
        ),
      )
      .orderBy(ordersTable.id)
      .limit(limit);
  },
);

/**
 * Deletes an expired checkout, by order id.
 *
 * The row is removed rather than marked `failed`: an abandoned checkout is
 * noise, not history, and leaving it behind would clutter the seller's Orders
 * page with sales that never happened.
 *
 * **`status = 'pending'` is the safety catch, and it is not optional.** A
 * delete cannot be undone by a late webhook the way a status can be corrected,
 * so this must never be able to touch a paid order. Callers verify with Stripe
 * *before* calling — see `expireStalePendingOrders` — and this predicate is the
 * second line of defence if a payment settles between that check and this
 * write.
 *
 * `order_items` rows go with it: the foreign key is `ON DELETE CASCADE` (see
 * db/schemas/order.ts), so one statement clears both.
 *
 * Keyed by id rather than by session, because an order whose session was never
 * created has no session to key on — the residue `startCheckout` leaves if
 * Stripe is unreachable between the insert and the session call.
 */
export async function deletePendingOrder(orderId: number): Promise<boolean> {
  const rows = await db
    .delete(ordersTable)
    .where(
      and(
        eq(ordersTable.id, orderId),
        eq(ordersTable.status, ORDER_STATUS.pending),
      ),
    )
    .returning({ id: ordersTable.id });

  return rows.length > 0;
}

/**
 * The same delete, keyed by Stripe session — for the `checkout.session.expired`
 * webhook, which knows the session and not the order.
 *
 * Same `pending` guard, for the same reason: Stripe can deliver `expired` after
 * a late success, and that must not delete a purchase the buyer paid for.
 */
export async function deletePendingOrderBySession(
  stripeSessionId: string,
): Promise<boolean> {
  const rows = await db
    .delete(ordersTable)
    .where(
      and(
        eq(ordersTable.stripeSessionId, stripeSessionId),
        eq(ordersTable.status, ORDER_STATUS.pending),
      ),
    )
    .returning({ id: ordersTable.id });

  return rows.length > 0;
}

/** An order with its lines, as the receipt page shows it. */
export type OrderReceipt = {
  id: number;
  status: string;
  amountTotal: number;
  currency: string;
  email: string;
  createdAt: Date;
  items: { productId: number; name: string; unitAmount: number }[];
};

/**
 * The order behind a Checkout Session, for the receipt page.
 *
 * Scoped to the buyer, and that scoping *is* the authorization: the session id
 * arrives in a query parameter Stripe put there, and a query parameter is
 * something anyone can retype. Making `buyer_id` part of the lookup means
 * someone else's session id simply finds nothing.
 *
 * Returns the order whatever its status. A receipt reached before the webhook
 * has landed is still `pending`, and the page says so rather than 404ing on a
 * payment that did go through.
 */
export const getOrderForBuyerBySession = cache(
  async (
    stripeSessionId: string,
    buyerId: string,
  ): Promise<OrderReceipt | null> => {
    const [order] = await db
      .select({
        id: ordersTable.id,
        status: ordersTable.status,
        amountTotal: ordersTable.amountTotal,
        currency: ordersTable.currency,
        email: ordersTable.email,
        createdAt: ordersTable.createdAt,
      })
      .from(ordersTable)
      .where(
        and(
          eq(ordersTable.stripeSessionId, stripeSessionId),
          eq(ordersTable.buyerId, buyerId),
        ),
      )
      .limit(1);

    if (!order) {
      return null;
    }

    const items = await db
      .select({
        productId: orderItemsTable.productId,
        name: orderItemsTable.name,
        unitAmount: orderItemsTable.unitAmount,
      })
      .from(orderItemsTable)
      .where(eq(orderItemsTable.orderId, order.id))
      .orderBy(orderItemsTable.id);

    return { ...order, items };
  },
);

/** A row of the seller's Orders table: one line, with who bought it. */
export type SellerOrderRow = {
  orderId: number;
  status: string;
  createdAt: Date;
  buyerName: string;
  buyerEmail: string;
  productName: string;
  amount: number;
  currency: string;
};

/**
 * Every line billed to this creator, newest first — the /orders page.
 *
 * Lines, not orders: a cart can span storefronts, so an order that includes
 * another creator's product must show this seller only their own line and only
 * their own money. Filtering on `order_items.seller_id` is what enforces that;
 * there is no seller column on `orders` to get it wrong with.
 *
 * Pending orders are included. An abandoned checkout is real information to a
 * seller — it is the difference between "nobody visited" and "three people
 * reached the payment page" — and the status badge already distinguishes them.
 */
export const listOrdersForSeller = cache(
  async (sellerId: string, limit = 50): Promise<SellerOrderRow[]> => {
    return db
      .select({
        orderId: ordersTable.id,
        status: ordersTable.status,
        createdAt: ordersTable.createdAt,
        buyerName: user.name,
        buyerEmail: ordersTable.email,
        productName: orderItemsTable.name,
        amount: orderItemsTable.unitAmount,
        currency: orderItemsTable.currency,
      })
      .from(orderItemsTable)
      .innerJoin(ordersTable, eq(ordersTable.id, orderItemsTable.orderId))
      .innerJoin(user, eq(user.id, ordersTable.buyerId))
      .where(eq(orderItemsTable.sellerId, sellerId))
      .orderBy(desc(ordersTable.createdAt), desc(orderItemsTable.id))
      .limit(limit);
  },
);

/** What a seller has actually earned. Paid orders only. */
export type SellerRevenue = {
  /** Minor units. */
  grossAmount: number;
  paidOrders: number;
};

export const getRevenueForSeller = cache(
  async (sellerId: string): Promise<SellerRevenue> => {
    const [row] = await db
      .select({
        // COALESCE, because SUM over no rows is NULL and a creator with no
        // sales yet should read as $0.00, not as a crash.
        grossAmount: sql<number>`coalesce(sum(${orderItemsTable.unitAmount}), 0)::int`,
        paidOrders: sql<number>`count(distinct ${ordersTable.id})::int`,
      })
      .from(orderItemsTable)
      .innerJoin(ordersTable, eq(ordersTable.id, orderItemsTable.orderId))
      .where(
        and(
          eq(orderItemsTable.sellerId, sellerId),
          eq(ordersTable.status, ORDER_STATUS.paid),
        ),
      );

    return row ?? { grossAmount: 0, paidOrders: 0 };
  },
);

/**
 * The dashboard's headline numbers, each as a 30-day window against the 30
 * days before it.
 *
 * One query rather than six: every figure comes from the same join and the
 * same `paid` filter, and `FILTER (WHERE …)` lets Postgres slice the windows
 * in a single pass. Six round trips to Neon over HTTP would also be six
 * chances for the windows to disagree about what "now" means.
 */
export type SellerStats = {
  /** Minor units, last 30 days. */
  revenue: number;
  revenuePrevious: number;
  orders: number;
  ordersPrevious: number;
  /** Distinct buyers in the window. */
  customers: number;
  customersPrevious: number;
  /** Gross, all time — what the seller has ever earned. */
  revenueAllTime: number;
};

export const getSellerStats = cache(
  async (sellerId: string): Promise<SellerStats> => {
    // Windowed on `paid_at`, not `created_at`: an abandoned checkout has a
    // created_at but never earned anything, and `status = 'paid'` already
    // guarantees paid_at is set.
    const current = sql`${ordersTable.paidAt} >= now() - interval '30 days'`;
    const previous = sql`${ordersTable.paidAt} >= now() - interval '60 days' and ${ordersTable.paidAt} < now() - interval '30 days'`;

    const [row] = await db
      .select({
        // COALESCE on every sum: over no rows SUM is NULL, and a new creator's
        // dashboard should read $0.00 rather than crash formatting null.
        revenue: sql<number>`coalesce(sum(${orderItemsTable.unitAmount}) filter (where ${current}), 0)::int`,
        revenuePrevious: sql<number>`coalesce(sum(${orderItemsTable.unitAmount}) filter (where ${previous}), 0)::int`,
        // DISTINCT on the order, because one order can hold several of this
        // seller's lines and that is still one sale.
        orders: sql<number>`count(distinct ${ordersTable.id}) filter (where ${current})::int`,
        ordersPrevious: sql<number>`count(distinct ${ordersTable.id}) filter (where ${previous})::int`,
        customers: sql<number>`count(distinct ${ordersTable.buyerId}) filter (where ${current})::int`,
        customersPrevious: sql<number>`count(distinct ${ordersTable.buyerId}) filter (where ${previous})::int`,
        revenueAllTime: sql<number>`coalesce(sum(${orderItemsTable.unitAmount}), 0)::int`,
      })
      .from(orderItemsTable)
      .innerJoin(ordersTable, eq(ordersTable.id, orderItemsTable.orderId))
      .where(
        and(
          eq(orderItemsTable.sellerId, sellerId),
          eq(ordersTable.status, ORDER_STATUS.paid),
        ),
      );

    return (
      row ?? {
        revenue: 0,
        revenuePrevious: 0,
        orders: 0,
        ordersPrevious: 0,
        customers: 0,
        customersPrevious: 0,
        revenueAllTime: 0,
      }
    );
  },
);

/**
 * Parses a `timestamp` string returned by an aggregate into a `Date`.
 *
 * Needed because a value produced by `max()` (or any expression) bypasses
 * Drizzle's column mapper: a real column arrives as a `Date`, an aggregated one
 * as the driver's raw string, and rendering that through `Intl.DateTimeFormat`
 * throws `RangeError: Invalid time value`.
 *
 * The `+0000` matches what Drizzle's own `timestamp` mapper does. The column is
 * `timestamp` **without** time zone and everything written to it is UTC, so
 * without the suffix the string would be read as local time and the date could
 * land on the wrong day either side of midnight.
 *
 * Returns null rather than an Invalid Date for anything unparseable, so a bad
 * value shows as "—" instead of taking the page down.
 */
function toDate(value: string | null): Date | null {
  if (!value) {
    return null;
  }

  const parsed = new Date(`${value.replace(" ", "T")}+0000`);

  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

/** A row of the seller's Customers table: one buyer, aggregated. */
export type SellerCustomer = {
  buyerId: string;
  name: string;
  email: string;
  orders: number;
  /** Minor units spent **with this seller**, not across the platform. */
  spent: number;
  currency: string;
  lastOrderAt: Date | null;
};

/**
 * Everyone who has bought from this creator, biggest spender first.
 *
 * "Customer" is scoped to the seller in two ways that both matter: the rows
 * are filtered on `order_items.seller_id`, and the sum only adds up *this
 * seller's* lines. A buyer who spent $200 across the platform but $10 here
 * shows as $10 — anything else would report someone else's revenue as this
 * creator's lifetime value.
 *
 * `count(distinct o.id)` rather than `count(*)`: an order containing two of
 * this seller's products is one order, not two.
 *
 * Paid only. A pending checkout hasn't made anyone a customer yet, and
 * counting it would inflate lifetime value with money never received.
 *
 * The email comes from the `user` row, not `orders.email`: this table is about
 * the person, so it should follow their current account address rather than
 * whichever address a receipt happened to go to.
 */
export const listCustomersForSeller = cache(
  async (sellerId: string, limit = 100): Promise<SellerCustomer[]> => {
    const rows = await db
      .select({
        buyerId: user.id,
        name: user.name,
        email: user.email,
        orders: sql<number>`count(distinct ${ordersTable.id})::int`,
        spent: sql<number>`coalesce(sum(${orderItemsTable.unitAmount}), 0)::int`,
        // Every line of one seller's catalogue is priced in that catalogue's
        // currency today, so the max is simply "the" currency. Revisit if a
        // creator is ever allowed to price products in more than one.
        currency: sql<string>`max(${orderItemsTable.currency})`,
        // Typed as the string it actually is. `sql<Date>` would be a lie: the
        // generic is only an assertion, and a value produced by an aggregate
        // never passes through Drizzle's column mapper — so it arrives as the
        // raw driver string and `Intl.format` throws on it. Converted below.
        lastOrderAt: sql<string | null>`max(${ordersTable.paidAt})`,
      })
      .from(orderItemsTable)
      .innerJoin(ordersTable, eq(ordersTable.id, orderItemsTable.orderId))
      .innerJoin(user, eq(user.id, ordersTable.buyerId))
      .where(
        and(
          eq(orderItemsTable.sellerId, sellerId),
          eq(ordersTable.status, ORDER_STATUS.paid),
        ),
      )
      .groupBy(user.id, user.name, user.email)
      .orderBy(sql`sum(${orderItemsTable.unitAmount}) desc`, asc(user.name))
      .limit(limit);

    return rows.map((row) => ({
      ...row,
      lastOrderAt: toDate(row.lastOrderAt),
    }));
  },
);

/** A row of the dashboard's "Top products" list. */
export type TopProduct = {
  productId: number;
  name: string;
  /** Units sold, all time. */
  sales: number;
  /** Minor units earned. */
  revenue: number;
};

/**
 * This seller's best sellers, by units sold.
 *
 * Grouped on `product_id` with the name picked by `mode()` rather than grouped
 * on the name: `order_items.name` is a snapshot taken at purchase time, so a
 * product renamed halfway through its life would otherwise split into two rows
 * that each show half its sales. The label shown is its most common spelling,
 * tie-broken alphabetically so it's stable between requests — the same
 * treatment `listProductTypes` gives free-text tags.
 */
export const listTopProductsForSeller = cache(
  async (sellerId: string, limit = 4): Promise<TopProduct[]> => {
    return db
      .select({
        productId: orderItemsTable.productId,
        name: sql<string>`mode() within group (order by ${orderItemsTable.name})`,
        sales: sql<number>`count(*)::int`,
        revenue: sql<number>`coalesce(sum(${orderItemsTable.unitAmount}), 0)::int`,
      })
      .from(orderItemsTable)
      .innerJoin(ordersTable, eq(ordersTable.id, orderItemsTable.orderId))
      .where(
        and(
          eq(orderItemsTable.sellerId, sellerId),
          eq(ordersTable.status, ORDER_STATUS.paid),
        ),
      )
      .groupBy(orderItemsTable.productId)
      .orderBy(
        sql`count(*) desc`,
        sql`mode() within group (order by ${orderItemsTable.name}) asc`,
      )
      .limit(limit);
  },
);

/** A row of the buyer's Downloads page — something they own and can fetch. */
export type PurchaseRow = {
  orderId: number;
  productId: number;
  productName: string;
  productSlug: string;
  /**
   * The digital product's filename and size, or null for a product created
   * before product files existed. Enough to name the download; minting a URL
   * for it needs `products.file_key`, which this read deliberately leaves
   * behind until the signed-URL route exists to use it.
   */
  fileName: string | null;
  fileSize: number | null;
  handle: string;
  amount: number;
  currency: string;
  /**
   * When the payment cleared. Non-null in practice — `markOrderPaid` stamps it
   * in the same statement that sets `paid`, and this read returns paid orders
   * only — but the column is nullable, so callers get `createdAt` as a
   * fallback rather than a lie about the type.
   */
  paidAt: Date | null;
  startedAt: Date;
};

/**
 * Everything this buyer has paid for, newest first — the /downloads page.
 *
 * `paid` only. A pending order is a checkout someone walked away from, and
 * listing it here would offer a download that was never bought.
 *
 * Joins `products` for the file and the current slug, which is the one
 * place order history *should* follow the live product: the buyer wants
 * today's file, not a snapshot of its name. The soft-delete filter is
 * deliberately absent — a creator retiring a product must not delete it out of
 * the library of everyone who bought it.
 *
 * Ordered by `paid_at`, not `created_at`: those differ by however long the
 * buyer spent on Stripe's page, and two checkouts opened in either order can
 * settle in the other. What belongs at the top of a library is the most recent
 * *purchase*, which is when the money cleared. `created_at` breaks the tie for
 * the rows paid in the same instant, so the order is stable between requests.
 */
export const listPurchasesForBuyer = cache(
  async (buyerId: string): Promise<PurchaseRow[]> => {
    return db
      .select({
        orderId: ordersTable.id,
        productId: orderItemsTable.productId,
        productName: orderItemsTable.name,
        productSlug: productsTable.slug,
        fileName: productsTable.fileName,
        fileSize: productsTable.fileSize,
        handle: user.handle,
        amount: orderItemsTable.unitAmount,
        currency: orderItemsTable.currency,
        paidAt: ordersTable.paidAt,
        startedAt: ordersTable.createdAt,
      })
      .from(orderItemsTable)
      .innerJoin(ordersTable, eq(ordersTable.id, orderItemsTable.orderId))
      .innerJoin(productsTable, eq(productsTable.id, orderItemsTable.productId))
      .innerJoin(user, eq(user.id, orderItemsTable.sellerId))
      .where(
        and(
          eq(ordersTable.buyerId, buyerId),
          eq(ordersTable.status, ORDER_STATUS.paid),
        ),
      )
      .orderBy(desc(ordersTable.paidAt), desc(ordersTable.createdAt));
  },
);

/**
 * The entitlement check: has this buyer paid for this product?
 *
 * This is the question the download button has to ask — a receipt page is
 * reachable by typing its URL, so "they got here" is not proof of purchase.
 */
export const hasPurchasedProduct = cache(
  async (buyerId: string, productId: number): Promise<boolean> => {
    const [row] = await db
      .select({ id: orderItemsTable.id })
      .from(orderItemsTable)
      .innerJoin(ordersTable, eq(ordersTable.id, orderItemsTable.orderId))
      .where(
        and(
          eq(ordersTable.buyerId, buyerId),
          eq(orderItemsTable.productId, productId),
          eq(ordersTable.status, ORDER_STATUS.paid),
        ),
      )
      .limit(1);

    return Boolean(row);
  },
);

/**
 * Which of these products has the buyer already paid for? The batched form of
 * `hasPurchasedProduct`, for a listing that would otherwise ask the same
 * question once per card.
 */
export async function listPurchasedProductIds(
  buyerId: string,
  productIds: readonly number[],
): Promise<Set<number>> {
  if (productIds.length === 0) {
    return new Set();
  }

  const rows = await db
    .select({ productId: orderItemsTable.productId })
    .from(orderItemsTable)
    .innerJoin(ordersTable, eq(ordersTable.id, orderItemsTable.orderId))
    .where(
      and(
        eq(ordersTable.buyerId, buyerId),
        inArray(orderItemsTable.productId, [...productIds]),
        eq(ordersTable.status, ORDER_STATUS.paid),
      ),
    );

  return new Set(rows.map((row) => row.productId));
}
