import "server-only";

import { cookies } from "next/headers";

import { parseCartCookie, serializeCartIds } from "@/lib/schemas/cart";

/**
 * The cart lives entirely in this cookie — there is no cart table. It holds
 * product ids and nothing else: no prices, no names, no owner. Prices are
 * re-read from the database on every render, so a hand-edited cookie can never
 * move money, only change which products someone is looking at.
 */
const CART_COOKIE = "cc_cart";

/**
 * `httpOnly` keeps the cart out of `document.cookie`, so the only way to change
 * it is a Server Action that validates first. `lax` still sends it on a
 * top-level navigation back from the login page, which is what makes the
 * sign-in round trip preserve the cart.
 */
const CART_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax",
  path: "/",
  // Not in dev: localhost is plain HTTP, and a `Secure` cookie there is simply
  // never stored.
  secure: process.env.NODE_ENV === "production",
  maxAge: 60 * 60 * 24 * 30,
} as const;

/**
 * The current cart, as product ids in the order they were added.
 *
 * Safe to call from a page or layout — reading cookies is allowed during
 * render, and only opts the route into dynamic rendering, which every
 * storefront route already is.
 */
export async function readCartIds(): Promise<number[]> {
  const store = await cookies();

  return parseCartCookie(store.get(CART_COOKIE)?.value);
}

/**
 * Replaces the cart.
 *
 * **Only callable from a Server Action or Route Handler.** HTTP can't set a
 * cookie once the response has started streaming, so Next rejects `.set()`
 * during Server Component rendering — see
 * node_modules/next/dist/docs/01-app/03-api-reference/04-functions/cookies.md.
 *
 * An empty cart deletes the cookie instead of storing "", so a visitor who
 * clears their cart stops carrying one around entirely.
 */
export async function writeCartIds(ids: readonly number[]) {
  const store = await cookies();

  if (ids.length === 0) {
    store.delete(CART_COOKIE);

    return;
  }

  store.set(CART_COOKIE, serializeCartIds(ids), CART_COOKIE_OPTIONS);
}
