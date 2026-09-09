"use client";

import posthog from "posthog-js";

import type { AnalyticsEvent, AnalyticsProperties } from "@/lib/analytics/events";
import { analyticsDistinctId } from "@/lib/analytics/events";

/** Whether a PostHog project is configured for the browser. */
function enabled(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_POSTHOG_KEY);
}

/**
 * Captures one funnel event from the browser.
 *
 * **Never throws.** Every call site sits on a path where analytics is the least
 * important thing happening — a buyer is adding to their cart, or being sent to
 * Stripe — so a blocked script or an ad blocker must not take the feature with
 * it. Blockers are the normal case, not the exception, which is also why no
 * user-visible behaviour may depend on a capture having happened.
 *
 * With no key it logs instead, so the funnel can be checked before a PostHog
 * project exists.
 */
export function capture(
  event: AnalyticsEvent,
  properties?: AnalyticsProperties,
): void {
  if (!enabled()) {
    console.info(`[analytics] ${event}`, properties ?? {});

    return;
  }

  // Sent even when the person hasn't been identified: a storefront is public,
  // so the first steps of the funnel are routinely anonymous, and PostHog folds
  // those into the identity on the first `identify` call.

  try {
    posthog.capture(event, properties);
  } catch (error) {
    console.error(`[analytics] could not capture ${event}`, error);
  }
}

/**
 * Ties the browser's events to a user id, so the client half of the funnel and
 * the server-side `purchase_completed` describe the same person.
 *
 * Safe to call on every render of a page that knows the viewer: PostHog treats
 * a repeat identify with the same id as a no-op, and the anonymous events
 * captured before the first call are merged into that identity.
 */
export function identify(userId: string): void {
  if (!enabled()) {
    return;
  }

  try {
    posthog.identify(analyticsDistinctId(userId));
  } catch (error) {
    console.error("[analytics] could not identify", error);
  }
}
