import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** "Alex Rivera" -> "AR", "Test" -> "T". Used for avatar fallbacks. */
export function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

/** Where sign-in lands when there's no `?next=`, or the one given is unusable. */
export const DEFAULT_SIGNED_IN_PATH = "/dashboard"

/**
 * Validates a `?next=` redirect target before it is navigated to.
 *
 * The parameter comes from a URL anyone can hand someone else, so it has to be
 * proven same-origin rather than trusted: an unchecked value turns the login
 * page into an open redirect that borrows this site's credibility to land on
 * somebody else's.
 *
 * Only a path is accepted, and only one starting with a single "/". Both
 * "//evil.example" and "/\evil.example" are protocol-relative absolute URLs as
 * far as a browser is concerned, which is exactly the case a naive
 * `startsWith("/")` lets through.
 */
export function safeNextPath(raw: string | null | undefined) {
  if (!raw || !raw.startsWith("/")) {
    return DEFAULT_SIGNED_IN_PATH
  }

  if (raw.startsWith("//") || raw.startsWith("/\\")) {
    return DEFAULT_SIGNED_IN_PATH
  }

  return raw
}

/**
 * Marks a return path as "this buyer was part-way through paying".
 *
 * Sign-in is a redirect away and back, and without this the buyer lands on the
 * page they started from with the payment form closed — they have to find the
 * button and press it a second time, which reads as the sign-in having failed.
 * The flag is what lets the page reopen at the step they were sent away from.
 *
 * It carries intent, not authority: `checkoutCart` / `checkoutProduct` still
 * check the session, so a hand-typed `?checkout=1` opens a form that refuses to
 * submit rather than skipping anything.
 */
export const CHECKOUT_INTENT_PARAM = "checkout"

/**
 * The "/login?next=…" href for a buyer who has to sign in before paying.
 *
 * Shared by the two checkout surfaces and by the Server Actions behind them, so
 * the link the UI offers and the one an expired session redirects to can't
 * drift apart. `returnPath` must be a same-origin path — see `safeNextPath`,
 * which is what re-checks it on the way back.
 */
export function signInToCheckoutHref(returnPath: string) {
  const separator = returnPath.includes("?") ? "&" : "?"
  const next = `${returnPath}${separator}${CHECKOUT_INTENT_PARAM}=1`

  return `/login?next=${encodeURIComponent(next)}`
}

/** Fits comfortably in the `slug` column and keeps URLs readable. */
export const SLUG_MAX_LENGTH = 60

// Combining marks left behind by NFKD decomposition ("e" + U+0301 for "é").
// Written as escapes on purpose: literal combining characters in source attach
// themselves to the neighbouring `[` and `-`, silently breaking the class.
const COMBINING_MARKS = /[\u0300-\u036f]/g

/**
 * URL-safe slugs. Must stay client-importable: the product form previews the
 * slug as you type, so the browser needs the exact same function the server
 * stores — otherwise the preview lies.
 */
export function slugify(input: string, maxLength = SLUG_MAX_LENGTH) {
  return (
    input
      // "Café Décor" -> "cafe-decor" rather than dropping the accented letters.
      .normalize("NFKD")
      .replace(COMBINING_MARKS, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .replace(/-{2,}/g, "-")
      .slice(0, maxLength)
      // The slice can land mid-separator and leave a trailing hyphen.
      .replace(/-+$/, "")
  )
}
