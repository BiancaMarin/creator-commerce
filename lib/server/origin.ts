import "server-only";

/**
 * Where this app lives, as an absolute origin with no trailing slash.
 *
 * **One variable, one answer.** Every consumer must agree with whatever holds
 * the session cookie: a Stripe redirect to a different origin lands the buyer on
 * their receipt signed out, and an emailed link to a different origin sends them
 * somewhere they aren't signed in either. That is why this is a single resolver
 * and why `lib/server/auth.ts` passes its result to Better Auth as `baseURL`
 * rather than letting Better Auth read the environment on its own — two readers
 * of two variables is exactly how those two halves come to disagree.
 *
 * Resolved in this order:
 *
 *  1. `BETTER_AUTH_URL`, when set. Local development uses it
 *     (http://localhost:3000), and it is also the way to pin a custom domain in
 *     production — a deployment served at `creator-commerce.com` must not send
 *     buyers back to its `.vercel.app` address.
 *  2. `VERCEL_PROJECT_PRODUCTION_URL` on a production deployment. Vercel sets
 *     this to the project's stable production domain, so the common case needs
 *     no configuration at all.
 *  3. `VERCEL_URL` — the deployment's own hostname. This is what makes preview
 *     deployments work: a preview resolves to *itself*, so its auth callbacks
 *     and Stripe redirects come back to the branch being tested instead of to
 *     production. Hardcoding a single production URL is the thing that quietly
 *     breaks every preview.
 *
 * Vercel's variables carry no scheme (`my-app.vercel.app`), hence the `https://`
 * prefix here; every Vercel deployment is served over TLS.
 *
 * Lives outside `checkout.ts` because email needs it too, and importing the
 * checkout module from an email module that checkout itself calls would be a
 * cycle.
 */
export function appOrigin(): string {
  const explicit = process.env.BETTER_AUTH_URL;

  if (explicit) {
    return stripTrailingSlash(explicit);
  }

  // `VERCEL_ENV` is "production" only for a production deployment, so a preview
  // never claims the production domain even though the variable is set there too.
  if (
    process.env.VERCEL_ENV === "production" &&
    process.env.VERCEL_PROJECT_PRODUCTION_URL
  ) {
    return `https://${stripTrailingSlash(process.env.VERCEL_PROJECT_PRODUCTION_URL)}`;
  }

  if (process.env.VERCEL_URL) {
    return `https://${stripTrailingSlash(process.env.VERCEL_URL)}`;
  }

  throw new Error(
    "Cannot determine the app origin: set BETTER_AUTH_URL (required outside Vercel)",
  );
}

/**
 * Every origin this deployment may legitimately be reached at.
 *
 * `appOrigin()` returns one answer, which is what absolute links have to be
 * built from — but on Vercel a single deployment answers to several hostnames,
 * and Better Auth rejects a request whose `Origin` is not one it trusts. A
 * preview is the case that bites: `VERCEL_URL` is the immutable per-deployment
 * address (`app-7g3k9x.vercel.app`) while the link in a pull request is usually
 * the branch alias (`app-git-my-branch.vercel.app`). Sign in through the alias
 * with only the deployment URL trusted and the request is refused — which looks
 * exactly like "the session doesn't work" rather than like a rejected origin.
 *
 * Production is included for the same reason: a custom domain pinned through
 * `BETTER_AUTH_URL` would otherwise leave the project's own `.vercel.app`
 * address untrusted.
 *
 * Widening trust only to hostnames Vercel itself reports for this project, so
 * this cannot be broadened by anything an attacker controls.
 */
export function trustedAppOrigins(): string[] {
  const origins = [
    appOrigin(),
    vercelOrigin(process.env.VERCEL_URL),
    vercelOrigin(process.env.VERCEL_BRANCH_URL),
    vercelOrigin(process.env.VERCEL_PROJECT_PRODUCTION_URL),
  ].filter((origin): origin is string => Boolean(origin));

  return [...new Set(origins)];
}

function vercelOrigin(host: string | undefined): string | null {
  return host ? `https://${stripTrailingSlash(host)}` : null;
}

function stripTrailingSlash(value: string): string {
  return value.replace(/\/$/, "");
}
