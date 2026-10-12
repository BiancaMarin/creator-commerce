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
import { INTL_LOCALE } from "@/lib/i18n"
import { getLocale, getStrings, pageMetadata } from "@/lib/server/i18n"
import { toneFor } from "@/lib/tones"
import { cn } from "@/lib/utils"

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("wishlist")
}

const wishlisted = [
  {
    product: "Lightroom Masterclass",
    customer: "Amara Okafor",
    savedDaysAgo: 2,
    price: "$129.00",
    status: "inStock" as const,
  },
  {
    product: "Studio Preset Pack",
    customer: "Leo Nakamura",
    savedDaysAgo: 4,
    price: "$48.00",
    status: "inStock" as const,
  },
  {
    product: "1:1 Coaching Call",
    customer: "Priya Menon",
    savedDaysAgo: 7,
    price: "$220.00",
    status: "waitlist" as const,
  },
  {
    product: "Brand Kit Templates",
    customer: "Sofia Rossi",
    savedDaysAgo: 7,
    price: "$64.00",
    status: "inStock" as const,
  },
  {
    product: "1:1 Coaching Call",
    customer: "Daniel Weber",
    savedDaysAgo: 14,
    price: "$220.00",
    status: "waitlist" as const,
  },
]

const badgeFor: Record<string, React.ComponentProps<typeof Badge>["variant"]> = {
  inStock: "success",
  waitlist: "warning",
}

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
}

export default async function WishlistPage() {
  const strings = await getStrings()
  const relative = new Intl.RelativeTimeFormat(INTL_LOCALE[await getLocale()], {
    numeric: "auto",
  })
  // Placeholder rows, so "saved" is a day count rendered in the reader's
  // language rather than a fixed English phrase.
  const savedAgo = (days: number) =>
    days >= 7
      ? relative.format(-Math.round(days / 7), "week")
      : relative.format(-days, "day")

  return (
    <div className="flex flex-1 flex-col gap-5 p-4 md:p-6">
      <div className="space-y-1">
        <h1 className="text-brand-gradient font-heading text-2xl font-semibold tracking-tight">
          {strings.wishlist.title}
        </h1>
        <p className="text-sm text-muted-foreground">
          {strings.wishlist.subtitle}
        </p>
      </div>

      <Card className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="px-5 text-xs text-muted-foreground">
                {strings.wishlist.columnProduct}
              </TableHead>
              <TableHead className="px-5 text-xs text-muted-foreground">
                {strings.wishlist.columnSavedBy}
              </TableHead>
              <TableHead className="px-5 text-xs text-muted-foreground">
                {strings.wishlist.columnSaved}
              </TableHead>
              <TableHead className="px-5 text-xs text-muted-foreground">
                {strings.wishlist.columnStatus}
              </TableHead>
              <TableHead className="px-5 text-right text-xs text-muted-foreground">
                {strings.wishlist.columnPrice}
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
                      <AvatarFallback
                      className={cn(
                        "text-xs font-medium",
                        toneFor(item.customer).tile,
                      )}
                    >
                        {initials(item.customer)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-muted-foreground">
                      {item.customer}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="px-5 py-3 text-muted-foreground">
                  {savedAgo(item.savedDaysAgo)}
                </TableCell>
                <TableCell className="px-5 py-3">
                  <Badge variant={badgeFor[item.status]}>
                    {strings.wishlist.status[item.status]}
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
