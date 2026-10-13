"use client"

import * as React from "react"
import type { Route } from "next"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  ChartLineIcon,
  FileArrowDownIcon,
  HouseIcon,
  MagnifyingGlassIcon,
  PackageIcon,
  ReceiptIcon,
  ShoppingBagIcon,
  SparkleIcon,
  UsersIcon,
  type Icon,
} from "@phosphor-icons/react"

import { useCece } from "@/components/cece/cece-provider"
import { useStrings } from "@/components/i18n/i18n-provider"
import { LogoMark } from "@/components/marketing/logo"
import { NavUser, type NavUserProps } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar"
import type { Strings } from "@/lib/i18n"

// `Route` is the union of real routes, so a dead multi-segment href is a type
// error here rather than a runtime 404. It can't catch a single-segment one —
// `/[handle]` swallows those.
// Labels are named by key rather than stored, so the arrays can stay
// module-level while the text follows the reader's language.
type NavItem = { label: keyof Strings["nav"]; href: Route; icon: Icon }

// The account is one identity with two jobs: a creator sells their own products
// and buys other creators'. Splitting the nav by that keeps "Orders" (people
// buying from me) from sitting next to "Downloads" (what I bought), which read
// as the same thing when they're in one undifferentiated list.
const navHome: readonly NavItem[] = [
  { label: "dashboard", href: "/dashboard", icon: HouseIcon },
  { label: "explore", href: "/explore", icon: MagnifyingGlassIcon },
]

const navSelling: readonly NavItem[] = [
  { label: "products", href: "/products", icon: PackageIcon },
  { label: "orders", href: "/orders", icon: ReceiptIcon },
  { label: "customers", href: "/customers", icon: UsersIcon },
  { label: "analytics", href: "/analytics", icon: ChartLineIcon },
]

const navBuying: readonly NavItem[] = [
  { label: "downloads", href: "/downloads", icon: FileArrowDownIcon },
]

export function AppSidebar({
  user,
  cartCount,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  user: NavUserProps
  /** Products in the cart cookie, resolved server-side in (app)/layout.tsx. */
  cartCount: number
}) {
  const strings = useStrings()
  const pathname = usePathname()
  const cece = useCece()
  const { setOpenMobile } = useSidebar()

  const isActive = (href: string) => pathname.startsWith(href)

  const renderItems = (items: readonly NavItem[]) =>
    items.map((item) => (
      <SidebarMenuItem key={item.href}>
        <SidebarMenuButton
          isActive={isActive(item.href)}
          tooltip={strings.nav[item.label]}
          render={<Link href={item.href} />}
        >
          <item.icon />
          <span>{strings.nav[item.label]}</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    ))

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              render={<Link href="/" />}
              tooltip="Creator Commerce"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-brand-gradient text-white">
                <LogoMark className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">Creator Commerce</span>
                <span className="truncate text-xs text-sidebar-foreground/70">
                  {strings.nav.workspace}
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {/* Unlabelled: the dashboard and Explore span both roles (a creator
            browses the platform to see what sells, too), so filing them under
            one would misdescribe them. */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>{renderItems(navHome)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Group labels are hidden when the sidebar collapses to icons, so the
            separators are what keep the two roles visually apart there. */}
        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>{strings.nav.selling}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{renderItems(navSelling)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>{strings.nav.buying}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {renderItems(navBuying)}

              {/* Kept out of `navBuying` because it's the one entry with a
                  count, and because it leaves the app for a storefront route —
                  /cart renders under StoreChrome, not this sidebar, so it can
                  never be the active item. */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  // The badge is hidden when the sidebar collapses to icons, so
                  // the count has to survive in the tooltip that replaces it.
                  tooltip={
                    cartCount > 0
                      ? strings.cart.navLabel.replace(
                          "{count}",
                          String(cartCount),
                        )
                      : strings.cart.navLabelEmpty
                  }
                  render={<Link href="/cart" />}
                >
                  <ShoppingBagIcon />
                  <span>{strings.cart.navTitle}</span>
                </SidebarMenuButton>
                {cartCount > 0 && (
                  <SidebarMenuBadge className="bg-primary text-primary-foreground">
                    {cartCount}
                  </SidebarMenuBadge>
                )}
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          {/* In the footer rather than a nav group: it isn't a page, and it
              should sit in the same place whichever page someone is stuck on. */}
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip={strings.cece.navLabel}
              isActive={cece.open}
              onClick={() => {
                // On mobile the sidebar is itself a sheet; leaving it open
                // would stack two sheets.
                setOpenMobile(false)
                cece.setOpen(true)
              }}
            >
              <SparkleIcon weight="fill" className="text-brand-violet" />
              <span>{strings.cece.navLabel}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <NavUser {...user} />
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
