"use client";

import * as React from "react";

import { capture, identify } from "@/lib/analytics/capture";
import type { AnalyticsEvent, AnalyticsProperties } from "@/lib/analytics/events";

/**
 * Fires one funnel event when a page mounts, from a Server Component.
 *
 * The view steps of the funnel belong to pages that are server-rendered, and a
 * capture is a browser call. Rather than turning a page into a Client Component
 * to report that it was opened, the page renders this: it paints nothing and
 * exists only for the effect.
 *
 * `userId` is threaded in by pages that already read the session for their own
 * reasons, so identifying the viewer costs no extra query. Anonymous browsing
 * is expected — a storefront is public — and PostHog merges those events into
 * the identity on the first `identify` call.
 *
 * **Guarded against firing twice.** React runs effects twice in development's
 * strict mode, which would double every view in the funnel while leaving the
 * later steps alone — a conversion rate wrong by half, visible only in
 * development, and easy to misread as a real drop-off.
 */
export function TrackEvent({
  event,
  properties,
  userId,
}: {
  event: AnalyticsEvent;
  properties?: AnalyticsProperties;
  userId?: string | null;
}) {
  const fired = React.useRef(false);

  // `properties` is built inline by the calling page, so it is a new object on
  // every render and this effect re-runs freely. The ref, not the dependency
  // list, is what makes the event fire once — which also covers development's
  // double-invoked effects.
  React.useEffect(() => {
    if (fired.current) {
      return;
    }

    fired.current = true;

    if (userId) {
      identify(userId);
    }

    capture(event, properties);
  }, [event, properties, userId]);

  return null;
}
