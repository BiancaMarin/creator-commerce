import type { Metadata } from "next"

import { CartView } from "@/components/store/cart-view"
import { StoreChrome } from "@/components/store/store-chrome"
import { strings } from "@/constants/strings"
import { readCartIds } from "@/lib/server/cart"
import { listPurchasedProductIds } from "@/lib/server/dal/orders"
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

  // Which rows are the viewer's own products — they can't buy those, and
  // `checkoutCart` refuses the whole cart while any are present. Resolved here
  // because `CartItem` is the client-safe shape and carries no `userId`.
  const ownedIds = session
    ? items
        .filter((product) => product.userId === session.user.id)
        .map((product) => product.id)
    : []

  // Which rows the viewer has already bought. A digital product is delivered
  // once, so these block checkout the same way the viewer's own products do —
  // `checkoutCart` refuses the whole cart while any are present.
  //
  // Batched rather than asked per row: `listPurchasedProductIds` is the whole
  // reason that function exists beside `hasPurchasedProduct`.
  const purchasedIds = session
    ? [...(await listPurchasedProductIds(
        session.user.id,
        items.map((product) => product.id),
      ))]
    : []

  return (
    // No creator: a cart spans storefronts, so the chrome falls back to
    // platform branding rather than claiming to belong to one shop.
    <StoreChrome creator={null}>
      <CartView
        items={items}
        signedIn={Boolean(session)}
        ownedIds={ownedIds}
        purchasedIds={purchasedIds}
        email={session?.user.email ?? ""}
      />
    </StoreChrome>
  )
}
