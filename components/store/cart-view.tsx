"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import type { Route } from "next"
import {
  ArrowLeftIcon,
  FileArrowDownIcon,
  HouseIcon,
  LockSimpleIcon,
  ShoppingBagIcon,
  TrashIcon,
} from "@phosphor-icons/react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ProductCover } from "@/components/store/product-cover"
import { strings } from "@/constants/strings"
import { checkoutCart, removeFromCart } from "@/lib/actions/cart"
import { formatPrice, type StoreProduct } from "@/lib/store-data"
import { CHECKOUT_INTENT_PARAM, signInToCheckoutHref } from "@/lib/utils"

/**
 * A cart spans storefronts, so every row carries the handle it needs to link
 * back to its product page. Built on `StoreProduct` rather than the DAL's row
 * type for the reason that type exists: `lib/server/*` must not be imported by
 * a Client Component, even for its types.
 */
export type CartItem = StoreProduct & { handle: string }

export function CartView({
  items,
  signedIn,
  ownedIds,
  purchasedIds,
  email,
}: {
  items: CartItem[]
  signedIn: boolean
  /** Ids of cart rows the viewer sells — not purchasable by them. */
  ownedIds: number[]
  /** Ids of cart rows the viewer already bought — a digital product sells once. */
  purchasedIds: number[]
  email: string
}) {
  const router = useRouter()

  // A creator can't buy their own product, so a cart holding one can't be paid
  // for at all — `checkoutCart` refuses the whole thing rather than quietly
  // charging for less than the cart showed. These rows are marked below and the
  // checkout button is blocked, so the fix is visible and one click away.
  const owned = new Set(ownedIds)
  const hasOwned = items.some((item) => owned.has(item.id))

  // The same shape for the other thing that can't be paid for: something this
  // buyer already bought. Kept as a separate set rather than folded into
  // `owned`, because the two say different things to the reader — "you sell
  // this" and "you already have this" — and each row needs the right one.
  const purchased = new Set(purchasedIds)
  const hasPurchased = items.some((item) => purchased.has(item.id))

  /** Either rule blocking payment. `checkoutCart` refuses on both. */
  const blocked = hasOwned || hasPurchased

  // Set when the buyer arrived back from signing in mid-checkout. Read at the
  // first render rather than in an effect, so the payment step is what paints —
  // an effect would show the cart for a frame and then swap under them.
  //
  // `!blocked` for the same reason the product page checks it: the flag comes
  // from the URL, so without it `?checkout=1` would open a payment step for a
  // cart the server is going to refuse.
  const resuming =
    useSearchParams().get(CHECKOUT_INTENT_PARAM) === "1" &&
    signedIn &&
    items.length > 0 &&
    !blocked
  const [step, setStep] = React.useState<"cart" | "checkout">(
    resuming ? "checkout" : "cart",
  )
  const [pending, startTransition] = React.useTransition()
  const [error, setError] = React.useState<string | null>(null)

  // Display-only arithmetic on a value the database keeps as `numeric`. The
  // amount actually charged is recomputed server side from the same rows, in
  // integer cents (lib/server/money.ts) — this float is never the figure that
  // moves money, only the one shown while deciding to.
  const subtotal = items.reduce((sum, item) => sum + Number(item.price), 0)
  // The buyer pays the list price and nothing else. The 2% platform fee is the
  // *creator's* — it comes out of their payout, exactly as the pricing page
  // states — so adding it here would both overstate the price and disagree
  // with what Stripe is about to charge, which is the sum of the line items.
  const total = subtotal

  function remove(productId: number) {
    setError(null)

    startTransition(async () => {
      const result = await removeFromCart(productId)

      if (!result.ok) {
        setError(result.error)

        return
      }

      // The row is gone from the cookie; re-render the page that reads it, so
      // both the list and the nav badge catch up.
      router.refresh()
    })
  }

  function checkout() {
    setError(null)

    startTransition(async () => {
      const result = await checkoutCart()

      if (!result.ok) {
        // A session that expired between rendering the form and submitting it.
        if (result.signInHref) {
          router.push(result.signInHref as Route)

          return
        }

        setError(result.error)

        return
      }

      // `window.location`, not `router.push`: Stripe Checkout is a different
      // origin, and the App Router can only navigate within this app. The
      // transition is deliberately left pending — the button stays disabled
      // until the browser leaves, so a slow redirect can't be clicked twice
      // into two Checkout Sessions.
      window.location.href = result.url
    })
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-[960px] px-8 pt-7 pb-14">
        <h1 className="mb-5 font-heading text-2xl font-semibold tracking-[-0.02em]">
          {strings.cart.title}
        </h1>
        <Card className="flex flex-col items-center gap-4 py-16">
          <span className="flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <ShoppingBagIcon className="size-[26px]" />
          </span>
          <p className="text-sm text-muted-foreground">{strings.cart.empty}</p>
          <div className="flex items-center gap-2">
            {/* Home, not /explore — that page sits behind the app's auth gate and
                a cart visitor may not be signed in. */}
            <Button
              variant="outline"
              size="sm"
              nativeButton={false}
              render={<Link href="/" />}
            >
              {strings.cart.emptyAction}
            </Button>
            {signedIn && (
              <Button
                variant="outline"
                size="sm"
                nativeButton={false}
                render={<Link href="/dashboard" />}
              >
                <HouseIcon />
                {strings.cart.goToDashboard}
              </Button>
            )}
          </div>
        </Card>
      </div>
    )
  }

  const summary = (
    <Card className="p-0">
      <div className="flex flex-col gap-4 p-6">
        <div className="text-sm font-semibold text-muted-foreground">
          {strings.cart.orderSummary}
        </div>
        <div className="flex flex-col gap-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              {strings.cart.subtotal}
            </span>
            <span className="font-mono">${subtotal.toFixed(2)}</span>
          </div>
        </div>
        <Separator />
        <div className="flex items-baseline justify-between">
          <span className="font-semibold">{strings.cart.total}</span>
          <span className="font-mono text-[22px] font-bold">
            ${total.toFixed(2)}
          </span>
        </div>

        {step === "cart" &&
          (signedIn ? (
            <>
              <Button
                size="lg"
                disabled={blocked}
                onClick={() => setStep("checkout")}
              >
                <LockSimpleIcon />
                {strings.cart.checkout}
              </Button>
              {/* One reason at a time, own-products first — it's the one the
                  viewer can act on without leaving the page. Both rules mark
                  their own rows below, so the specific offenders are visible
                  either way. */}
              {hasOwned ? (
                <p className="text-xs text-destructive">
                  {strings.errors.cartHasOwnProducts}
                </p>
              ) : hasPurchased ? (
                <p className="text-xs text-destructive">
                  {strings.errors.cartHasPurchased}
                </p>
              ) : null}
            </>
          ) : (
            // Say it before the payment form rather than after it. The action
            // is what actually enforces this — see checkoutCart.
            <Button
              size="lg"
              nativeButton={false}
              render={<Link href={signInToCheckoutHref("/cart") as Route} />}
            >
              <LockSimpleIcon />
              {strings.cart.signInToCheckout}
            </Button>
          ))}

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <FileArrowDownIcon className="size-4" />
          {strings.cart.instantDownload}
        </div>
      </div>
    </Card>
  )

  return (
    <div className="mx-auto max-w-[960px] px-8 pt-7 pb-14">
      {step === "checkout" && (
        <Button
          variant="ghost"
          size="sm"
          className="mb-5"
          onClick={() => setStep("cart")}
        >
          <ArrowLeftIcon />
          {strings.common.back}
        </Button>
      )}

      <div className="mb-5 flex items-baseline gap-3">
        <h1 className="font-heading text-2xl font-semibold tracking-[-0.02em]">
          {strings.cart.title}
        </h1>
        <span className="text-sm text-muted-foreground">
          {items.length === 1
            ? strings.cart.oneItem
            : strings.cart.itemCount.replace("{count}", String(items.length))}
        </span>
        {/* Only for a signed-in visitor: /dashboard sits behind the (app)
            layout's auth gate, so offering it to an anonymous shopper would
            just bounce them to /login. `ml-auto` keeps it off the title. */}
        {signedIn && (
          <Button
            variant="outline"
            size="sm"
            className="ml-auto"
            nativeButton={false}
            render={<Link href="/dashboard" />}
          >
            <HouseIcon />
            {strings.cart.goToDashboard}
          </Button>
        )}
      </div>

      {error && (
        <p
          role="alert"
          className="mb-4 rounded-2xl bg-destructive/10 px-3 py-2 text-xs text-destructive"
        >
          {error}
        </p>
      )}

      <div className="grid items-start gap-7 md:grid-cols-[1.2fr_1fr]">
        {step === "cart" ? (
          <Card className="p-0">
            <ul className="flex flex-col">
              {items.map((item, index) => (
                <li key={item.id}>
                  {index > 0 && <Separator />}
                  <div className="flex items-center gap-3.5 p-4">
                    <Link
                      href={`/${item.handle}/${item.id}/${item.slug}`}
                      className="flex min-w-0 flex-1 items-center gap-3.5"
                    >
                      <ProductCover
                        seed={item.slug}
                        imageUrl={item.imageUrls[0]}
                        alt={item.name}
                        sizes="56px"
                        className="size-14 shrink-0 rounded-2xl"
                        iconClassName="size-[22px]"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="truncate text-sm font-medium">
                            {item.name}
                          </span>
                          {/* Names the row blocking checkout, so "remove your
                              own products" points at something specific. */}
                          {owned.has(item.id) ? (
                            <Badge variant="neutral" className="shrink-0">
                              {strings.store.yourProduct}
                            </Badge>
                          ) : purchased.has(item.id) ? (
                            <Badge variant="neutral" className="shrink-0">
                              {strings.store.owned}
                            </Badge>
                          ) : null}
                        </div>
                        <div className="truncate text-xs text-muted-foreground">
                          @{item.handle} · {item.tag}
                        </div>
                      </div>
                    </Link>
                    <span className="font-mono text-sm font-semibold">
                      {formatPrice(item.price)}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="text-muted-foreground hover:text-destructive"
                      aria-label={strings.cart.remove.replace(
                        "{name}",
                        item.name,
                      )}
                      disabled={pending}
                      onClick={() => remove(item.id)}
                    >
                      <TrashIcon />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        ) : (
          <Card className="p-0">
            <div className="flex flex-col gap-4 p-6">
              <h2 className="font-heading text-xl font-semibold">
                {strings.cart.checkout}
              </h2>
              {/* No card fields. Payment details are entered on Stripe's own
                  hosted page, which is the point of that integration: this app
                  never sees, transmits or stores a card number, and the PCI
                  burden stays with Stripe. What used to be here was a mock
                  form that collected details and threw them away. */}
              {error && (
                <p
                  role="alert"
                  className="rounded-2xl bg-destructive/10 px-3 py-2 text-xs text-destructive"
                >
                  {error}
                </p>
              )}
              <div className="flex flex-col gap-1.5">
                <span className="text-sm font-medium">
                  {strings.cart.email}
                </span>
                <span className="text-sm text-muted-foreground">{email}</span>
              </div>
              <Separator />
              <p className="text-sm text-muted-foreground">
                {strings.cart.redirectNotice}
              </p>
              <Button
                size="lg"
                className="w-full"
                disabled={pending}
                onClick={checkout}
              >
                <LockSimpleIcon />
                {pending
                  ? strings.cart.paying
                  : strings.cart.pay.replace("{total}", `$${total.toFixed(2)}`)}
              </Button>
              <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                <LockSimpleIcon className="size-3.5" />
                {strings.cart.securedBy}
              </div>
            </div>
          </Card>
        )}

        {summary}
      </div>
    </div>
  )
}
