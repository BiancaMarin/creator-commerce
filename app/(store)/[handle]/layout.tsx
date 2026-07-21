import { notFound } from "next/navigation"

import { StoreChrome } from "@/components/store/store-chrome"
import { getCreatorByHandle } from "@/lib/server/dal/creators"

export default async function StorefrontLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ handle: string }>
}) {
  const { handle } = await params
  const creator = await getCreatorByHandle(handle)

  // No user owns this handle, so there is no store to show — 404 the whole
  // subtree rather than rendering chrome around an empty shop.
  if (!creator) {
    notFound()
  }

  return <StoreChrome creator={creator}>{children}</StoreChrome>
}
