import "server-only";
import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

/**
 * Verifies an incoming Stripe webhook and runs `handle` on the event.
 *
 * **This is the security boundary of every webhook route.** The endpoint is a
 * public URL that grants downloads: without signature verification, anyone who
 * learns it can POST a `checkout.session.completed` naming any session and be
 * indistinguishable from Stripe. Nothing else about the request proves where it
 * came from — not the shape of the body, not the headers, not the source IP.
 *
 * Extracted from the route so that a second webhook endpoint (Connect payouts,
 * refunds) cannot be added with the verification subtly wrong, or omitted. The
 * route supplies only what to *do* with a verified event.
 *
 * Three things here are load-bearing:
 *
 * 1. **The body is read as text.** The signature covers the exact bytes Stripe
 *    sent, so `request.json()` would invalidate it — key order and number
 *    formatting are not guaranteed to survive a parse/re-serialize round trip.
 *    `constructEventAsync` does the parsing itself, after the check passes.
 * 2. **`constructEventAsync`, not `constructEvent`.** The synchronous form
 *    needs Node's crypto; the async one works on every runtime this route may
 *    be deployed to.
 * 3. **The status codes are instructions to Stripe.** 400 means "don't retry" —
 *    a bad signature will never become a good one. 500 means "retry", which is
 *    what a database blip deserves: the order is still `pending` and the next
 *    delivery will fulfil it. Idempotent handlers are what make that safe.
 */
export async function handleStripeWebhook(
  request: Request,
  handle: (event: Stripe.Event) => Promise<void>,
): Promise<Response> {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  // Fail closed. Without a secret nothing can be verified, and treating that as
  // "allow" would turn a misconfigured deploy into an open fulfilment endpoint.
  if (!secret) {
    console.error("[stripe] STRIPE_WEBHOOK_SECRET is not set");

    return new Response("Webhook not configured", { status: 500 });
  }

  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return new Response("Missing stripe-signature", { status: 400 });
  }

  const payload = await request.text();

  let event: Stripe.Event;

  try {
    event = await stripe.webhooks.constructEventAsync(
      payload,
      signature,
      secret,
    );
  } catch (error) {
    console.error("[stripe] signature verification failed", error);

    return new Response("Invalid signature", { status: 400 });
  }

  try {
    await handle(event);
  } catch (error) {
    console.error(`[stripe] failed handling ${event.type}`, error);

    return new Response("Handler failed", { status: 500 });
  }

  return Response.json({ received: true });
}
