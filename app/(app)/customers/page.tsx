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
import { toneFor } from "@/lib/tones"
import { cn, getInitials } from "@/lib/utils"
import { INTL_LOCALE } from "@/lib/i18n"
import { getLocale, getStrings, pageMetadata } from "@/lib/server/i18n"

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("customers")
}

export default async function CustomersPage() {
  // `requireUser`, not `getSession`: the page has no signed-out state, and the
  // id it returns is what scopes every row to this creator's own buyers.
  const user = await requireUser()
  const customers = await listCustomersForSeller(user.id)
  const strings = await getStrings()
  const dateFormat = new Intl.DateTimeFormat(INTL_LOCALE[await getLocale()], {
    month: "short",
    day: "numeric",
    year: "numeric",
  })

  return (
    <div className="flex flex-1 flex-col gap-5 p-4 md:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-brand-gradient font-heading text-2xl font-semibold tracking-tight">
            {strings.customers.title}
          </h1>
          <p className="text-sm text-muted-foreground">
            {strings.customers.subtitle}
          </p>
        </div>
        <Button variant="outline" size="sm" disabled={customers.length === 0}>
          <ExportIcon />
          {strings.common.export}
        </Button>
      </div>

      <Card className="p-0">
        {customers.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-brand-violet/15 text-brand-violet">
              <UsersIcon className="size-[22px]" />
            </span>
            <p className="text-sm text-muted-foreground">
              {strings.customers.empty}
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="px-5 text-xs text-muted-foreground">
                  {strings.customers.columnCustomer}
                </TableHead>
                <TableHead className="px-5 text-xs text-muted-foreground">
                  {strings.customers.columnEmail}
                </TableHead>
                <TableHead className="px-5 text-xs text-muted-foreground">
                  {strings.customers.columnLastOrder}
                </TableHead>
                <TableHead className="px-5 text-right text-xs text-muted-foreground">
                  {strings.customers.columnOrders}
                </TableHead>
                <TableHead className="px-5 text-right text-xs text-muted-foreground">
                  {strings.customers.columnLifetimeValue}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((customer) => (
                <TableRow key={customer.buyerId}>
                  <TableCell className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar>
                        <AvatarFallback
                        className={cn(
                          "text-xs font-medium",
                          toneFor(customer.name).tile,
                        )}
                      >
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
