/**
 * Reconciles this app's `orders` against what Stripe actually holds.
 *
 * The thing it exists to catch is the ordinary case: a buyer opens checkout,
 * changes their mind, and never pays. `startCheckout` has already written a
 * `pending` order by then (it must — a payment can't be allowed to land on an
 * order that doesn't exist yet), so every abandoned checkout leaves a row that
 * no webhook will ever finish. `expireStalePendingOrders` is what clears them;
 * this is how you see what it has to work with, and whether it is running.
 *
 * It also checks the direction nothing else does. The sweep and the webhook both
 * start from a row and ask about a session, so the one failure neither can
 * observe is a session Stripe considers **paid** with no `paid` order behind it
 * — money taken, nothing delivered. That needs someone to go looking from
 * Stripe's side, which is pass B below.
 *
 *   npm run reconcile:orders             # last 7 days
 *   npm run reconcile:orders -- --days=30
 *
 * **This script never writes.** Not an oversight — deleting and fulfilling
 * orders is delicate enough that it should have exactly one implementation, the
 * one in `lib/server/checkout.ts` with the `status = 'pending'` catches on every
 * write. A script that can't import that module (`server-only`, `@/` aliases)
 * must not grow a second copy of it. So this diagnoses, and the sweep acts:
 *
 *     curl -H "authorization: Bearer $CRON_SECRET" \
 *       localhost:3000/api/cron/expire-orders
 *
 * Raw SQL over `@neondatabase/serverless` for the same reason as
 * scripts/cleanup-orphans.ts — the Drizzle layer can't be loaded outside Next.
 */

import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import Stripe from "stripe";

/** How far back to scan Stripe, in days. */
const DEFAULT_DAYS = 7;

/**
 * Slack on the DB query's lower bound, in days.
 *
 * Pass B looks up each Stripe session's order by session id, and only pulls
 * orders from the scan window rather than the whole table. An order is always
 * written *before* its session exists (see `startCheckout`), so its
 * `created_at` can precede the session's — never by much, but "never by much"
 * is not a guarantee worth relying on when the cost of being wrong is reporting
 * a paid order as missing.
 */
const LOOKUP_BUFFER_DAYS = 1;

type Args = { days: number };

function parseArgs(argv: string[]): Args {
  const arg = argv.find((value) => value.startsWith("--days="));
  const days = arg ? Number(arg.split("=")[1]) : DEFAULT_DAYS;

  if (!Number.isFinite(days) || days <= 0) {
    throw new Error(`--days must be a positive number, got "${arg}"`);
  }

  return { days };
}

function formatCents(cents: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}

function formatAge(minutes: number) {
  if (minutes < 60) {
    return `${minutes}m`;
  }

  if (minutes < 60 * 24) {
    return `${Math.round(minutes / 60)}h`;
  }

  return `${Math.round(minutes / (60 * 24))}d`;
}

type PendingOrder = {
  id: number;
  email: string;
  amount_total: number;
  currency: string;
  stripe_session_id: string | null;
  age_min: number;
};

/**
 * What a pending order turned out to be, once Stripe was asked.
 *
 * `paid` is the one that matters. The other three are all healthy states — a
 * buyer still deciding, a buyer who walked away, and the residue of a
 * `startCheckout` that died before it got a session — and the sweep handles each
 * without anyone watching.
 */
type Verdict = "paid" | "open" | "abandoned" | "no-session" | "unknown";

async function classifyPending(
  sql: NeonQueryFunction<false, false>,
  stripe: Stripe,
) {
  const pending = (await sql`
    select
      id,
      email,
      amount_total,
      currency,
      stripe_session_id,
      round(extract(epoch from (now() - created_at)) / 60) as age_min
    from orders
    where status = 'pending'
    order by created_at
  `) as PendingOrder[];

  const rows: { order: PendingOrder; verdict: Verdict; detail: string }[] = [];

  for (const order of pending) {
    if (!order.stripe_session_id) {
      // Never payable: the order was opened and the session call failed behind
      // it. Nothing to ask Stripe about.
      rows.push({
        order,
        verdict: "no-session",
        detail: "no Stripe session was ever created",
      });

      continue;
    }

    try {
      const session = await stripe.checkout.sessions.retrieve(
        order.stripe_session_id,
      );

      if (session.payment_status === "paid") {
        rows.push({
          order,
          verdict: "paid",
          detail: `Stripe says paid (${session.status}) — the webhook never landed`,
        });
      } else if (session.status === "open") {
        rows.push({
          order,
          verdict: "open",
          detail: "still open at Stripe — the buyer can pay yet",
        });
      } else {
        rows.push({
          order,
          verdict: "abandoned",
          detail: `${session.status}/${session.payment_status} at Stripe`,
        });
      }
    } catch (error) {
      // One unreachable session must not cost us the rest of the report.
      rows.push({
        order,
        verdict: "unknown",
        detail: `could not reach Stripe: ${
          error instanceof Error ? error.message : String(error)
        }`,
      });
    }
  }

  return rows;
}

/**
 * Sessions Stripe considers paid that this database has no `paid` order for.
 *
 * The serious direction. Anything listed here is money the buyer has parted
 * with and a product this app is not delivering, and no webhook or sweep will
 * find it on its own: both of those start from a row, and the whole point of
 * this pass is the case where the row is missing, deleted, or stuck.
 */
async function findUnrecordedPayments(
  sql: NeonQueryFunction<false, false>,
  stripe: Stripe,
  days: number,
) {
  const since = Math.floor(Date.now() / 1000) - days * 24 * 60 * 60;
  const lookupSince = new Date(
    (since - LOOKUP_BUFFER_DAYS * 24 * 60 * 60) * 1000,
  );

  const known = (await sql`
    select stripe_session_id, status, id
    from orders
    where stripe_session_id is not null
      and created_at >= ${lookupSince.toISOString()}
  `) as { stripe_session_id: string; status: string; id: number }[];

  const bySession = new Map(known.map((row) => [row.stripe_session_id, row]));

  const missing: {
    sessionId: string;
    amount: number;
    currency: string;
    email: string | null;
    created: number;
    orderState: string;
  }[] = [];

  let paidSessions = 0;

  for await (const session of stripe.checkout.sessions.list({
    created: { gte: since },
    limit: 100,
  })) {
    if (session.payment_status !== "paid") {
      continue;
    }

    paidSessions++;

    const order = bySession.get(session.id);

    if (order?.status === "paid") {
      continue;
    }

    missing.push({
      sessionId: session.id,
      amount: session.amount_total ?? 0,
      currency: session.currency ?? "usd",
      email: session.customer_details?.email ?? null,
      created: session.created,
      orderState: order ? `order ${order.id} is '${order.status}'` : "no order row",
    });
  }

  return { paidSessions, missing };
}

async function main() {
  const { days } = parseArgs(process.argv.slice(2));

  if (!process.env.PG_CONNECTION_STRING) {
    throw new Error(
      "PG_CONNECTION_STRING is not set — run through `npm run reconcile:orders`",
    );
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error(
      "STRIPE_SECRET_KEY is not set — run through `npm run reconcile:orders`",
    );
  }

  const sql = neon(process.env.PG_CONNECTION_STRING);
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  const pending = await classifyPending(sql, stripe);
  const { paidSessions, missing } = await findUnrecordedPayments(
    sql,
    stripe,
    days,
  );

  const counts = pending.reduce<Record<string, number>>((total, row) => {
    total[row.verdict] = (total[row.verdict] ?? 0) + 1;

    return total;
  }, {});

  console.log(`Pending orders:            ${pending.length}`);
  console.log(`  abandoned (reapable):    ${counts.abandoned ?? 0}`);
  console.log(`  still open at Stripe:    ${counts.open ?? 0}`);
  console.log(`  never had a session:     ${counts["no-session"] ?? 0}`);
  console.log(`  PAID, not fulfilled:     ${counts.paid ?? 0}`);
  console.log(`  unreadable at Stripe:    ${counts.unknown ?? 0}`);
  console.log("");
  console.log(`Paid sessions (last ${days}d):  ${paidSessions}`);
  console.log(`  with no paid order:      ${missing.length}`);

  if (pending.length > 0) {
    console.log("");
    console.log("Pending detail:");

    for (const { order, verdict, detail } of pending) {
      console.log(
        `  #${order.id} ${formatCents(order.amount_total, order.currency)}` +
          ` ${order.email} — ${formatAge(order.age_min)} old` +
          ` [${verdict}] ${detail}`,
      );
    }
  }

  if (missing.length > 0) {
    console.log("");
    console.log("!! Paid at Stripe with no paid order — investigate each:");

    for (const row of missing) {
      const when = new Date(row.created * 1000).toISOString();

      console.log(
        `  ${row.sessionId} ${formatCents(row.amount, row.currency)}` +
          ` ${row.email ?? "(no email)"} ${when} — ${row.orderState}`,
      );
    }
  }

  const actionable = (counts.paid ?? 0) + (counts.abandoned ?? 0) + (counts["no-session"] ?? 0);

  if (actionable > 0) {
    console.log("");
    console.log(
      `${actionable} order(s) the expiry sweep would close. Run it with:`,
    );
    console.log(
      "  curl -H \"authorization: Bearer $CRON_SECRET\" localhost:3000/api/cron/expire-orders",
    );
  }

  // A non-zero exit is what makes this usable from a scheduler: unrecorded
  // payments are the one finding here that always needs a human, so it should be
  // able to fail a job rather than scroll past in a log.
  if (missing.length > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
