import { strings } from "@/constants/strings"
import type { Creator } from "@/lib/server/dal/creators"

export function StoreFooter({ creator }: { creator: Creator | null }) {
  return (
    <footer className="flex items-center justify-between border-t px-8 py-6 text-sm text-muted-foreground">
      <span>
        © {new Date().getFullYear()} {creator ? creator.name : strings.store.brand}
      </span>
      <span>
        {strings.store.poweredBy}{" "}
        <b className="text-foreground">{strings.store.brand}</b>
      </span>
    </footer>
  )
}
