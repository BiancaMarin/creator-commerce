import Link from "next/link"
import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr"

import { LocaleToggle } from "@/components/i18n/locale-toggle"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/marketing/logo"
import { getSession } from "@/lib/server/dal/session"
import { getStrings } from "@/lib/server/i18n"
import { getInitials } from "@/lib/utils"

export async function MarketingNav() {
  const [strings, session] = await Promise.all([getStrings(), getSession()])
  const user = session?.user
  const displayName = user?.name?.trim() || strings.account.fallbackName
  const navLinks = [
    // Rooted at "/" so the section links still work from /docs.
    { href: "/#features", label: strings.marketing.nav.features },
    { href: "/#how", label: strings.marketing.nav.how },
    { href: "/#pricing", label: strings.marketing.nav.pricing },
  ]

  // No separate "Sign in": "Get started" leads to signup, which links to
  // login, so one call to action keeps the bar uncluttered.
  return (
    <header className="border-b bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-[72px] max-w-[1120px] items-center gap-8 px-8">
        <Logo />
        <nav className="ml-6 hidden items-center gap-9 text-sm text-muted-foreground md:flex">
          {navLinks.map((link) => (
            <a key={link.label} href={link.href} className="hover:text-foreground">
              {link.label}
            </a>
          ))}
          <Link href="/docs" className="hover:text-foreground">
            {strings.marketing.nav.docs}
          </Link>
        </nav>
        <div className="ml-auto flex items-center gap-4">
          <LocaleToggle />
          {/* Signed in, "Get started" would offer a signup they don't need;
              the avatar shows they're in and takes them back to the app. */}
          {user ? (
            <Link
              href="/dashboard"
              title={strings.store.dashboard}
              className="flex items-center gap-2 rounded-full border bg-background py-1 pr-3.5 pl-1 text-sm font-medium transition-colors hover:bg-muted"
            >
              <Avatar className="size-7">
                {user.image && <AvatarImage src={user.image} alt="" />}
                <AvatarFallback className="bg-brand-gradient text-xs font-medium text-white">
                  {getInitials(displayName) || "?"}
                </AvatarFallback>
              </Avatar>
              <span className="max-w-[140px] truncate">{displayName}</span>
            </Link>
          ) : (
            <Button
              size="sm"
              className="bg-gradient-to-r from-primary to-brand-indigo text-white hover:opacity-90"
              nativeButton={false}
              render={<Link href="/signup" />}
            >
              {strings.marketing.nav.getStarted}
              <ArrowRightIcon />
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
