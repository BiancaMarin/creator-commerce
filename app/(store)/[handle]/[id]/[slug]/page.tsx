import type { Metadata } from "next"
import { notFound, redirect } from "next/navigation"

import { ProductCheckoutFlow } from "@/components/store/product-checkout-flow"
import { strings } from "@/constants/strings"
import { getCreatorByHandle } from "@/lib/server/dal/creators"
import { getProductByHandleAndId } from "@/lib/server/dal/products"

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

  return <ProductCheckoutFlow product={product} storeHandle={handle} />
}
