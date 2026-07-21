import type { Metadata } from "next"
import { notFound, redirect } from "next/navigation"

import { ProductCheckoutFlow } from "@/components/store/product-checkout-flow"
import { strings } from "@/constants/strings"
import { getCreatorByHandle } from "@/lib/server/dal/creators"
import { getProduct } from "@/lib/store-data"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string; id: string }>
}): Promise<Metadata> {
  const { handle, id } = await params
  const found = getProduct(id)

  if (!found) {
    return { title: `Product — ${strings.store.brand}` }
  }

  const creator = await getCreatorByHandle(handle)

  return {
    title: `${found.name} — ${creator?.name ?? strings.store.brand}`,
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
