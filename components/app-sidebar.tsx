"use client"

import * as React from "react"
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
  UsersIcon,
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
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"

const navMain = [
  { title: "Dashboard", href: "/dashboard", icon: HouseIcon },
  { title: "Explore", href: "/explore", icon: MagnifyingGlassIcon },
  { title: "Products", href: "/products", icon: PackageIcon },
  { title: "Orders", href: "/orders", icon: ReceiptIcon },
  { title: "Customers", href: "/customers", icon: UsersIcon },
  { title: "Analytics", href: "/analytics", icon: ChartLineIcon },
  { title: "Wishlist", href: "/wishlist", icon: HeartIcon },
  { title: "Downloads", href: "/downloads", icon: FileArrowDownIcon },
  // `as const` keeps each href a literal type — typed routes reject a widened
  // `string`, and this is what makes a dead nav link a build error.
] as const

export function AppSidebar({
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & { user: NavUserProps }) {
  const pathname = usePathname()

  const isActive = (href: string) => pathname.startsWith(href)

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
                  Seller
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Platform</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navMain.map((item) => (
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
              ))}
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
