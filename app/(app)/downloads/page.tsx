import type { Metadata, Route } from "next"
import Link from "next/link"
import {
  CheckCircleIcon,
  ClockIcon,
  DownloadSimpleIcon,
  FileArrowDownIcon,
} from "@phosphor-icons/react/dist/ssr"

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
import { ClearPurchasedCart } from "@/components/store/clear-purchased-cart"
import { strings } from "@/constants/strings"
import {
  PURCHASE_PARAM,
  reconcileCheckoutSession,
} from "@/lib/server/checkout"
import { listPurchasesForBuyer } from "@/lib/server/dal/orders"
import { requireUser } from "@/lib/server/dal/session"
import { formatCents } from "@/lib/server/money"
import { formatFileSize } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Downloads · Creator Commerce",
  description: "Everything you've bought, ready to download.",
}

const dateFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
})

/**
 * The buyer's library — and where Stripe returns them after a successful
 * payment (`success_url` in lib/server/checkout.ts).
 *
 * It reports the purchase; it never grants it. Every row here comes from an
 * order the webhook marked `paid`, so landing on this URL by hand shows exactly
 * what landing on it after paying shows: whatever has actually been bought.
 */
export default async function DownloadsPage({
  searchParams,
}: {
  searchParams: Promise<{ [PURCHASE_PARAM]?: string }>
}) {
  const user = await requireUser()
  const params = await searchParams
  const sessionId = params[PURCHASE_PARAM]

  // Deliberately sequential, not `Promise.all`: reconciling can promote this
  // order to `paid`, and the listing below has to run *after* that write or it
  // renders a library missing the purchase just confirmed.
  //
  // Scoped to this buyer inside the query, so someone else's session id
  // resolves to nothing rather than to their order — and Stripe is only asked
  // about a session that already belongs to them.
  const justBought = sessionId
    ? await reconcileCheckoutSession(sessionId, user.id)
    : null
  const purchases = await listPurchasesForBuyer(user.id)

  // Stripe redirects the moment the card clears, which can beat the webhook
  // here by a second or two. Not an error — the money is taken and the order
  // exists — so the banner says "confirming" and the row appears on refresh.
  const settled = justBought?.status === "paid"

  return (
    <div className="flex flex-1 flex-col gap-5 p-4 md:p-6">
      {/* The cart is cleared here, not at checkout: this is the first point
          where the payment is confirmed *and* we're in the buyer's browser
          with a Server Action able to write the cookie. */}
      {settled && <ClearPurchasedCart />}

      <div className="space-y-1">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Downloads
        </h1>
        <p className="text-sm text-muted-foreground">
          Everything you&apos;ve bought, ready to download.
        </p>
      </div>

      {justBought && (
        <Card
          className={
            settled
              ? "flex flex-row items-center gap-3 border-success/30 bg-success/5 p-4"
              : "flex flex-row items-center gap-3 p-4"
          }
        >
          <span
            className={
              settled
                ? "flex size-9 shrink-0 items-center justify-center rounded-full bg-success/10 text-success"
                : "flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground"
            }
          >
            {settled ? (
              <CheckCircleIcon className="size-5" />
            ) : (
              <ClockIcon className="size-5" />
            )}
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold">
              {settled ? "Payment successful" : "Confirming your payment"}
            </div>
            <p className="truncate text-xs text-muted-foreground">
              {settled ? (
                <>
                  {justBought.items.map((item) => item.name).join(", ")} ·{" "}
                  {formatCents(justBought.amountTotal, justBought.currency)} ·
                  receipt sent to {justBought.email}
                </>
              ) : (
                <>
                  This usually takes a moment — refresh the page and your
                  purchase will appear below.
                </>
              )}
            </p>
          </div>
        </Card>
      )}

      <Card className="p-0">
        {purchases.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <FileArrowDownIcon className="size-[22px]" />
            </span>
            <p className="text-sm text-muted-foreground">
              You haven&apos;t bought anything yet.
            </p>
            <Button
              variant="outline"
              size="sm"
              nativeButton={false}
              render={<Link href="/explore" />}
            >
              Browse products
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="px-5 text-xs text-muted-foreground">
                  Product
                </TableHead>
                <TableHead className="px-5 text-xs text-muted-foreground">
                  Creator
                </TableHead>
                <TableHead className="px-5 text-xs text-muted-foreground">
                  Purchased
                </TableHead>
                <TableHead className="px-5 text-xs text-muted-foreground">
                  File
                </TableHead>
                <TableHead className="px-5 text-right text-xs text-muted-foreground">
                  Paid
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {purchases.map((purchase) => (
                // The same product bought twice is two rows, so the order id
                // has to be part of the key.
                <TableRow key={`${purchase.orderId}-${purchase.productId}`}>
                  <TableCell className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <span className="flex size-8 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                        <FileArrowDownIcon className="size-4" />
                      </span>
                      <Link
                        className="font-medium hover:underline"
                        href={
                          `/${purchase.handle}/${purchase.productId}/${purchase.productSlug}` as Route
                        }
                      >
                        {purchase.productName}
                      </Link>
                    </div>
                  </TableCell>
                  <TableCell className="px-5 py-3 text-muted-foreground">
                    @{purchase.handle}
                  </TableCell>
                  <TableCell className="px-5 py-3 text-muted-foreground">
                    {dateFormat.format(purchase.paidAt ?? purchase.startedAt)}
                  </TableCell>
                  <TableCell className="px-5 py-3">
                    {/* A plain link, not a minted URL. /api/downloads/:id
                        re-checks the session and the purchase on every click
                        and streams the file back, so there is nothing here
                        that keeps working once either stops being true — and
                        nothing worth copying out of the page source.

                        Not a <Button render={<Link/>}>: this navigates to a
                        response the browser saves rather than to a route, so
                        it wants a real anchor and no client-side router. */}
                    {purchase.fileName ? (
                      <a
                        href={`/api/downloads/${purchase.productId}`}
                        className="flex flex-col gap-0.5 hover:underline"
                        title={purchase.fileName}
                      >
                        <span className="flex items-center gap-1.5 font-mono text-xs">
                          <DownloadSimpleIcon className="size-3.5 shrink-0" />
                          {purchase.fileName}
                        </span>
                        {purchase.fileSize !== null && (
                          <span className="text-xs text-muted-foreground">
                            {formatFileSize(purchase.fileSize)}
                          </span>
                        )}
                      </a>
                    ) : (
                      <Badge variant="neutral">
                        {strings.products.fileMissing}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="px-5 py-3 text-right font-mono font-medium">
                    {formatCents(purchase.amount, purchase.currency)}
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
