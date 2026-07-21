import { StoreFooter } from "@/components/store/store-footer"
import { StoreNav } from "@/components/store/store-nav"
import type { Creator } from "@/lib/server/dal/creators"

/**
 * Nav + footer around a storefront page. It lives here rather than in
 * `(store)/layout.tsx` because the chrome needs the creator behind `[handle]`,
 * and a route-group layout sits above that segment so it never sees the param.
 */
export function StoreChrome({
  creator,
  children,
}: {
  creator: Creator | null
  children: React.ReactNode
}) {
  return (
    <>
      <StoreNav creator={creator} />
      <div className="flex-1">{children}</div>
      <StoreFooter creator={creator} />
    </>
  )
}
