import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowUpRightIcon,
  CoinsIcon,
  ExportIcon,
  PackageIcon,
  PlusIcon,
  ReceiptIcon,
  TrendUpIcon,
  UsersIcon,
} from "@phosphor-icons/react/dist/ssr";

import { HandleForm } from "@/components/dashboard/handle-form";
import { deltaOf, KpiCard } from "@/components/dashboard/kpi-card";
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
import { INTL_LOCALE, orderStatusLabel } from "@/lib/i18n";
import { getLocale, getStrings, pageMetadata } from "@/lib/server/i18n";
import {
  getSellerStats,
  listOrdersForSeller,
  listTopProductsForSeller,
} from "@/lib/server/dal/orders";
import { requireUser } from "@/lib/server/dal/session";
import { formatCents } from "@/lib/server/money";
import { toneAt, toneFor } from "@/lib/tones";
import { cn, getInitials } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("dashboard");
}

const badgeFor: Record<string, React.ComponentProps<typeof Badge>["variant"]> =
  {
    paid: "success",
    pending: "warning",
    refunded: "neutral",
    failed: "destructive",
  };

export default async function DashboardPage() {
  const strings = await getStrings();
  const number = new Intl.NumberFormat(INTL_LOCALE[await getLocale()]);
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
      label: strings.dashboard.kpi.revenue,
      value: formatCents(stat.revenue),
      delta: deltaOf(stat.revenue, stat.revenuePrevious),
      hint: strings.dashboard.kpi.vsPrevious,
      icon: CoinsIcon,
    },
    {
      label: strings.dashboard.kpi.orders,
      value: number.format(stat.orders),
      delta: deltaOf(stat.orders, stat.ordersPrevious),
      hint: strings.dashboard.kpi.vsPrevious,
      icon: ReceiptIcon,
    },
    {
      label: strings.dashboard.kpi.customers,
      value: number.format(stat.customers),
      delta: deltaOf(stat.customers, stat.customersPrevious),
      hint: strings.dashboard.kpi.vsPrevious,
      icon: UsersIcon,
    },
    {
      // Replaces the old "Conversion" tile. Conversion needs a view count, and
      // nothing here records page views — the figure would have to be invented.
      // Average order value comes from the same rows as the tiles beside it.
      label: strings.dashboard.kpi.avgOrder,
      value: averageOrder === null ? "—" : formatCents(averageOrder),
      delta: null,
      hint: strings.dashboard.kpi.last30,
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
          <h1 className="text-brand-gradient font-heading text-2xl font-semibold tracking-tight">
            {strings.dashboard.greeting.replace("{name}", firstName)}
          </h1>
          <p className="text-sm text-muted-foreground">
            {strings.dashboard.subtitle}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <ExportIcon />
            {strings.common.export}
          </Button>
          <Button
            size="sm"
            nativeButton={false}
            render={<Link href="/products" />}
          >
            <PlusIcon />
            {strings.dashboard.newProduct}
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
            {stats.map((entry, index) => (
              <KpiCard
                key={entry.label}
                {...entry}
                iconClassName={toneAt(index).tile}
              />
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>{strings.dashboard.recentOrders}</CardTitle>
                <CardDescription>
                  {strings.dashboard.recentOrdersHint}
                </CardDescription>
                <CardAction>
                  <Button
                    variant="ghost"
                    size="sm"
                    nativeButton={false}
                    render={<Link href="/orders" />}
                  >
                    {strings.dashboard.viewAll}
                    <ArrowUpRightIcon />
                  </Button>
                </CardAction>
              </CardHeader>
              <CardContent className="flex flex-col">
                {recentOrders.length === 0 ? (
                  <p className="rounded-2xl bg-muted px-4 py-6 text-center text-sm text-muted-foreground">
                    {strings.dashboard.noOrders}
                  </p>
                ) : (
                  recentOrders.map((order, index) => (
                    // One order can hold several of this seller's products, so
                    // the order id alone isn't unique across rows.
                    <div key={`${order.orderId}-${order.productName}`}>
                      {index > 0 && <Separator />}
                      <div className="flex items-center gap-3 py-3">
                        <Avatar>
                          <AvatarFallback
                            className={cn(
                              "text-xs font-medium",
                              toneFor(order.buyerName).tile,
                            )}
                          >
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
                          {orderStatusLabel(strings, order.status)}
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
                <CardTitle>{strings.dashboard.topProducts}</CardTitle>
                <CardDescription>{strings.dashboard.topProductsHint}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {topProducts.length === 0 ? (
                  <p className="rounded-2xl bg-muted px-4 py-6 text-center text-sm text-muted-foreground">
                    {strings.dashboard.noSales}
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
                          className="h-full rounded-full bg-brand-gradient"
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
                  {strings.dashboard.viewAnalytics}
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
                  <AvatarFallback className="bg-brand-gradient font-medium text-white">
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
