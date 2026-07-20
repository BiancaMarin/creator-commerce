import type { Metadata } from "next"
import { HeartIcon } from "@phosphor-icons/react/dist/ssr"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
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
  title: "Wishlist · Creator Commerce",
  description: "Products customers saved but haven't bought yet.",
}

const wishlisted = [
  {
    product: "Lightroom Masterclass",
    customer: "Amara Okafor",
    saved: "2 days ago",
    price: "$129.00",
    status: "in stock" as const,
  },
  {
    product: "Studio Preset Pack",
    customer: "Leo Nakamura",
    saved: "4 days ago",
    price: "$48.00",
    status: "in stock" as const,
  },
  {
    product: "1:1 Coaching Call",
    customer: "Priya Menon",
    saved: "1 week ago",
    price: "$220.00",
    status: "waitlist" as const,
  },
  {
    product: "Brand Kit Templates",
    customer: "Sofia Rossi",
    saved: "1 week ago",
    price: "$64.00",
    status: "in stock" as const,
  },
  {
    product: "1:1 Coaching Call",
    customer: "Daniel Weber",
    saved: "2 weeks ago",
    price: "$220.00",
    status: "waitlist" as const,
  },
]

const badgeFor: Record<string, React.ComponentProps<typeof Badge>["variant"]> = {
  "in stock": "success",
  waitlist: "warning",
}

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
}

export default function WishlistPage() {
  return (
    <div className="flex flex-1 flex-col gap-5 p-4 md:p-6">
      <div className="space-y-1">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Wishlist
        </h1>
        <p className="text-sm text-muted-foreground">
          Products customers saved but haven&apos;t bought yet.
        </p>
      </div>

      <Card className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="px-5 text-xs text-muted-foreground">
                Product
              </TableHead>
              <TableHead className="px-5 text-xs text-muted-foreground">
                Saved by
              </TableHead>
              <TableHead className="px-5 text-xs text-muted-foreground">
                Saved
              </TableHead>
              <TableHead className="px-5 text-xs text-muted-foreground">
                Status
              </TableHead>
              <TableHead className="px-5 text-right text-xs text-muted-foreground">
                Price
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {wishlisted.map((item) => (
              <TableRow key={`${item.product}-${item.customer}`}>
                <TableCell className="px-5 py-3">
                  <div className="flex items-center gap-2.5">
                    <span className="flex size-8 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                      <HeartIcon className="size-4" />
                    </span>
                    <span className="font-medium">{item.product}</span>
                  </div>
                </TableCell>
                <TableCell className="px-5 py-3">
                  <div className="flex items-center gap-2.5">
                    <Avatar>
                      <AvatarFallback className="text-xs font-medium">
                        {initials(item.customer)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-muted-foreground">
                      {item.customer}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="px-5 py-3 text-muted-foreground">
                  {item.saved}
                </TableCell>
                <TableCell className="px-5 py-3">
                  <Badge variant={badgeFor[item.status]} className="capitalize">
                    {item.status}
                  </Badge>
                </TableCell>
                <TableCell className="px-5 py-3 text-right font-mono font-medium">
                  {item.price}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
