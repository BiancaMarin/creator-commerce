import "server-only";

/**
 * Where this app lives, as an absolute origin with no trailing slash.
 *
 * Reuses `BETTER_AUTH_URL` rather than introducing a second "where does this
 * app live" variable: every consumer must agree with the one holding the
 * session cookie — a Stripe redirect to a different origin lands the buyer on
 * their receipt signed out, and an emailed link to a different origin sends
 * them somewhere they aren't signed in either — and one variable can't
 * disagree with itself.
 *
 * Lives outside `checkout.ts` because email needs it too, and importing the
 * checkout module from an email module that checkout itself calls would be a
 * cycle.
 */
export function appOrigin(): string {
  const origin = process.env.BETTER_AUTH_URL;

  if (!origin) {
    throw new Error("BETTER_AUTH_URL is required to build absolute URLs");
  }

  return origin.replace(/\/$/, "");
}
