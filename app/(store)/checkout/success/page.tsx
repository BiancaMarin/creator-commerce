import type { Route } from "next"
import { redirect } from "next/navigation"

import { PURCHASE_PARAM } from "@/lib/server/checkout"

/**
 * The old post-payment destination, kept as a redirect.
 *
 * Checkout now returns the buyer straight to their library — see `success_url`
 * in lib/server/checkout.ts — but a Checkout Session issued before that change
 * still carries this URL, and Stripe will send anyone who completes one here.
 * Forwarding the session id means those buyers get the same confirmation
 * banner as everyone else instead of a 404 after paying.
 *
 * Nothing is granted here and nothing is checked here: /downloads does both,
 * and it scopes every lookup to the signed-in buyer.
 */
export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>
}) {
  const { session_id: sessionId } = await searchParams

  redirect(
    (sessionId
      ? `/downloads?${PURCHASE_PARAM}=${encodeURIComponent(sessionId)}`
      : "/downloads") as Route,
  )
}
