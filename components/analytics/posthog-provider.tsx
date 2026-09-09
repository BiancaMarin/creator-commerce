"use client";

import * as React from "react";
import posthog from "posthog-js";

/**
 * Boots PostHog in the browser, once per page load.
 *
 * **No key means no analytics, and that is a supported state.** Like the mail
 * transport's console fallback, a developer with no PostHog project gets a
 * working app; the capture helpers below simply log instead of sending. Nothing
 * about a missing key may break a storefront or a checkout.
 *
 * Mounted in the root layout so every route has it, but it renders nothing and
 * reads no session — identity is attached later, by the pages that already know
 * who is looking (see `TrackEvent`). Reading the session here would add a fetch
 * to every page in the app to serve a funnel that only spans four of them.
 */
export function PostHogProvider({ children }: { children: React.ReactNode }) {
  React.useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;

    if (!key) {
      return;
    }

    posthog.init(key, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com",
      // Both off on purpose. This project tracks **one funnel**, declared in
      // lib/analytics/events.ts, and every step of it is captured explicitly at
      // the moment the thing actually happened. Autocapture would add a stream
      // of clicks and pageviews that nothing here analyses, and would make it
      // harder to see the five events that matter.
      autocapture: false,
      capture_pageview: false,
      // The buyer leaves for Stripe mid-funnel. Without this, the return from
      // another origin can start a fresh session and split one purchase across
      // two, which is precisely the join the funnel depends on.
      persistence: "localStorage+cookie",
    });
  }, []);

  return <>{children}</>;
}
