"use client"

import Link from "next/link"
import {
  ChartLineIcon,
  LifebuoyIcon,
  PackageIcon,
  ReceiptIcon,
  UsersIcon,
} from "@phosphor-icons/react"

import { Button } from "@/components/ui/button"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"

const manage = [
  {
    title: "Products",
    href: "/products",
    description: "Create and organize the items in your catalog.",
    icon: PackageIcon,
  },
  {
    title: "Orders",
    href: "/orders",
    description: "Track fulfillment and manage refunds.",
    icon: ReceiptIcon,
  },
  {
    title: "Customers",
    href: "/customers",
    description: "View profiles, segments, and lifetime value.",
    icon: UsersIcon,
  },
  {
    title: "Analytics",
    href: "/analytics",
    description: "Understand revenue, traffic, and conversion.",
    icon: ChartLineIcon,
  },
]

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b bg-background/80 px-4 backdrop-blur">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-1 !h-5" />

      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuLink
              className={navigationMenuTriggerStyle()}
              render={<Link href="/dashboard" />}
            >
              Dashboard
            </NavigationMenuLink>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <NavigationMenuTrigger>Manage</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid w-[26rem] grid-cols-2 gap-1">
                {manage.map((item) => (
                  <li key={item.href}>
                    <NavigationMenuLink render={<Link href={item.href} />}>
                      <div className="flex items-start gap-3">
                        <item.icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                        <div className="space-y-1">
                          <div className="text-sm font-medium">
                            {item.title}
                          </div>
                          <p className="text-xs leading-snug text-muted-foreground">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </NavigationMenuLink>
                  </li>
                ))}
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <NavigationMenuLink
              className={navigationMenuTriggerStyle()}
              render={<Link href="/settings" />}
            >
              Settings
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>

      <div className="ml-auto flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          nativeButton={false}
          render={<Link href="/support" />}
        >
          <LifebuoyIcon />
          Support
        </Button>
        <Button size="sm" nativeButton={false} render={<Link href="/login" />}>
          Sign in
        </Button>
      </div>
    </header>
  )
}
