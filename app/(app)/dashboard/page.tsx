import type { Metadata } from "next"
import Link from "next/link"
import {
  ArrowUpRightIcon,
  CurrencyDollarIcon,
  ExportIcon,
  PackageIcon,
  PlusIcon,
  ReceiptIcon,
  TrendDownIcon,
  TrendUpIcon,
  UsersIcon,
} from "@phosphor-icons/react/dist/ssr"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Dashboard · Creator Commerce",
  description: "Revenue, orders, and customer activity at a glance.",
}

const stats = [
  {
    label: "Revenue",
    value: "$48,120",
    delta: "+12.4%",
    trend: "up" as const,
    hint: "vs. last 30 days",
    icon: CurrencyDollarIcon,
  },
  {
    label: "Orders",
    value: "1,204",
    delta: "+8.1%",
    trend: "up" as const,
    hint: "vs. last 30 days",
    icon: ReceiptIcon,
  },
  {
    label: "New customers",
    value: "318",
    delta: "+4.7%",
    trend: "up" as const,
    hint: "vs. last 30 days",
    icon: UsersIcon,
  },
  {
    label: "Conversion",
    value: "3.2%",
    delta: "-0.4%",
    trend: "down" as const,
    hint: "vs. last 30 days",
    icon: TrendUpIcon,
  },
]

const recentOrders = [
  {
    id: "#3812",
    customer: "Amara Okafor",
    product: "Studio Preset Pack",
    amount: "$48.00",
    status: "paid" as const,
  },
  {
    id: "#3811",
    customer: "Leo Nakamura",
    product: "Lightroom Masterclass",
    amount: "$129.00",
    status: "paid" as const,
  },
  {
    id: "#3810",
    customer: "Sofia Rossi",
    product: "Brand Kit Templates",
    amount: "$64.00",
    status: "refunded" as const,
  },
  {
    id: "#3809",
    customer: "Daniel Weber",
    product: "Studio Preset Pack",
    amount: "$48.00",
    status: "pending" as const,
  },
  {
    id: "#3808",
    customer: "Priya Menon",
    product: "1:1 Coaching Call",
    amount: "$220.00",
    status: "paid" as const,
  },
]

const topProducts = [
  { name: "Studio Preset Pack", sales: 412, share: 82 },
  { name: "Lightroom Masterclass", sales: 286, share: 57 },
  { name: "Brand Kit Templates", sales: 173, share: 34 },
  { name: "1:1 Coaching Call", sales: 64, share: 13 },
]

const badgeFor: Record<string, React.ComponentProps<typeof Badge>["variant"]> = {
  paid: "success",
  pending: "warning",
  refunded: "neutral",
  failed: "destructive",
}

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
}

export default function DashboardPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Here&apos;s how your storefront is performing this month.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <ExportIcon />
            Export
          </Button>
          <Button
            size="sm"
            nativeButton={false}
            render={<Link href="/products" />}
          >
            <PlusIcon />
            New product
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const TrendIcon = stat.trend === "up" ? TrendUpIcon : TrendDownIcon
          return (
            <Card key={stat.label} size="sm">
              <CardHeader>
                <CardDescription>{stat.label}</CardDescription>
                <CardTitle className="text-2xl">{stat.value}</CardTitle>
                <CardAction>
                  <span className="flex size-9 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                    <stat.icon className="size-4" />
                  </span>
                </CardAction>
              </CardHeader>
              <CardFooter className="gap-1.5 text-xs text-muted-foreground">
                <span
                  className={cn(
                    "inline-flex items-center gap-1 font-medium",
                    stat.trend === "up" ? "text-success" : "text-destructive"
                  )}
                >
                  <TrendIcon className="size-3.5" />
                  {stat.delta}
                </span>
                {stat.hint}
              </CardFooter>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent orders</CardTitle>
            <CardDescription>Your latest 5 orders across the store.</CardDescription>
            <CardAction>
              <Button
                variant="ghost"
                size="sm"
                nativeButton={false}
                render={<Link href="/orders" />}
              >
                View all
                <ArrowUpRightIcon />
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent className="flex flex-col">
            {recentOrders.map((order, index) => (
              <div key={order.id}>
                {index > 0 && <Separator />}
                <div className="flex items-center gap-3 py-3">
                  <Avatar>
                    <AvatarFallback className="text-xs font-medium">
                      {initials(order.customer)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {order.customer}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {order.product} · {order.id}
                    </p>
                  </div>
                  <Badge variant={badgeFor[order.status]} className="capitalize">
                    {order.status}
                  </Badge>
                  <span className="w-16 text-right font-mono text-sm font-medium">
                    {order.amount}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top products</CardTitle>
            <CardDescription>Best sellers this month.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {topProducts.map((product) => (
              <div key={product.name} className="space-y-1.5">
                <div className="flex items-center justify-between gap-2 text-sm">
                  <span className="flex min-w-0 items-center gap-2">
                    <PackageIcon className="size-4 shrink-0 text-muted-foreground" />
                    <span className="truncate font-medium">{product.name}</span>
                  </span>
                  <span className="shrink-0 text-muted-foreground tabular-nums">
                    {product.sales}
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${product.share}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
          <CardFooter>
            <Button
              variant="outline"
              className="w-full"
              nativeButton={false}
              render={<Link href="/analytics" />}
            >
              View analytics
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
