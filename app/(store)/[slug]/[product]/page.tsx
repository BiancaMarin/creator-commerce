import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { ProductCheckoutFlow } from "@/components/store/product-checkout-flow"
import { creator, getProduct } from "@/lib/store-data"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ product: string }>
}): Promise<Metadata> {
  const { product } = await params
  const found = getProduct(product)
  return {
    title: found
      ? `${found.name} — ${creator.name}`
      : "Product — Creator Commerce",
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string; product: string }>
}) {
  const { slug, product } = await params
  const found = getProduct(product)
  if (!found) notFound()

  return <ProductCheckoutFlow product={found} storeSlug={slug} />
}
