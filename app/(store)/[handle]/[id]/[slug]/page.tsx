import type { Metadata } from "next"
import { notFound, redirect } from "next/navigation"

import { TrackEvent } from "@/components/analytics/track-event"
import { ProductCheckoutFlow } from "@/components/store/product-checkout-flow"
import { strings } from "@/constants/strings"
import { ANALYTICS_EVENTS } from "@/lib/analytics/events"
import { readCartIds } from "@/lib/server/cart"
import { getCreatorByHandle } from "@/lib/server/dal/creators"
import { hasPurchasedProduct } from "@/lib/server/dal/orders"
import { getProductByHandleAndId } from "@/lib/server/dal/products"
import { getSession } from "@/lib/server/dal/session"

/** "/alice/7/whatever" — the id segment must be an integer to be a product. */
function parseId(id: string) {
  const parsed = Number(id)

  return Number.isInteger(parsed) ? parsed : null
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string; id: string }>
}): Promise<Metadata> {
  const { handle, id } = await params
  const productId = parseId(id)
  const product = productId
    ? await getProductByHandleAndId(handle, productId)
    : null

  if (!product) {
    return { title: `Product — ${strings.store.brand}` }
  }

  const creator = await getCreatorByHandle(handle)

  return {
    title: `${product.name} — ${creator?.name ?? strings.store.brand}`,
    description: product.description,
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ handle: string; id: string; slug: string }>
}) {
  const { handle, id, slug } = await params
  const productId = parseId(id)

  if (!productId) {
    notFound()
  }

  const product = await getProductByHandleAndId(handle, productId)

  if (!product) {
    notFound()
  }

  // The slug is decorative — `id` already identified the product. When it is
  // stale (product renamed) or simply wrong, canonicalise instead of 404ing so
  // older links keep resolving.
  if (slug !== product.slug) {
    redirect(`/${handle}/${product.id}/${product.slug}`)
  }

  // Resolved here rather than in the button so they're right on first paint.
  // Read after the redirect above, which would otherwise waste the lookups.
  //
  // The storefront is public, so this is the first look at the session on this
  // route — it decides whether "Buy now" opens the payment form or sends the
  // visitor to sign in. `checkoutProduct` is what enforces that either way.
  const [cartIds, session] = await Promise.all([readCartIds(), getSession()])

  // Whether this buyer already owns it — a digital product sells once, so this
  // decides between a buy button and a link to the file they already have.
  // Sequential rather than in the Promise.all above: it needs the session.
  // `checkoutProduct` re-checks it, which is what actually enforces the rule.
  const hasPurchased = session
    ? await hasPurchasedProduct(session.user.id, product.id)
    : false

  return (
    <>
      {/* Funnel step 2. Fired after the slug redirect above, so a canonicalised
          URL counts one view rather than two. */}
      <TrackEvent
        event={ANALYTICS_EVENTS.productViewed}
        userId={session?.user.id}
        properties={{
          product_id: product.id,
          product_name: product.name,
          handle,
          price: product.price,
          // Both exclude the viewer from the funnel's later steps by design —
          // the buy button isn't offered — so the drop-off is explainable
          // rather than mysterious.
          is_owner: session?.user.id === product.userId,
          has_purchased: hasPurchased,
        }}
      />
      <ProductCheckoutFlow
        product={product}
        storeHandle={handle}
      inCart={cartIds.includes(product.id)}
      signedIn={Boolean(session)}
      // Compared against the product's own `user_id`, not the storefront's
      // handle: this is the row that would be sold, so it's the row that
      // decides. `checkoutProduct` re-checks exactly this server side.
        isOwner={session?.user.id === product.userId}
        hasPurchased={hasPurchased}
        email={session?.user.email ?? ""}
      />
    </>
  )
}
