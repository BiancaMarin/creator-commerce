import type { Metadata } from "next"

import { CartView } from "@/components/store/cart-view"
import { StoreChrome } from "@/components/store/store-chrome"
import { strings } from "@/constants/strings"
import { readCartIds } from "@/lib/server/cart"
import { getSession } from "@/lib/server/dal/session"
import { listProductsByIds } from "@/lib/server/dal/products"

export const metadata: Metadata = {
  title: `${strings.cart.title} — ${strings.store.brand}`,
}

export default async function CartPage() {
  const ids = await readCartIds()

  // Reading the session here isn't the redundant re-check the auth notes warn
  // about: `(store)` is an ungated route group, so nothing above this page has
  // looked at it. It decides what the checkout button says, not what renders.
  const [session, products] = await Promise.all([
    getSession(),
    listProductsByIds(ids),
  ])

  // Restore the order products were added in — `listProductsByIds` has no
  // ordering of its own, and a cart that reshuffles between requests reads as a
  // bug. Mapping ids onto rows also drops any that no longer resolve, which is
  // how a soft-deleted product leaves the cart.
  const byId = new Map(products.map((product) => [product.id, product]))
  const items = ids
    .map((id) => byId.get(id))
    .filter((product) => product !== undefined)

  return (
    // No creator: a cart spans storefronts, so the chrome falls back to
    // platform branding rather than claiming to belong to one shop.
    <StoreChrome creator={null}>
      <CartView
        items={items}
        signedIn={Boolean(session)}
        email={session?.user.email ?? ""}
      />
    </StoreChrome>
  )
}
