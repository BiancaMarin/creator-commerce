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
 * Wire it to a scheduler that runs at least as often as the TTL. On Vercel that
 * is a `vercel.json` entry:
 *
 *     { "crons": [{ "path": "/api/cron/expire-orders", "schedule": "*\/15 * * * *" }] }
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
