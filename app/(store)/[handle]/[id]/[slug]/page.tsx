import type { Metadata } from "next"
import { notFound, redirect } from "next/navigation"

import { ProductCheckoutFlow } from "@/components/store/product-checkout-flow"
import { creator, getProduct } from "@/lib/store-data"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const found = getProduct(id)
  return {
    title: found
      ? `${found.name} — ${creator.name}`
      : "Product — Creator Commerce",
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ handle: string; id: string; slug: string }>
}) {
  const { handle, id, slug } = await params
  const found = getProduct(id)
  if (!found) notFound()

  // The slug is decorative — `id` already identified the product. When it is
  // stale (product renamed) or simply wrong, canonicalise instead of 404ing so
  // older links keep resolving.
  if (slug !== found.slug) {
    redirect(`/${handle}/${found.id}/${found.slug}`)
  }

  return <ProductCheckoutFlow product={found} storeHandle={handle} />
}
