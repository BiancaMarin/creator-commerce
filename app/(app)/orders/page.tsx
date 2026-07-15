import type { Metadata } from "next"
import { ExportIcon } from "@phosphor-icons/react/dist/ssr"

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

const orders = [
  { id: "#3812", customer: "Amara Okafor", product: "Studio Preset Pack", amount: "$48.00", status: "paid" },
  { id: "#3811", customer: "Leo Nakamura", product: "Lightroom Masterclass", amount: "$129.00", status: "paid" },
  { id: "#3810", customer: "Sofia Rossi", product: "Brand Kit Templates", amount: "$64.00", status: "refunded" },
  { id: "#3809", customer: "Daniel Weber", product: "Studio Preset Pack", amount: "$48.00", status: "pending" },
  { id: "#3808", customer: "Priya Menon", product: "1:1 Coaching Call", amount: "$220.00", status: "paid" },
  { id: "#3807", customer: "Marco Bianchi", product: "Brand Kit Templates", amount: "$64.00", status: "paid" },
  { id: "#3806", customer: "Yuki Tanaka", product: "Lightroom Masterclass", amount: "$129.00", status: "failed" },
]

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
}

export default function OrdersPage() {
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
        <Button variant="outline" size="sm">
          <ExportIcon />
          Export
        </Button>
      </div>

      <Card className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="px-5 text-xs text-muted-foreground">Order</TableHead>
              <TableHead className="px-5 text-xs text-muted-foreground">Customer</TableHead>
              <TableHead className="px-5 text-xs text-muted-foreground">Product</TableHead>
              <TableHead className="px-5 text-xs text-muted-foreground">Status</TableHead>
              <TableHead className="px-5 text-right text-xs text-muted-foreground">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="px-5 py-3 font-mono font-medium">
                  {order.id}
                </TableCell>
                <TableCell className="px-5 py-3">
                  <div className="flex items-center gap-2.5">
                    <Avatar size="sm">
                      <AvatarFallback className="text-[10px] font-medium">
                        {initials(order.customer)}
                      </AvatarFallback>
                    </Avatar>
                    <span>{order.customer}</span>
                  </div>
                </TableCell>
                <TableCell className="px-5 py-3 text-muted-foreground">
                  {order.product}
                </TableCell>
                <TableCell className="px-5 py-3">
                  <Badge variant={badgeFor[order.status]} className="capitalize">
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell className="px-5 py-3 text-right font-mono font-medium">
                  {order.amount}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
