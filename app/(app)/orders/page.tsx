import type { Metadata } from "next"
import { ExportIcon, ReceiptIcon } from "@phosphor-icons/react/dist/ssr"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { expireStalePendingOrders } from "@/lib/server/checkout"
import { listOrdersForSeller } from "@/lib/server/dal/orders"
import { requireUser } from "@/lib/server/dal/session"
import { formatCents } from "@/lib/server/money"
import { getInitials } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Orders · Creator Commerce",
  description: "Track fulfillment and manage refunds.",
}

const badgeFor: Record<string, React.ComponentProps<typeof Badge>["variant"]> = {
  paid: "success",
  pending: "warning",
  refunded: "neutral",
  failed: "destructive",
}

const dateFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
})

export default async function OrdersPage() {
  // `requireUser`, not `getSession`: this page has no signed-out state, and the
  // id it returns is what scopes every row below to this creator's own sales.
  const user = await requireUser()

  // Opportunistic expiry, scoped to this seller's own orders, before the list
  // is read — so the page can't show a row as `pending` that this very request
  // is about to close.
  //
  // The scheduled sweep (app/api/cron/expire-orders) is the real mechanism;
  // this is what makes expiry work in development, where nothing is scheduled.
  // Normally it finds nothing and costs one indexed query.
  //
  // Awaited, so the list below reflects it — but never allowed to fail the
  // page. Tidying up stale rows is housekeeping; the seller came here to read
  // their orders, and a Stripe outage shouldn't stop them.
  try {
    await expireStalePendingOrders({ sellerId: user.id, limit: 20 })
  } catch (error) {
    console.error("[orders] opportunistic expiry sweep failed", error)
  }

  const orders = await listOrdersForSeller(user.id)

  return (
    <div className="flex flex-1 flex-col gap-5 p-4 md:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Orders
          </h1>
          <p className="text-sm text-muted-foreground">
            Track fulfillment and manage refunds.
          </p>
        </div>
        <Button variant="outline" size="sm" disabled={orders.length === 0}>
          <ExportIcon />
          Export
        </Button>
      </div>

      <Card className="p-0">
        {orders.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <ReceiptIcon className="size-[22px]" />
            </span>
            <p className="text-sm text-muted-foreground">
              No orders yet. They&apos;ll appear here as soon as someone buys one of
              your products.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="px-5 text-xs text-muted-foreground">
                  Order
                </TableHead>
                <TableHead className="px-5 text-xs text-muted-foreground">
                  Customer
                </TableHead>
                <TableHead className="px-5 text-xs text-muted-foreground">
                  Product
                </TableHead>
                <TableHead className="px-5 text-xs text-muted-foreground">
                  Date
                </TableHead>
                <TableHead className="px-5 text-xs text-muted-foreground">
                  Status
                </TableHead>
                <TableHead className="px-5 text-right text-xs text-muted-foreground">
                  Amount
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                // One order can hold several of this creator's products, so the
                // order id alone isn't unique across rows — the product is what
                // distinguishes two lines of the same order.
                <TableRow key={`${order.orderId}-${order.productName}`}>
                  <TableCell className="px-5 py-3 font-mono font-medium">
                    #{order.orderId}
                  </TableCell>
                  <TableCell className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar size="sm">
                        <AvatarFallback className="text-[10px] font-medium">
                          {getInitials(order.buyerName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="truncate">{order.buyerName}</div>
                        <div className="truncate text-xs text-muted-foreground">
                          {order.buyerEmail}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-5 py-3 text-muted-foreground">
                    {order.productName}
                  </TableCell>
                  <TableCell className="px-5 py-3 text-muted-foreground">
                    {dateFormat.format(order.createdAt)}
                  </TableCell>
                  <TableCell className="px-5 py-3">
                    <Badge
                      variant={badgeFor[order.status] ?? "neutral"}
                      className="capitalize"
                    >
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-5 py-3 text-right font-mono font-medium">
                    {formatCents(order.amount, order.currency)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  )
}
