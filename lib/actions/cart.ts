"use server";

import { revalidatePath } from "next/cache";

import { strings } from "@/constants/strings";
import { MAX_CART_ITEMS } from "@/lib/schemas/cart";
import { readCartIds, writeCartIds } from "@/lib/server/cart";
import { getSession } from "@/lib/server/dal/session";
import { isLiveProduct, listProductsByIds } from "@/lib/server/dal/products";
import { signInToCheckoutHref } from "@/lib/utils";

/**
 * `signInHref` marks the one failure that isn't a message to render: the caller
 * should navigate there instead. Keeping it on the failure branch rather than
 * inventing a third variant means every caller that already handles `error`
 * keeps compiling, and adding the redirect is opt-in.
 */
export type CartActionResult =
  | { ok: true; count: number }
  | { ok: false; error: string; signInHref?: string };

/** Same contract, for a purchase that never touches the cart. */
export type CheckoutResult =
  | { ok: true }
  | { ok: false; error: string; signInHref?: string };

/**
 * Where a signed-out buyer is sent, and where they come back to. The return
 * path carries the checkout flag, so signing in drops them back on the payment
 * step rather than at the top of their cart.
 */
const SIGN_IN_HREF = signInToCheckoutHref("/cart");

/**
 * These actions read the session with `getSession()` rather than
 * `requireUser()`. `requireUser` redirects to a bare `/login`, which from a
 * button click surfaces as an opaque failure and throws away the return path —
 * the same reason the UploadThing middleware avoids it (app/api/uploadthing/core.ts).
 */
function signedOut(): CartActionResult {
  return {
    ok: false,
    error: strings.errors.signInToCheckout,
    signInHref: SIGN_IN_HREF,
  };
}

/**
 * Adds a product to the cart.
 *
 * Unlike every other action in this codebase this one does **not** require a
 * session: the storefront is public and collecting products is part of
 * browsing. Two things make that safe. An action can only ever rewrite the
 * caller's own cookie, so there is nothing here to escalate to; and the id is
 * checked against a live product before it is stored, so the cart can't be
 * stuffed with ids that every later read would have to filter out.
 *
 * Keeping this open is deliberate, not a stage on the way to gating it. Signing
 * in is asked for once, at checkout, where it buys the visitor something; a wall
 * in front of the cart would just cost the sale before the cart has shown them
 * why it's worth making an account. `checkoutCart` is the only gate.
 *
 * Adding a product that's already there is a success, not an error: there are
 * no quantities, so the cart is already in the state the caller asked for.
 */
export async function addToCart(productId: number): Promise<CartActionResult> {
  if (!Number.isInteger(productId) || productId <= 0) {
    return { ok: false, error: strings.errors.productNotFound };
  }

  const ids = await readCartIds();

  if (ids.includes(productId)) {
    return { ok: true, count: ids.length };
  }

  if (ids.length >= MAX_CART_ITEMS) {
    return {
      ok: false,
      error: strings.errors.cartFull.replace("{count}", String(MAX_CART_ITEMS)),
    };
  }

  if (!(await isLiveProduct(productId))) {
    return { ok: false, error: strings.errors.productNotFound };
  }

  const next = [...ids, productId];

  await writeCartIds(next);
  revalidatePath("/cart");

  return { ok: true, count: next.length };
}

/**
 * Drops a product from the cart. Removing something that isn't there is a
 * no-op success — the caller wanted it gone and it is.
 *
 * This is also what prunes ids left behind by a deleted product: the write
 * stores whatever `readCartIds` parsed, minus this id.
 */
export async function removeFromCart(
  productId: number,
): Promise<CartActionResult> {
  const ids = await readCartIds();
  const next = ids.filter((id) => id !== productId);

  if (next.length === ids.length) {
    return { ok: true, count: ids.length };
  }

  await writeCartIds(next);
  revalidatePath("/cart");

  return { ok: true, count: next.length };
}

/**
 * Completes the purchase and empties the cart.
 *
 * **This is the sign-in gate.** The cart page also hides the payment form from
 * signed-out visitors, but that's a courtesy — Server Functions are reachable
 * by direct POST, not only through the UI
 * (node_modules/next/dist/docs/01-app/01-getting-started/07-mutating-data.md),
 * so the check that counts is the one here.
 *
 * No order row is written and no payment is taken: like the single-product
 * "Buy now" flow this stands in for a real checkout. Clearing the cart is the
 * only lasting effect, which is why it happens last — an error above it leaves
 * the buyer's cart intact.
 */
export async function checkoutCart(): Promise<CartActionResult> {
  const session = await getSession();

  if (!session) {
    return signedOut();
  }

  const ids = await readCartIds();

  if (ids.length === 0) {
    return { ok: false, error: strings.errors.cartEmpty };
  }

  // TODO: take payment and record an order before clearing the cart.
  await writeCartIds([]);
  revalidatePath("/cart");

  return { ok: true, count: 0 };
}

/**
 * The sign-in gate for "Buy now" — the single-product checkout that skips the
 * cart entirely (components/store/product-checkout-flow.tsx).
 *
 * Buying needs an account whichever route the buyer took, so this enforces
 * exactly what `checkoutCart` does. The product page also swaps the button for
 * a sign-in link when there's no session, but that is presentation: this is the
 * check that can't be clicked past.
 *
 * The return path is built here from the product's own row rather than accepted
 * as an argument. The client knows its URL, but a redirect target supplied by
 * the caller is a redirect target an attacker can supply — deriving it server
 * side means there is nothing to validate.
 */
export async function checkoutProduct(
  productId: number,
): Promise<CheckoutResult> {
  const session = await getSession();

  if (!session) {
    const [product] = await listProductsByIds([productId]);
    const next = product
      ? `/${product.handle}/${product.id}/${product.slug}`
      : "/";

    return {
      ok: false,
      error: strings.errors.signInToCheckout,
      signInHref: signInToCheckoutHref(next),
    };
  }

  if (!(await isLiveProduct(productId))) {
    return { ok: false, error: strings.errors.productNotFound };
  }

  // TODO: take payment and record an order.
  return { ok: true };
}
