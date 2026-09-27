import { expireStalePendingOrders } from "@/lib/server/checkout";

/**
 * Closes checkouts nobody finished — the scheduled half of order expiry.
 *
 * A `pending` order is a buyer who left for Stripe and, as far as this app can
 * tell, never came back. After `CHECKOUT_TTL_MINUTES` the Stripe session is no
 * longer payable, so the order is written off as `failed` — but only after
 * asking Stripe, because a late webhook looks exactly like an abandoned
 * checkout from here. See `expireStalePendingOrders`.
 *
 * **This is the backstop, not the mechanism.** In production the thing that
 * actually closes an abandoned checkout is Stripe's own
 * `checkout.session.expired` event, which arrives at the webhook about
 * `CHECKOUT_TTL_MINUTES` after the buyer walks away and deletes the order there
 * — no polling involved. What this sweep is for is the cases a webhook can't
 * cover: a delivery that failed every retry, a deploy that was down, an order
 * that never got a session to raise an event about.
 *
 * So it runs **daily** (`vercel.json`), not every 15 minutes. That is Vercel's
 * Hobby limit — the plan triggers cron jobs once a day and rejects anything
 * finer — but it is also the right frequency for a backstop, and worth
 * understanding before anyone "fixes" it: a pending row that outlives its
 * session is invisible and harmless. `hasPurchasedProduct` counts `paid` only,
 * so it locks nothing; the seller's /orders page sweeps its own rows before
 * rendering, so it is never shown; and the money was never taken. Lag here
 * costs nothing but the row.
 *
 * Nothing schedules it in development. The opportunistic sweep on /orders
 * covers that case, and this route can be called by hand:
 *
 *     curl -H "authorization: Bearer $CRON_SECRET" \
 *       localhost:3000/api/cron/expire-orders
 */
export async function POST(request: Request) {
  return run(request);
}

/**
 * Also on GET, because that is what Vercel Cron sends. Ordinarily a GET
 * shouldn't mutate — but the alternative is not exposing the job to the only
 * scheduler this app is likely to run under. It is not linkable or guessable:
 * the secret below gates it, and nothing renders a link to it.
 */
export async function GET(request: Request) {
  return run(request);
}

async function run(request: Request) {
  const secret = process.env.CRON_SECRET;

  // Fail closed. Without a secret this endpoint would let anyone on the
  // internet write off pending orders — a denial-of-sale, not just noise.
  if (!secret) {
    console.error("[cron] CRON_SECRET is not set");

    return new Response("Cron not configured", { status: 500 });
  }

  // Vercel Cron sends `Authorization: Bearer <CRON_SECRET>`.
  if (request.headers.get("authorization") !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  // No `sellerId`: the scheduled sweep covers every creator. The limit bounds
  // the Stripe calls one invocation can make; a backlog drains over successive
  // runs rather than timing out this one.
  const sweep = await expireStalePendingOrders({ limit: 200 });

  return Response.json(sweep);
}
