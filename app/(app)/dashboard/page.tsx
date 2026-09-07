import type { Metadata } from "next";
import Link from "next/link";
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
} from "@phosphor-icons/react/dist/ssr";

import { HandleForm } from "@/components/dashboard/handle-form";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { strings } from "@/constants/strings";
import {
  getSellerStats,
  listOrdersForSeller,
  listTopProductsForSeller,
} from "@/lib/server/dal/orders";
import { requireUser } from "@/lib/server/dal/session";
import { formatCents } from "@/lib/server/money";
import { cn, getInitials } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Dashboard · Creator Commerce",
  description: "Revenue, orders, and customer activity at a glance.",
};

const badgeFor: Record<string, React.ComponentProps<typeof Badge>["variant"]> =
  {
    paid: "success",
    pending: "warning",
    refunded: "neutral",
    failed: "destructive",
  };

/**
 * Percent change between two windows, or null when there's nothing to compare
 * against.
 *
 * A previous window of zero has no percentage — "up ∞%" from the first sale is
 * noise, not information — so the card omits the delta rather than inventing
 * one. That's also the normal state for a new creator.
 */
function deltaOf(current: number, previous: number): number | null {
  if (previous === 0) {
    return null;
  }

  return ((current - previous) / previous) * 100;
}

function formatDelta(delta: number) {
  return `${delta >= 0 ? "+" : ""}${delta.toFixed(1)}%`;
}

export default async function DashboardPage() {
  const user = await requireUser();
  const [stat, recentOrders, topProducts] = await Promise.all([
    getSellerStats(user.id),
    // Five, matching the card's own description.
    listOrdersForSeller(user.id, 5),
    listTopProductsForSeller(user.id),
  ]);

  // The average is over the window's orders, so it's undefined with none —
  // show a dash rather than dividing by zero.
  const averageOrder = stat.orders > 0 ? stat.revenue / stat.orders : null;

  const stats = [
    {
      label: "Revenue",
      value: formatCents(stat.revenue),
      delta: deltaOf(stat.revenue, stat.revenuePrevious),
      hint: "vs. previous 30 days",
      icon: CurrencyDollarIcon,
    },
    {
      label: "Orders",
      value: stat.orders.toLocaleString(),
      delta: deltaOf(stat.orders, stat.ordersPrevious),
      hint: "vs. previous 30 days",
      icon: ReceiptIcon,
    },
    {
      label: "Customers",
      value: stat.customers.toLocaleString(),
      delta: deltaOf(stat.customers, stat.customersPrevious),
      hint: "vs. previous 30 days",
      icon: UsersIcon,
    },
    {
      // Replaces the old "Conversion" tile. Conversion needs a view count, and
      // nothing here records page views — the figure would have to be invented.
      // Average order value comes from the same rows as the tiles beside it.
      label: "Avg. order",
      value: averageOrder === null ? "—" : formatCents(averageOrder),
      delta: null,
      hint: "last 30 days",
      icon: TrendUpIcon,
    },
  ];

  // Drives the bar widths: the best seller fills the track and the rest are
  // drawn relative to it. Without this a top seller of 3 units would render as
  // a 3%-wide sliver.
  const topSales = topProducts[0]?.sales ?? 0;

  // "Alex Rivera" -> "Alex". Falls back to the whole string for mononyms,
  // and to the email local part if the name is somehow blank.
  const firstName =
    user.name?.trim().split(/\s+/)[0] || user.email.split("@")[0];

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            {strings.dashboard.greeting.replace("{name}", firstName)}
          </h1>
          <p className="text-sm text-muted-foreground">
            {strings.dashboard.subtitle}
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

      <Tabs defaultValue="overview" className="gap-6">
        <TabsList>
          <TabsTrigger value="overview">
            {strings.dashboard.tabs.overview}
          </TabsTrigger>
          <TabsTrigger value="account">
            {strings.dashboard.tabs.account}
          </TabsTrigger>
          <TabsTrigger value="settings">
            {strings.dashboard.tabs.settings}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((entry) => {
              const TrendIcon =
                entry.delta !== null && entry.delta < 0
                  ? TrendDownIcon
                  : TrendUpIcon;

              return (
                <Card key={entry.label} size="sm">
                  <CardHeader>
                    <CardDescription>{entry.label}</CardDescription>
                    <CardTitle className="text-2xl">{entry.value}</CardTitle>
                    <CardAction>
                      <span className="flex size-9 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                        <entry.icon className="size-4" />
                      </span>
                    </CardAction>
                  </CardHeader>
                  <CardFooter className="gap-1.5 text-xs text-muted-foreground">
                    {/* No delta when the previous window was empty — see
                        `deltaOf`. The hint still explains the period. */}
                    {entry.delta !== null && (
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 font-medium",
                          entry.delta >= 0 ? "text-success" : "text-destructive",
                        )}
                      >
                        <TrendIcon className="size-3.5" />
                        {formatDelta(entry.delta)}
                      </span>
                    )}
                    {entry.hint}
                  </CardFooter>
                </Card>
              );
            })}
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Recent orders</CardTitle>
                <CardDescription>
                  Your latest 5 orders across the store.
                </CardDescription>
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
                {recentOrders.length === 0 ? (
                  <p className="rounded-2xl bg-muted px-4 py-6 text-center text-sm text-muted-foreground">
                    No orders yet.
                  </p>
                ) : (
                  recentOrders.map((order, index) => (
                    // One order can hold several of this seller's products, so
                    // the order id alone isn't unique across rows.
                    <div key={`${order.orderId}-${order.productName}`}>
                      {index > 0 && <Separator />}
                      <div className="flex items-center gap-3 py-3">
                        <Avatar>
                          <AvatarFallback className="text-xs font-medium">
                            {getInitials(order.buyerName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">
                            {order.buyerName}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {order.productName} · #{order.orderId}
                          </p>
                        </div>
                        <Badge
                          variant={badgeFor[order.status] ?? "neutral"}
                          className="capitalize"
                        >
                          {order.status}
                        </Badge>
                        <span className="w-16 text-right font-mono text-sm font-medium">
                          {formatCents(order.amount, order.currency)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top products</CardTitle>
                <CardDescription>Best sellers this month.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {topProducts.length === 0 ? (
                  <p className="rounded-2xl bg-muted px-4 py-6 text-center text-sm text-muted-foreground">
                    No sales yet.
                  </p>
                ) : (
                  topProducts.map((product) => (
                    <div key={product.productId} className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2 text-sm">
                        <span className="flex min-w-0 items-center gap-2">
                          <PackageIcon className="size-4 shrink-0 text-muted-foreground" />
                          <span className="truncate font-medium">
                            {product.name}
                          </span>
                        </span>
                        <span className="shrink-0 text-muted-foreground tabular-nums">
                          {product.sales}
                        </span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary"
                          // Relative to the best seller, not to 100 — see
                          // `topSales`. Guarded because the list is empty-checked
                          // above but the divisor still has to be non-zero.
                          style={{
                            width: `${topSales > 0 ? Math.round((product.sales / topSales) * 100) : 0}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))
                )}
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
        </TabsContent>

        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>{strings.dashboard.accountPanel.title}</CardTitle>
              <CardDescription>
                {strings.dashboard.accountPanel.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col">
              <div className="flex items-center gap-3 pb-4">
                <Avatar size="lg">
                  <AvatarFallback className="font-medium">
                    {getInitials(user.name || user.email)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate font-medium">{user.name}</p>
                  <p className="truncate text-sm text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </div>

              {[
                {
                  label: strings.dashboard.accountPanel.name,
                  value: user.name,
                },
                {
                  label: strings.dashboard.accountPanel.email,
                  value: user.email,
                },
              ].map((row, index) => (
                <div key={row.label}>
                  {index > 0 && <Separator />}
                  <div className="flex items-center justify-between gap-4 py-3 text-sm">
                    <span className="text-muted-foreground">{row.label}</span>
                    <span className="truncate font-medium">{row.value}</span>
                  </div>
                </div>
              ))}

              <Separator />

              <div className="pt-4">
                {/* The column is NOT NULL, but `handle` is declared with
                    `required: false` in additionalFields, so Better Auth types
                    it as optional on the session user. */}
                <HandleForm handle={user.handle ?? ""} />
              </div>
            </CardContent>
            <CardFooter className="border-t text-xs text-muted-foreground">
              {strings.dashboard.accountPanel.handleNote}
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>{strings.dashboard.settingsPanel.title}</CardTitle>
              <CardDescription>
                {strings.dashboard.settingsPanel.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Deliberately empty: no settings are wired up yet, so this
                  says so rather than showing controls that do nothing. */}
              <p className="rounded-2xl bg-muted px-4 py-6 text-center text-sm text-muted-foreground">
                {strings.dashboard.settingsPanel.comingSoon}
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
