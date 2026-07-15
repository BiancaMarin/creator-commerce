import Link from "next/link"
import { ShoppingBagIcon } from "@phosphor-icons/react/dist/ssr"

import { Button } from "@/components/ui/button"
import { LogoMark } from "@/components/marketing/logo"
import { creator } from "@/lib/store-data"

export function StoreNav() {
  return (
    <header className="sticky top-0 z-20 flex h-[60px] items-center gap-4 border-b bg-background/80 px-8 backdrop-blur-md">
      <Link
        href={`/${creator.slug}`}
        className="flex items-center gap-2 font-semibold"
      >
        <span className="flex size-[30px] items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <LogoMark />
        </span>
        {creator.handle}
      </Link>
      <nav className="ml-6 hidden items-center gap-5 text-sm text-muted-foreground sm:flex">
        <Link href={`/${creator.slug}`} className="text-foreground">
          Shop
        </Link>
        <a href="#" className="hover:text-foreground">
          About
        </a>
      </nav>
      <div className="ml-auto flex items-center gap-2">
        <Button variant="ghost" size="icon-sm" aria-label="Cart">
          <ShoppingBagIcon />
        </Button>
        <Button
          variant="outline"
          size="sm"
          nativeButton={false}
          render={<Link href="/login" />}
        >
          Sign in
        </Button>
      </div>
    </header>
  )
}
