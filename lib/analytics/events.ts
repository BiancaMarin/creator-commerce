/**
 * The funnel, as PostHog sees it.
 *
 * One vocabulary, imported by both the browser and the server. Event names are
 * the join between a client capture and a server one — a typo in either half
 * doesn't fail a build, it produces a funnel step that is silently always zero.
 * Declaring them here is the only thing that makes the two sides agree.
 *
 * This module is deliberately **outside `lib/server/`**: client components
 * import it too, so it must stay free of anything server-only.
 *
 * The steps, in order:
 *
 * 1. `storefront_viewed`  — someone opened a creator's shop.
 * 2. `product_viewed`     — they opened one product.
 * 3. `product_added_to_cart` — optional; buying directly skips it.
 * 4. `checkout_started`   — Stripe handed back a payment URL and we're about
 *                           to send them there.
 * 5. `purchase_completed` — the payment settled. **Captured on the server**,
 *                           never in the browser.
 *
 * Step 5 is the reason the ids below matter. The buyer leaves for Stripe
 * between steps 4 and 5, and can close the tab the moment the card clears, so
 * a browser-side "purchase" event measures how many people waited for a
 * redirect rather than how many people paid.
 */
export const ANALYTICS_EVENTS = {
  storefrontViewed: "storefront_viewed",
  productViewed: "product_viewed",
  productAddedToCart: "product_added_to_cart",
  checkoutStarted: "checkout_started",
  purchaseCompleted: "purchase_completed",
} as const;

export type AnalyticsEvent =
  (typeof ANALYTICS_EVENTS)[keyof typeof ANALYTICS_EVENTS];

/** Anything JSON-serializable PostHog will accept as an event property. */
export type AnalyticsProperties = Record<
  string,
  string | number | boolean | null | undefined
>;

/**
 * The distinct id for a signed-in person: their user id, on both sides.
 *
 * **This is what stitches the funnel together.** The browser identifies with
 * it while browsing, and the webhook captures step 5 with the same value, so
 * PostHog sees one person moving through five steps rather than an anonymous
 * visitor and an unrelated server event. Get this wrong and every funnel drops
 * to zero at the last step while the raw event counts look fine.
 *
 * A function rather than inlining `user.id` at each call site, so there is one
 * place to change if identity ever stops being the user id.
 */
export function analyticsDistinctId(userId: string): string {
  return userId;
}
