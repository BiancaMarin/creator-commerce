"use client"

import * as React from "react"
import type { Route } from "next"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  ChartLineIcon,
  FileArrowDownIcon,
  HeartIcon,
  HouseIcon,
  MagnifyingGlassIcon,
  PackageIcon,
  ReceiptIcon,
  ShoppingBagIcon,
  UsersIcon,
  type Icon,
} from "@phosphor-icons/react"

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
} from "@/components/ui/sidebar"
import { strings } from "@/constants/strings"

// `Route` is the union of real routes, so a dead multi-segment href is a type
// error here rather than a runtime 404. It can't catch a single-segment one —
// `/[handle]` swallows those.
type NavItem = { title: string; href: Route; icon: Icon }

// The account is one identity with two jobs: a creator sells their own products
// and buys other creators'. Splitting the nav by that keeps "Orders" (people
// buying from me) from sitting next to "Downloads" (what I bought), which read
// as the same thing when they're in one undifferentiated list.
const navHome: readonly NavItem[] = [
  { title: strings.nav.dashboard, href: "/dashboard", icon: HouseIcon },
]

const navSelling: readonly NavItem[] = [
  { title: strings.nav.products, href: "/products", icon: PackageIcon },
  { title: strings.nav.orders, href: "/orders", icon: ReceiptIcon },
  { title: strings.nav.customers, href: "/customers", icon: UsersIcon },
  { title: strings.nav.analytics, href: "/analytics", icon: ChartLineIcon },
]

const navBuying: readonly NavItem[] = [
  { title: strings.nav.explore, href: "/explore", icon: MagnifyingGlassIcon },
  { title: strings.nav.wishlist, href: "/wishlist", icon: HeartIcon },
  { title: strings.nav.downloads, href: "/downloads", icon: FileArrowDownIcon },
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
  const pathname = usePathname()

  const isActive = (href: string) => pathname.startsWith(href)

  const renderItems = (items: readonly NavItem[]) =>
    items.map((item) => (
      <SidebarMenuItem key={item.href}>
        <SidebarMenuButton
          isActive={isActive(item.href)}
          tooltip={item.title}
          render={<Link href={item.href} />}
        >
          <item.icon />
          <span>{item.title}</span>
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
              render={<Link href="/dashboard" />}
              tooltip="Creator Commerce"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
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
        {/* Unlabelled: the dashboard spans both roles, so filing it under one
            would misdescribe it. */}
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
          <SidebarMenuItem>
            <NavUser {...user} />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
