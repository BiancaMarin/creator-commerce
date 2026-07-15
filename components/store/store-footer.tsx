import { creator } from "@/lib/store-data"

export function StoreFooter() {
  return (
    <footer className="flex items-center justify-between border-t px-8 py-6 text-sm text-muted-foreground">
      <span>© 2026 {creator.name}</span>
      <span>
        Powered by <b className="text-foreground">Creator Commerce</b>
      </span>
    </footer>
  )
}
