import "server-only";

import type Stripe from "stripe";

import { toCents } from "@/lib/server/money";
import { stripe } from "@/lib/server/stripe";
import {
  attachCheckoutSession,
  createPendingOrder,
  deletePendingOrder,
  getOrderForBuyerBySession,
  listStalePendingOrders,
  markOrderPaid,
  ORDER_STATUS,
  type OrderReceipt,
  type PendingItem,
} from "@/lib/server/dal/orders";
import type { ProductSearchResult } from "@/lib/server/dal/products";

/**
 * The query parameter carrying the finished Checkout Session id back to
 * /downloads. Exported so the page reading it and the URL writing it can't
 * drift apart.
 */
export const PURCHASE_PARAM = "purchase";

/**
 * How long a checkout stays open, in minutes.
 *
 * **One constant for two things that must agree**: the Stripe session's own
 * `expires_at`, and the age at which `expireStalePendingOrders` closes an
 * order. If the sweep were shorter than the session, a buyer could pay at
 * minute 45 against an order already written off — money taken, nothing
 * delivered. Raising one without the other reopens exactly that hole.
 *
 * 30 is not an arbitrary round number: it is Stripe's **minimum** for
 * `expires_at` (verified — a 10-minute session is rejected with "must be at
 * least 30 minutes from Checkout Session creation"). Stripe's default is 24
 * hours, which is why this has to be set explicitly.
 */
export const CHECKOUT_TTL_MINUTES = 30;

/**
 * The origin Stripe sends the buyer back to.
 *
 * Reuses `BETTER_AUTH_URL` rather than introducing a second "where does this
 * app live" variable: the two must always agree — a redirect back to a
 * different origin than the one holding the session cookie lands the buyer on
 * their receipt signed out — and one variable can't disagree with itself.
 */
function appOrigin(): string {
  const origin = process.env.BETTER_AUTH_URL;

  if (!origin) {
    throw new Error("BETTER_AUTH_URL is required to build checkout URLs");
  }

  return origin.replace(/\/$/, "");
}

/**
 * Turns live product rows into the lines of an order.
 *
 * Prices are read here, from the database, and never accepted from the caller.
 * The client knows what it displayed, but a client-supplied amount is an
 * amount an attacker can supply — the same reasoning that keeps the cart cookie
 * holding nothing but ids (lib/server/cart.ts).
 */
export function toPendingItems(
  products: readonly ProductSearchResult[],
): PendingItem[] {
  return products.map((product) => ({
    productId: product.id,
    sellerId: product.userId,
    name: product.name,
    unitAmount: toCents(product.price),
    currency: product.currency,
  }));
}

/**
 * Opens an order and hands back the Stripe-hosted page to send the buyer to.
 *
 * The order row is written **first**, in `pending`, and its id travels to
 * Stripe as session metadata. That ordering is what makes fulfilment reliable:
 * the webhook always has a row to find, so a payment can never complete against
 * an order that doesn't exist yet.
 *
 * Fulfilment happens in the webhook (app/api/stripe/webhook/route.ts) and not
 * on the success URL. The buyer can close the tab the moment the card clears,
 * and Stripe will still deliver the event — whereas a success page that grants
 * the download is both skippable and, being a plain GET, forgeable.
 */
export async function startCheckout({
  buyerId,
  email,
  products,
  cancelPath,
  storeHandle,
}: {
  buyerId: string;
  email: string;
  products: readonly ProductSearchResult[];
  /** Where "back" from Stripe lands. Must be a same-origin path. */
  cancelPath: string;
  /** The storefront the buyer came from, for the receipt's branding. */
  storeHandle?: string;
}): Promise<string> {
  const items = toPendingItems(products);
  const orderId = await createPendingOrder(buyerId, email, items);

  const origin = appOrigin();

  // Assembled by hand rather than with `URLSearchParams`, which percent-encodes
  // the braces: Stripe substitutes the literal `{CHECKOUT_SESSION_ID}` token on
  // redirect and does not recognise `%7BCHECKOUT_SESSION_ID%7D`. The page uses
  // the id to look the order up, so it can confirm what was bought without
  // trusting any other query parameter.
  const success = [
    `${PURCHASE_PARAM}={CHECKOUT_SESSION_ID}`,
    storeHandle ? `s=${encodeURIComponent(storeHandle)}` : null,
  ]
    .filter(Boolean)
    .join("&");

  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map(
    (item) => ({
      quantity: 1,
      price_data: {
        currency: item.currency.toLowerCase(),
        unit_amount: item.unitAmount,
        product_data: { name: item.name },
      },
    }),
  );

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: lineItems,
    // Without this Stripe keeps the session payable for 24 hours, and a buyer
    // paying at hour 3 would find their order already closed by the sweep.
    // Stripe stops accepting payment at this instant, which is what makes
    // expiring the order at the same age safe.
    expires_at: Math.floor(Date.now() / 1000) + CHECKOUT_TTL_MINUTES * 60,
    // Prefilled but still editable at Stripe — the receipt goes wherever the
    // buyer says, and `orders.email` records that rather than their account
    // address.
    customer_email: email,
    // Straight to the buyer's library. The thing they just paid for is a file,
    // so the useful destination is the page that lists their files — with the
    // new purchase confirmed at the top — rather than a receipt they'd have to
    // click through. /checkout/success stays as a redirect for any Stripe
    // session issued before this change.
    success_url: `${origin}/downloads?${success}`,
    cancel_url: `${origin}${cancelPath}`,
    // The webhook's fallback route back to the order when a session lookup by
    // id isn't enough, and the audit trail for anything reconciled by hand in
    // the Stripe dashboard.
    metadata: {
      orderId: String(orderId),
      buyerId,
    },
  });

  if (!session.url) {
    throw new Error(`Stripe returned a session with no URL (order ${orderId})`);
  }

  await attachCheckoutSession(orderId, session.id);

  return session.url;
}

/**
 * Turns a settled Checkout Session into a paid order. **The one place that
 * happens**, called by both routes that can learn a payment succeeded: the
 * webhook (app/api/stripe/webhook/route.ts) and `reconcileCheckoutSession`
 * below.
 *
 * Having exactly one of these matters more than the few lines it saves. The two
 * callers must agree on what "paid" means, which fields Stripe's payload maps
 * to which columns, and — most of all — that the write is idempotent. Two
 * copies of that would be two chances to drift, and the symptom of drift here
 * is money counted twice.
 *
 * Accepts an id or an already-retrieved session, because the two callers differ:
 * the webhook is handed the object in the event and must not spend a round trip
 * re-fetching it, while the return-URL path has only the id from the query
 * string.
 *
 * Returns whether *this* call was the one that promoted the order. `false` is
 * the ordinary outcome, not an error: it means the session isn't paid yet, or
 * something already fulfilled it — Stripe redelivers events by design, and the
 * webhook and the buyer's return can land at the same moment.
 */
export async function fulfillCheckoutSession(
  session: Stripe.Checkout.Session | string,
): Promise<boolean> {
  const resolved =
    typeof session === "string"
      ? await stripe.checkout.sessions.retrieve(session)
      : session;

  // The authority on whether money moved. `status: "complete"` is not enough —
  // an async payment method can complete the session while the payment is still
  // in flight, and fulfilling then would hand over a download for a payment
  // that can still fail.
  if (resolved.payment_status !== "paid") {
    return false;
  }

  const promoted = await markOrderPaid(resolved.id, {
    // A string unless Stripe was asked to expand it; normalize both shapes.
    stripePaymentIntentId:
      typeof resolved.payment_intent === "string"
        ? resolved.payment_intent
        : (resolved.payment_intent?.id ?? null),
    // Nullable in the type for sessions that never priced anything. A settled
    // payment always has one; fall back rather than crash.
    amountTotal: resolved.amount_total ?? 0,
    currency: resolved.currency ?? "usd",
  });

  if (promoted) {
    console.info(`[checkout] fulfilled session ${resolved.id}`);
  } else {
    // Not an error: the expected result of a redelivered event, a double
    // fulfilment race, or a session with no order row.
    console.info(`[checkout] no pending order for session ${resolved.id}`);
  }

  return promoted;
}

/**
 * The order behind a finished Checkout Session, catching it up if the webhook
 * hasn't landed yet.
 *
 * The webhook remains the primary path and the only *unprompted* one. This is
 * the safety net for the two ways it can leave a genuinely paid order stuck:
 * Stripe's delivery is delayed past this redirect, or it never arrives at all
 * (in local development, nothing reaches localhost unless `stripe listen` is
 * running — which is exactly how an order sat at `pending` after a successful
 * test payment).
 *
 * It is **not** optimistic marking, and it does not trust the URL. The query
 * parameter only names a session; whether that session was paid is then asked
 * of Stripe directly, and only Stripe's own `payment_status` can promote the
 * order. Someone pasting another buyer's session id gets nothing — the lookup
 * is scoped to `buyerId` before Stripe is ever called.
 *
 * Safe against the webhook running concurrently: both go through
 * `markOrderPaid`, whose `status = 'pending'` predicate means whichever lands
 * second updates no rows.
 */
export async function reconcileCheckoutSession(
  stripeSessionId: string,
  buyerId: string,
): Promise<OrderReceipt | null> {
  const order = await getOrderForBuyerBySession(stripeSessionId, buyerId);

  // No order, or one that already reached a terminal state — nothing to do.
  // A `failed` order is left alone deliberately: only the webhook's view of a
  // session's lifecycle should be able to reopen that question.
  if (!order || order.status !== ORDER_STATUS.pending) {
    return order;
  }

  let session;

  try {
    session = await stripe.checkout.sessions.retrieve(stripeSessionId);
  } catch (error) {
    // Stripe unreachable. The buyer still sees their library and a "confirming"
    // banner, and the webhook (or the next visit) will settle it.
    console.error(`[checkout] could not verify session ${stripeSessionId}`, error);

    return order;
  }

  // The shared write — same function the webhook calls, so the two paths can't
  // disagree about what gets recorded or race into a double count.
  const promoted = await fulfillCheckoutSession(session);

  if (!promoted && session.payment_status !== "paid") {
    return order;
  }

  if (promoted) {
    console.info(`[checkout] reconciled order ${order.id} from the return URL`);
  }

  // Returned as a fresh object rather than by re-reading: the read above is
  // wrapped in React `cache()`, so a second call in this same request would
  // hand back the pre-update row and the page would render "confirming" for a
  // purchase it just settled.
  //
  // Built from Stripe's figures for the same reason `fulfillCheckoutSession`
  // writes them — Stripe is what charged the card. The `??` fallbacks cover the
  // case where this call lost the race to the webhook: the order *is* paid,
  // just not by us.
  return {
    ...order,
    status: ORDER_STATUS.paid,
    amountTotal: session.amount_total ?? order.amountTotal,
    currency: (session.currency ?? order.currency).toUpperCase(),
  };
}

/** What a sweep did, for the caller to log or return. */
export type ExpirySweep = {
  /** Orders examined. */
  checked: number;
  /** Orders deleted. */
  deleted: number;
  /** Orders that turned out to be paid and were fulfilled instead. */
  fulfilled: number;
};

/**
 * Deletes `pending` orders older than `CHECKOUT_TTL_MINUTES`, so an abandoned
 * checkout leaves nothing behind.
 *
 * **Every candidate is checked against Stripe before it is deleted.** Age alone
 * is not evidence of abandonment — it is equally the signature of a webhook
 * that was delayed, retried, or (the normal case in local development) never
 * configured at all. An order that turns out to be paid is *fulfilled* here
 * instead of deleted.
 *
 * That check is not belt-and-braces, it is the thing that makes deletion
 * survivable. A status can be corrected by a later webhook; a deleted row
 * cannot. Delete a genuinely paid order and the money is taken, the buyer has
 * no download, the seller has no record, and nothing in this system can heal
 * it — `markOrderPaid` has no row left to promote.
 *
 * Two things narrow that risk before the check even runs: `expires_at` means
 * Stripe stops accepting payment at the same age the sweep starts collecting,
 * and `deletePendingOrder` re-asserts `status = 'pending'` in the delete
 * itself, so a payment settling between the check and the write is not lost.
 *
 * Orders with no `stripe_session_id` are deleted without an API call — there is
 * nothing to ask Stripe about. Those are the residue of a `startCheckout` that
 * failed between opening the order and creating the session, and they were
 * never payable.
 *
 * Failures are swallowed per order: one unreachable session must not abandon
 * the rest of the batch. The order stays `pending` and the next sweep retries.
 */
export async function expireStalePendingOrders(
  options: { sellerId?: string; limit?: number } = {},
): Promise<ExpirySweep> {
  const stale = await listStalePendingOrders(CHECKOUT_TTL_MINUTES, options);
  const sweep: ExpirySweep = {
    checked: stale.length,
    deleted: 0,
    fulfilled: 0,
  };

  for (const order of stale) {
    try {
      if (!order.stripeSessionId) {
        if (await deletePendingOrder(order.id)) {
          sweep.deleted++;
        }

        continue;
      }

      const session = await stripe.checkout.sessions.retrieve(
        order.stripeSessionId,
      );

      // Paid after all — the webhook never arrived, or is still on its way.
      // Fulfilling is both the correct outcome and idempotent, so a webhook
      // landing a moment later is a no-op rather than a double count.
      if (session.payment_status === "paid") {
        if (await fulfillCheckoutSession(session)) {
          sweep.fulfilled++;
        }

        continue;
      }

      // Still open and not yet expired at Stripe: leave it alone. This only
      // happens if the sweep's window is shorter than the session's, which
      // `CHECKOUT_TTL_MINUTES` exists to prevent — but if the two ever drift,
      // waiting is the safe side to err on.
      if (session.status === "open") {
        continue;
      }

      if (await deletePendingOrder(order.id)) {
        sweep.deleted++;
      }
    } catch (error) {
      console.error(`[checkout] could not expire order ${order.id}`, error);
    }
  }

  if (sweep.deleted > 0 || sweep.fulfilled > 0) {
    console.info(
      `[checkout] sweep: ${sweep.checked} checked, ${sweep.deleted} deleted, ${sweep.fulfilled} fulfilled`,
    );
  }

  return sweep;
}
