import Link from "next/link"
import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr"

import { LocaleToggle } from "@/components/i18n/locale-toggle"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/marketing/logo"
import { getStrings } from "@/lib/server/i18n"

export async function MarketingNav() {
  const strings = await getStrings()
  const navLinks = [
    { href: "#features", label: strings.marketing.nav.features },
    { href: "#how", label: strings.marketing.nav.how },
    { href: "#pricing", label: strings.marketing.nav.pricing },
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
        </nav>
        <div className="ml-auto flex items-center gap-4">
          <LocaleToggle />
          <Button
            size="sm"
            className="bg-gradient-to-r from-primary to-brand-indigo text-white hover:opacity-90"
            nativeButton={false}
            render={<Link href="/signup" />}
          >
            {strings.marketing.nav.getStarted}
            <ArrowRightIcon />
          </Button>
        </div>
      </div>
    </header>
  )
}
