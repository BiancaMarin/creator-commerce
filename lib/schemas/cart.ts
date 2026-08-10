/**
 * Cart serialization. Deliberately free of zod and of any `lib/server/*`
 * import: the cart cookie is read on the server but `MAX_CART_ITEMS` is copy
 * the client renders, so this file has to stay client-safe like the rest of
 * lib/schemas.
 */

/**
 * How many products one cart can hold.
 *
 * A storage constraint rather than a UX number, in the same spirit as
 * `MIN_SEARCH_LENGTH` in ./search.ts. Browsers cap a single cookie at ~4KB, and
 * the cart is a comma-separated list of integer ids — at 50 items with room for
 * long ids that is a few hundred bytes, which leaves the limit a non-issue
 * instead of something that starts truncating carts silently once the catalog
 * grows past six-digit ids.
 */
export const MAX_CART_ITEMS = 50;

/** Ids are joined with this rather than JSON — no quoting, no escaping. */
const SEPARATOR = ",";

/**
 * Reads the raw cookie value into product ids.
 *
 * Takes the same posture as `searchParamsSchema`: every malformed input
 * degrades to a value the caller can use rather than throwing. The cookie is
 * HTTP-only, so a browser can't write it — but a determined user can still edit
 * it in devtools, and "" / "abc" / "-1" must render an empty cart, not a 500.
 *
 * Two rules are enforced here rather than at the call sites, because every
 * caller needs them: ids are **deduped** (a product is owned once, there are no
 * quantities) and the list is truncated to `MAX_CART_ITEMS`.
 */
export function parseCartCookie(raw: string | undefined): number[] {
  if (!raw) {
    return [];
  }

  const ids = raw
    .split(SEPARATOR)
    // `Number("")` is 0 and `Number(" 1 ")` is 1, so the integer test below is
    // what actually rejects junk — not the split.
    .map((part) => Number(part))
    .filter((id) => Number.isInteger(id) && id > 0);

  return [...new Set(ids)].slice(0, MAX_CART_ITEMS);
}

/** The inverse of `parseCartCookie`, for the cookie write. */
export function serializeCartIds(ids: readonly number[]): string {
  return ids.join(SEPARATOR);
}
