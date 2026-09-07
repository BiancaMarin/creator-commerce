import Link from "next/link"
import { ShoppingBagIcon, SquaresFourIcon } from "@phosphor-icons/react/dist/ssr"

import { Button } from "@/components/ui/button"
import { LogoMark } from "@/components/marketing/logo"
import { strings } from "@/constants/strings"
import { readCartIds } from "@/lib/server/cart"
import type { Creator } from "@/lib/server/dal/creators"
import { getSession } from "@/lib/server/dal/session"

export async function StoreNav({ creator }: { creator: Creator | null }) {
  // Counted from the cookie rather than from resolved rows: the badge appears
  // on every storefront page, and a DB round trip per page view is a poor trade
  // for catching the one case they differ — a product deleted while it sat in
  // someone's cart. That id disappears from /cart immediately and from the
  // count on the next cart change.
  const [cartIds, session] = await Promise.all([readCartIds(), getSession()])
  const cartCount = cartIds.length
  // `null` means a store page that isn't scoped to a creator (a checkout
  // return without a handle) — fall back to platform branding. The `as const`
  // keeps the literal types typed routes need; a plain ternary widens to string.
  const homeHref = creator ? (`/${creator.handle}` as const) : ("/" as const)

  return (
    <header className="sticky top-0 z-20 flex h-[60px] items-center gap-4 border-b bg-background/80 px-8 backdrop-blur-md">
      <Link href={homeHref} className="flex items-center gap-2 font-semibold">
        <span className="flex size-[30px] items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <LogoMark />
        </span>
        {creator ? creator.handle : strings.store.brand}
      </Link>
      <nav className="ml-6 hidden items-center gap-5 text-sm text-muted-foreground sm:flex">
        <Link href={homeHref} className="text-foreground">
          {strings.store.shop}
        </Link>
        <a href="#" className="hover:text-foreground">
          {strings.store.about}
        </a>
      </nav>
      <div className="ml-auto flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon-sm"
          className="relative"
          nativeButton={false}
          render={<Link href="/cart" />}
          // The badge is decorative, so the count has to live in the accessible
          // name instead.
          aria-label={
            cartCount > 0
              ? strings.cart.navLabel.replace("{count}", String(cartCount))
              : strings.cart.navLabelEmpty
          }
        >
          <ShoppingBagIcon />
          {cartCount > 0 && (
            <span
              aria-hidden
              className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground"
            >
              {cartCount}
            </span>
          )}
        </Button>
        {/* A storefront is public, so this is the only place the nav cares
            about the session — and the button was previously "Sign in"
            unconditionally, which offered a signed-in buyer a login page they
            didn't need. Signed in, the useful destination is the app they came
            from: their dashboard, and from there their downloads. */}
        {session ? (
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<Link href="/dashboard" />}
          >
            <SquaresFourIcon />
            {strings.store.dashboard}
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<Link href="/login" />}
          >
            {strings.store.signIn}
          </Button>
        )}
      </div>
    </header>
  )
}
