import { fulfillCheckoutSession } from "@/lib/server/checkout";
import {
  deletePendingOrderBySession,
  markOrderFailed,
} from "@/lib/server/dal/orders";
import { handleStripeWebhook } from "@/lib/server/stripe";

/**
 * Stripe's fulfilment callback — the primary path by which an order becomes
 * paid, and the only unprompted one.
 *
 * Not the success URL. The buyer can close the tab the instant the card
 * clears, and Stripe still delivers this; a success page that *granted* the
 * download would be both skippable and, being a plain GET anyone can type,
 * forgeable. The redirect is a receipt, this is the transaction.
 *
 * `reconcileCheckoutSession` can also fulfil, from the buyer's return URL, but
 * only after verifying with Stripe — it never trusts the URL. Both go through
 * `fulfillCheckoutSession`, so they write the same thing and the idempotent
 * update makes whichever arrives second a no-op.
 *
 * Body reading, signature verification and the status codes Stripe reads as
 * "retry" or "don't" all live in `handleStripeWebhook`. This file decides only
 * what a verified event *means*.
 *
 * Local development needs the events forwarded here:
 *
 *     stripe listen --forward-to localhost:3000/api/stripe/webhook
 *
 * which prints the signing secret to put in `STRIPE_WEBHOOK_SECRET`. That
 * secret differs from the one the Stripe dashboard shows for a deployed
 * endpoint — using the wrong one fails every request with a 400.
 */
export async function POST(request: Request) {
  return handleStripeWebhook(request, async (event) => {
    switch (event.type) {
      // `completed` fires when the session finishes, which for an async payment
      // method can happen while the money is still in flight;
      // `async_payment_succeeded` is those settling later. One handler for both:
      // `fulfillCheckoutSession` checks `payment_status` itself and only ever
      // moves a `pending` order, so whichever event arrives second is a no-op
      // rather than a double count.
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded": {
        await fulfillCheckoutSession(event.data.object);
        break;
      }

      // The buyer abandoned the checkout and the session timed out — 30 minutes
      // here, set by `CHECKOUT_TTL_MINUTES`. The order is deleted rather than
      // kept: nothing was sold, and a dead row would only clutter the seller's
      // Orders page. `deletePendingOrderBySession` re-asserts `pending`, so a
      // late `expired` after a successful payment cannot delete a real sale.
      //
      // This is the same outcome the scheduled sweep reaches
      // (`expireStalePendingOrders`); whichever gets there first wins, and the
      // other finds nothing.
      case "checkout.session.expired": {
        const session = event.data.object;

        if (await deletePendingOrderBySession(session.id)) {
          console.info(`[stripe] expired order removed for session ${session.id}`);
        }

        break;
      }

      // Not the same thing: the buyer *tried* to pay and the payment failed.
      // That's worth keeping — it's a real event in the order's life, and the
      // seller seeing a failed attempt is information, not clutter.
      case "checkout.session.async_payment_failed": {
        const session = event.data.object;

        if (await markOrderFailed(session.id)) {
          console.info(`[stripe] payment failed for session ${session.id}`);
        }

        break;
      }

      default:
        // Everything else is acknowledged and ignored. Throwing for an event we
        // don't handle would return a 500 and make Stripe retry it forever.
        break;
    }
  });
}
