import { test as base } from "@playwright/test";

export { expect } from "@playwright/test";

/**
 * Playwright's `test`, with analytics switched off. Every spec imports from
 * here rather than from @playwright/test.
 *
 * The dev server is started with the real NEXT_PUBLIC_POSTHOG_KEY, so without
 * this each run would land as pageviews (and recordings) in the live PostHog
 * project — e2e traffic mixed into the funnel and Web Analytics. Aborting the
 * requests is safe: the app treats a failed capture as normal (ad blockers do
 * the same), see "Analytics" in CLAUDE.md.
 */
export const test = base.extend({
  context: async ({ context }, use) => {
    await context.route(/^https:\/\/[^/]*posthog\.com\//, (route) =>
      route.abort(),
    );
    await use(context);
  },
});
