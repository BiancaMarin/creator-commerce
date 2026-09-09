import "server-only";

import { PostHog } from "posthog-node";

import type { AnalyticsEvent, AnalyticsProperties } from "@/lib/analytics/events";
import { analyticsDistinctId } from "@/lib/analytics/events";

/**
 * The server-side PostHog client, built once and reused.
 *
 * Reuses `NEXT_PUBLIC_POSTHOG_KEY` rather than adding a second variable. A
 * PostHog project API key is write-only and is already public by design — it
 * ships in the browser bundle — so a server-only copy would protect nothing and
 * introduce a way for the two halves of one funnel to point at different
 * projects.
 */
let client: PostHog | null = null;

function posthog(): PostHog | null {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;

  if (!key) {
    return null;
  }

  if (!client) {
    client = new PostHog(key, {
      host:
        process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com",
    });
  }

  return client;
}

/**
 * Captures a funnel event from the server, and waits for it to be delivered.
 *
 * **`captureImmediate`, not `capture`.** The ordinary call queues the event and
 * flushes it later, which on a serverless host means "never": the process is
 * frozen the moment the handler returns, taking the queue with it. The only
 * caller here is the Stripe webhook, so this is exactly the shape that would
 * work locally and silently lose every purchase in production.
 *
 * Never throws. It runs after money has already moved, so an analytics outage
 * must not propagate an error into the webhook and provoke Stripe into retrying
 * work that is finished.
 *
 * With no key it logs instead, matching the browser helper — the funnel can be
 * checked end to end before a PostHog project exists.
 */
export async function captureServerEvent(
  userId: string,
  event: AnalyticsEvent,
  properties?: AnalyticsProperties,
): Promise<void> {
  const client = posthog();

  if (!client) {
    // Serialized into the message rather than passed as a second argument:
    // Next's dev logger renders a trailing object as `{}`, which would make the
    // fallback useless for checking that the right properties are attached.
    console.info(
      `[analytics] ${event} ${JSON.stringify({ userId, ...(properties ?? {}) })}`,
    );

    return;
  }

  try {
    await client.captureImmediate({
      // The same id the browser identifies with, which is the whole reason the
      // client steps and this one land in one funnel.
      distinctId: analyticsDistinctId(userId),
      event,
      properties,
    });
  } catch (error) {
    console.error(`[analytics] could not capture ${event}`, error);
  }
}
