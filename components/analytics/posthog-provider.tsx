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
      // Off on purpose. The funnel in lib/analytics/events.ts captures every
      // step explicitly, at the moment the thing actually happened. Autocapture
      // would add a stream of clicks that nothing here analyses, and would make
      // the five events that matter harder to find.
      autocapture: false,
      // Separate from `autocapture`, and enabled by the *project's* remote
      // config rather than by anything here — its default is `undefined`, which
      // means "ask the server". So turning autocapture off does not stop
      // `$dead_click` events; only saying so explicitly does.
      capture_dead_clicks: false,
      // **`'history_change'`, not `true`.** PostHog's Web Analytics — the
      // Visitors, sessions and bounce figures — is built entirely from
      // `$pageview`, so without this it stays empty however many funnel events
      // arrive. Plain `true` fires once per full page load, and the App Router
      // navigates client-side, so a visitor moving from a storefront to a
      // product would count as one pageview. `'history_change'` hooks the
      // History API and counts each route change.
      //
      // `$pageleave` follows automatically (its default is
      // `'if_capture_pageview'`), which is what gives sessions a duration and a
      // bounce rate rather than leaving every visit open-ended.
      capture_pageview: "history_change",
      // The buyer leaves for Stripe mid-funnel. Without this, the return from
      // another origin can start a fresh session and split one purchase across
      // two, which is precisely the join the funnel depends on.
      persistence: "localStorage+cookie",
    });
  }, []);

  return <>{children}</>;
}
