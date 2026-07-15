import { StoreFooter } from "@/components/store/store-footer"
import { StoreNav } from "@/components/store/store-nav"

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-svh flex-col">
      <StoreNav />
      <div className="flex-1">{children}</div>
      <StoreFooter />
    </div>
  )
}
