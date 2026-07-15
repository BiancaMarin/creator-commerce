"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { HouseIcon, PackageIcon } from "@phosphor-icons/react"

import { cn } from "@/lib/utils"

export function AdminSidebar({ slug }: { slug: string }) {
  const pathname = usePathname()

  const items = [
    { title: "Dashboard", href: `/${slug}/dashboard`, icon: HouseIcon },
    { title: "Products", href: `/${slug}/products`, icon: PackageIcon },
  ]

  return (
    <aside className="hidden w-56 shrink-0 border-r md:block">
      <div className="sticky top-[61px] p-3">
        <p className="px-3 py-2 text-xs font-medium text-muted-foreground">
          Manage
        </p>
        <nav className="flex flex-col gap-1">
          {items.map((item) => {
            const active = pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2.5 rounded-2xl px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                )}
              >
                <item.icon className="size-4" />
                {item.title}
              </Link>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}
