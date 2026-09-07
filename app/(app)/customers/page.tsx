import type { Metadata } from "next"
import { ExportIcon, UsersIcon } from "@phosphor-icons/react/dist/ssr"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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
import { listCustomersForSeller } from "@/lib/server/dal/orders"
import { requireUser } from "@/lib/server/dal/session"
import { formatCents } from "@/lib/server/money"
import { getInitials } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Customers · Creator Commerce",
  description: "Everyone who has bought from your store.",
}

const dateFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
})

export default async function CustomersPage() {
  // `requireUser`, not `getSession`: the page has no signed-out state, and the
  // id it returns is what scopes every row to this creator's own buyers.
  const user = await requireUser()
  const customers = await listCustomersForSeller(user.id)

  return (
    <div className="flex flex-1 flex-col gap-5 p-4 md:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Customers
          </h1>
          <p className="text-sm text-muted-foreground">
            Everyone who has bought from your store.
          </p>
        </div>
        <Button variant="outline" size="sm" disabled={customers.length === 0}>
          <ExportIcon />
          Export
        </Button>
      </div>

      <Card className="p-0">
        {customers.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <UsersIcon className="size-[22px]" />
            </span>
            <p className="text-sm text-muted-foreground">
              No customers yet. Anyone who buys one of your products will appear
              here.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="px-5 text-xs text-muted-foreground">
                  Customer
                </TableHead>
                <TableHead className="px-5 text-xs text-muted-foreground">
                  Email
                </TableHead>
                <TableHead className="px-5 text-xs text-muted-foreground">
                  Last order
                </TableHead>
                <TableHead className="px-5 text-right text-xs text-muted-foreground">
                  Orders
                </TableHead>
                <TableHead className="px-5 text-right text-xs text-muted-foreground">
                  Lifetime value
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((customer) => (
                <TableRow key={customer.buyerId}>
                  <TableCell className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar>
                        <AvatarFallback className="text-xs font-medium">
                          {getInitials(customer.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{customer.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-5 py-3 text-muted-foreground">
                    {customer.email}
                  </TableCell>
                  <TableCell className="px-5 py-3 text-muted-foreground">
                    {/* Non-null for a paid order in practice — `markOrderPaid`
                        stamps it — but the column is nullable, so don't render
                        "Invalid Date" if one ever slips through. */}
                    {customer.lastOrderAt
                      ? dateFormat.format(customer.lastOrderAt)
                      : "—"}
                  </TableCell>
                  <TableCell className="px-5 py-3 text-right font-mono text-muted-foreground">
                    {customer.orders}
                  </TableCell>
                  <TableCell className="px-5 py-3 text-right font-mono font-medium">
                    {/* What they spent *with this creator*, not across the
                        platform — see listCustomersForSeller. */}
                    {formatCents(customer.spent, customer.currency)}
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
