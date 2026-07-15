import Link from "next/link"
import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr"

import { Button } from "@/components/ui/button"
import { Logo } from "@/components/marketing/logo"
import { strings } from "@/constants/strings"

const navLinks = [
  { href: "#features", label: strings.marketing.nav.features },
  { href: "#how", label: strings.marketing.nav.how },
  { href: "#pricing", label: strings.marketing.nav.pricing },
  { href: "#", label: strings.marketing.nav.docs },
]

export function MarketingNav() {
  return (
    <header className="border-b bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1120px] items-center gap-6 px-8">
        <Logo />
        <nav className="ml-4 hidden items-center gap-6 text-sm text-muted-foreground md:flex">
          {navLinks.map((link) => (
            <a key={link.label} href={link.href} className="hover:text-foreground">
              {link.label}
            </a>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            nativeButton={false}
            render={<Link href="/login" />}
          >
            {strings.marketing.nav.signIn}
          </Button>
          <Button
            size="sm"
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
