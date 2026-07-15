import type { Metadata } from "next"
import { ExportIcon } from "@phosphor-icons/react/dist/ssr"

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

export const metadata: Metadata = {
  title: "Customers · Creator Commerce",
  description: "View profiles, segments, and lifetime value.",
}

const customers = [
  { name: "Amara Okafor", email: "amara@studio.co", orders: 8, spent: "$612.00" },
  { name: "Leo Nakamura", email: "leo.n@gmail.com", orders: 5, spent: "$438.00" },
  { name: "Priya Menon", email: "priya@lens.io", orders: 4, spent: "$396.00" },
  { name: "Sofia Rossi", email: "sofia.rossi@mail.com", orders: 3, spent: "$192.00" },
  { name: "Daniel Weber", email: "d.weber@web.de", orders: 2, spent: "$96.00" },
]

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
}

export default function CustomersPage() {
  return (
    <div className="flex flex-1 flex-col gap-5 p-4 md:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Customers
          </h1>
          <p className="text-sm text-muted-foreground">
            View profiles, segments, and lifetime value.
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
              <TableHead className="px-5 text-xs text-muted-foreground">Customer</TableHead>
              <TableHead className="px-5 text-xs text-muted-foreground">Email</TableHead>
              <TableHead className="px-5 text-right text-xs text-muted-foreground">Orders</TableHead>
              <TableHead className="px-5 text-right text-xs text-muted-foreground">Lifetime value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((customer) => (
              <TableRow key={customer.email}>
                <TableCell className="px-5 py-3">
                  <div className="flex items-center gap-2.5">
                    <Avatar>
                      <AvatarFallback className="text-xs font-medium">
                        {initials(customer.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{customer.name}</span>
                  </div>
                </TableCell>
                <TableCell className="px-5 py-3 text-muted-foreground">
                  {customer.email}
                </TableCell>
                <TableCell className="px-5 py-3 text-right font-mono text-muted-foreground">
                  {customer.orders}
                </TableCell>
                <TableCell className="px-5 py-3 text-right font-mono font-medium">
                  {customer.spent}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
