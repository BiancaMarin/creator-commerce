import "server-only";

import { ANALYTICS_EVENTS } from "@/lib/analytics/events";

/**
 * Reads event counts back out of PostHog, for the analytics page.
 *
 * This is the one place the app *reads* from PostHog, and it needs a different
 * key from the one that sends: `NEXT_PUBLIC_POSTHOG_KEY` is a write-only
 * project key, public by design. Reading takes a **personal API key** (scope
 * `query:read`) and the numeric project id. Both are secret, so they are
 * server-only env vars:
 *
 *   POSTHOG_PERSONAL_API_KEY=phx_...
 *   POSTHOG_PROJECT_ID=12345
 *
 * The query API lives on the app host (`us.posthog.com`), not the ingestion
 * host (`us.i.posthog.com`) the events go to — so the host is derived from
 * `NEXT_PUBLIC_POSTHOG_HOST` unless `POSTHOG_API_HOST` says otherwise.
 */

/**
 * The events the page shows: two of the three that carry the store's
 * `handle`, so they can be counted per creator. `storefront_viewed` carries
 * it too but is left off the page: its count never filled in. The later
 * steps (add to cart from the cart page, purchase) don't carry it yet.
 */
export const TRAFFIC_EVENTS = [
  ANALYTICS_EVENTS.productViewed,
  ANALYTICS_EVENTS.checkoutStarted,
] as const;

export type TrafficEvent = (typeof TRAFFIC_EVENTS)[number];

export type EventCount = {
  total: number;
  /** Distinct people — PostHog persons, so a signed-in buyer counts once. */
  visitors: number;
};

export type StoreTraffic =
  | { status: "ok"; counts: Record<TrafficEvent, EventCount> }
  /** No read key configured — the page says so instead of failing. */
  | { status: "unconfigured" }
  | { status: "error" };

function apiHost(): string {
  if (process.env.POSTHOG_API_HOST) {
    return process.env.POSTHOG_API_HOST;
  }

  const ingest = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";
  // us.i.posthog.com → us.posthog.com; eu likewise.
  return ingest.replace(".i.posthog.com", ".posthog.com");
}

/**
 * Event totals for one store over the last `days` days.
 *
 * Never throws: PostHog being down or slow must not take the analytics page
 * with it, so every failure comes back as `{ status: "error" }`.
 */
export async function getStoreTraffic(
  handle: string,
  days: number,
): Promise<StoreTraffic> {
  const key = process.env.POSTHOG_PERSONAL_API_KEY;
  const projectId = process.env.POSTHOG_PROJECT_ID;

  if (!key || !projectId) {
    return { status: "unconfigured" };
  }

  // HogQL with `{placeholders}`: PostHog binds `values` server-side, so the
  // handle is never spliced into the query text. The event names and `days`
  // are constants of ours, so they are written in directly.
  //
  // The owner's own visits are left out — a creator checking their store
  // would otherwise be their own best visitor. `coalesce` because the
  // checkout event has no `is_owner` at all, and a bare `!=` against NULL
  // would drop it.
  const query = `
    SELECT event, count() AS total, count(DISTINCT person_id) AS visitors
    FROM events
    WHERE event IN (${TRAFFIC_EVENTS.map((event) => `'${event}'`).join(", ")})
      AND properties.handle = {handle}
      AND coalesce(toString(properties.is_owner), '') != 'true'
      AND timestamp >= now() - INTERVAL ${Math.trunc(days)} DAY
    GROUP BY event
  `;

  try {
    const response = await fetch(
      `${apiHost()}/api/projects/${encodeURIComponent(projectId)}/query/`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: {
            kind: "HogQLQuery",
            query,
            values: { handle },
          },
        }),
        cache: "no-store",
        signal: AbortSignal.timeout(8000),
      },
    );

    if (!response.ok) {
      console.error(
        `[posthog] query failed: ${response.status} ${await response.text()}`,
      );
      return { status: "error" };
    }

    const body = (await response.json()) as {
      results?: [string, number, number][];
    };

    const counts = Object.fromEntries(
      TRAFFIC_EVENTS.map((event) => [event, { total: 0, visitors: 0 }]),
    ) as Record<TrafficEvent, EventCount>;

    for (const [event, total, visitors] of body.results ?? []) {
      if (event in counts) {
        counts[event as TrafficEvent] = { total, visitors };
      }
    }

    return { status: "ok", counts };
  } catch (error) {
    console.error("[posthog] query failed", error);
    return { status: "error" };
  }
}
