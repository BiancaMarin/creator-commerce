"use server";

import { revalidatePath } from "next/cache";

import { strings } from "@/constants/strings";
import { MAX_CART_ITEMS } from "@/lib/schemas/cart";
import { readCartIds, writeCartIds } from "@/lib/server/cart";
import { startCheckout } from "@/lib/server/checkout";
import { getSession } from "@/lib/server/dal/session";
import {
  hasPurchasedProduct,
  listPurchasedProductIds,
} from "@/lib/server/dal/orders";
import { listProductsByIds } from "@/lib/server/dal/products";
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

/**
 * What a checkout hands back: the Stripe-hosted page to send the buyer to.
 *
 * A URL for the caller to navigate to rather than a `redirect()` from inside
 * the action. `redirect` throws, which from a pending transition surfaces as an
 * unexplained failure and gives the form no chance to leave its button disabled
 * while the browser is still on this page.
 */
export type CheckoutResult =
  | { ok: true; url: string }
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

  const [product] = await listProductsByIds([productId]);

  if (!product) {
    return { ok: false, error: strings.errors.productNotFound };
  }

  // A creator can't buy their own product, so there's no reason to let one into
  // the cart — it would only fail at checkout, after they'd been shown a total
  // including it. Checked here as a courtesy; `checkoutCart` is the gate that
  // counts, since this action is reachable by an anonymous caller who has no
  // owner to compare against.
  const session = await getSession();

  if (session && product.userId === session.user.id) {
    return { ok: false, error: strings.errors.cannotBuyOwnProduct };
  }

  // Same courtesy for something already bought: a digital product is delivered
  // once and there is nothing a second copy would give the buyer. Only
  // checkable with a session — an anonymous visitor has no purchase history to
  // compare against, which is exactly why `checkoutCart` re-checks after
  // sign-in rather than trusting this.
  if (session && (await hasPurchasedProduct(session.user.id, productId))) {
    return { ok: false, error: strings.errors.alreadyPurchased };
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
 * Opens a Stripe Checkout Session for everything in the cart.
 *
 * **This is the sign-in gate.** The cart page also hides the payment button
 * from signed-out visitors, but that's a courtesy — Server Functions are
 * reachable by direct POST, not only through the UI
 * (node_modules/next/dist/docs/01-app/01-getting-started/07-mutating-data.md),
 * so the check that counts is the one here.
 *
 * The cart is **not** cleared here. Nothing has been paid at this point — the
 * buyer is only being sent to a payment page they may well abandon, and
 * emptying their cart on the way out would lose it. It is cleared once the
 * purchase is confirmed, by `clearPurchasedFromCart` on the receipt page.
 *
 * Prices come from `listProductsByIds`, never from the client. That read also
 * drops soft-deleted products, so a cart holding a retired listing checks out
 * with what's left rather than charging for something unbuyable.
 */
export async function checkoutCart(): Promise<CheckoutResult> {
  const session = await getSession();

  if (!session) {
    return {
      ok: false,
      error: strings.errors.signInToCheckout,
      signInHref: SIGN_IN_HREF,
    };
  }

  const ids = await readCartIds();

  if (ids.length === 0) {
    return { ok: false, error: strings.errors.cartEmpty };
  }

  const products = await listProductsByIds(ids);

  if (products.length === 0) {
    return { ok: false, error: strings.errors.cartEmpty };
  }

  // A creator can't buy their own product. Refuse the whole cart rather than
  // quietly dropping those lines: silently charging for less than the cart
  // showed is the worse failure, and the cart page marks each offending row so
  // the fix is one click. `addToCart` already turns these away — this catches
  // a cart filled before the rule existed, or one built while signed out and
  // paid for after signing in as the seller.
  if (products.some((product) => product.userId === session.user.id)) {
    return { ok: false, error: strings.errors.cartHasOwnProducts };
  }

  // Nothing in the cart may already be owned. **This is the check that counts**
  // — `addToCart` can't make it, because the cart is open to anonymous
  // visitors, so a cart filled while signed out and paid for after signing in
  // reaches here having never been tested.
  //
  // Refuses the whole cart rather than dropping the owned lines, for the same
  // reason as the rule above it: charging for less than the cart displayed is
  // the worse failure. The cart page marks each offending row, so the fix is
  // one click.
  const purchased = await listPurchasedProductIds(
    session.user.id,
    products.map((product) => product.id),
  );

  if (purchased.size > 0) {
    return { ok: false, error: strings.errors.cartHasPurchased };
  }

  try {
    const url = await startCheckout({
      buyerId: session.user.id,
      email: session.user.email,
      products,
      cancelPath: "/cart",
      // Only brand the receipt when the whole cart came from one storefront.
      // A cart spanning creators has no single "back to shop" to return to.
      storeHandle:
        new Set(products.map((product) => product.handle)).size === 1
          ? products[0].handle
          : undefined,
    });

    return { ok: true, url };
  } catch (error) {
    // Stripe being unreachable, a missing key, a rejected line item. The buyer
    // gets one sentence; the detail goes to the server log, where it can name
    // the failure without handing an error string to whoever POSTed.
    console.error("[checkout] could not start cart checkout", error);

    return { ok: false, error: strings.errors.checkoutFailed };
  }
}

/**
 * Drops from the cart everything the buyer has now paid for.
 *
 * Called from the receipt page, which is the first moment this app knows a
 * payment succeeded *and* is in a Server Action able to write a cookie —
 * the webhook confirms the payment but has no access to the buyer's cookies,
 * and a page render can't set one (lib/server/cart.ts).
 *
 * Filters by what was actually purchased rather than emptying the cart, so a
 * cart the buyer added to in another tab while paying keeps those additions.
 * Safe to call more than once: the second call finds nothing to remove.
 */
export async function clearPurchasedFromCart(): Promise<CartActionResult> {
  const session = await getSession();

  if (!session) {
    return signedOut();
  }

  const ids = await readCartIds();

  if (ids.length === 0) {
    return { ok: true, count: 0 };
  }

  const purchased = await listPurchasedProductIds(session.user.id, ids);
  const next = ids.filter((id) => !purchased.has(id));

  if (next.length === ids.length) {
    return { ok: true, count: ids.length };
  }

  await writeCartIds(next);
  revalidatePath("/cart");

  return { ok: true, count: next.length };
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

  const [product] = await listProductsByIds([productId]);

  // `listProductsByIds` already filters out soft-deleted rows, so a missing
  // product here covers both "never existed" and "retired since the page
  // rendered" — the same answer either way.
  if (!product) {
    return { ok: false, error: strings.errors.productNotFound };
  }

  // The "Buy now" half of the same rule. The product page hides the button for
  // an owner, but this is the check that can't be clicked past.
  if (product.userId === session.user.id) {
    return { ok: false, error: strings.errors.cannotBuyOwnProduct };
  }

  // The "Buy now" half of buy-once. The page swaps the button for a download
  // link, but this is the check that can't be clicked past — and the one that
  // catches a product bought in another tab since this page rendered.
  if (await hasPurchasedProduct(session.user.id, product.id)) {
    return { ok: false, error: strings.errors.alreadyPurchased };
  }

  try {
    const url = await startCheckout({
      buyerId: session.user.id,
      email: session.user.email,
      products: [product],
      cancelPath: `/${product.handle}/${product.id}/${product.slug}`,
      storeHandle: product.handle,
    });

    return { ok: true, url };
  } catch (error) {
    console.error("[checkout] could not start product checkout", error);

    return { ok: false, error: strings.errors.checkoutFailed };
  }
}
