"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import type { Route } from "next"
import {
  ArrowLeftIcon,
  CreditCardIcon,
  FileArrowDownIcon,
  LockSimpleIcon,
  ShoppingBagIcon,
  TrashIcon,
} from "@phosphor-icons/react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
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

/** Matches the platform fee shown in the single-product checkout flow. */
const PLATFORM_FEE_RATE = 0.02

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium">{label}</label>
      {children}
    </div>
  )
}

export function CartView({
  items,
  signedIn,
  email,
}: {
  items: CartItem[]
  signedIn: boolean
  email: string
}) {
  const router = useRouter()
  // Set when the buyer arrived back from signing in mid-checkout. Read at the
  // first render rather than in an effect, so the payment step is what paints —
  // an effect would show the cart for a frame and then swap under them.
  const resuming =
    useSearchParams().get(CHECKOUT_INTENT_PARAM) === "1" &&
    signedIn &&
    items.length > 0
  const [step, setStep] = React.useState<"cart" | "checkout">(
    resuming ? "checkout" : "cart",
  )
  const [pending, startTransition] = React.useTransition()
  const [error, setError] = React.useState<string | null>(null)

  // Display-only arithmetic on a value the database keeps as `numeric`. Nothing
  // here is persisted or charged, so the float round trip the single-product
  // checkout already does is fine to mirror.
  const subtotal = items.reduce((sum, item) => sum + Number(item.price), 0)
  const fee = subtotal * PLATFORM_FEE_RATE
  const total = subtotal + fee

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

      router.push("/checkout/success")
      router.refresh()
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
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              {strings.cart.platformFee}
            </span>
            <span className="font-mono">${fee.toFixed(2)}</span>
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
            <Button size="lg" onClick={() => setStep("checkout")}>
              <LockSimpleIcon />
              {strings.cart.checkout}
            </Button>
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
                        <div className="truncate text-sm font-medium">
                          {item.name}
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
              <form
                className="flex flex-col gap-4"
                noValidate
                onSubmit={(event) => {
                  event.preventDefault()
                  // TODO: wire up Stripe payment.
                  checkout()
                }}
              >
                <Field label={strings.cart.email}>
                  <Input
                    type="email"
                    autoComplete="email"
                    defaultValue={email}
                    placeholder="you@example.com"
                  />
                </Field>
                <Separator />
                <div className="text-sm font-semibold text-muted-foreground">
                  {strings.cart.payingWith}
                </div>
                <Field label={strings.cart.cardNumber}>
                  <div className="relative">
                    <Input
                      placeholder="1234 1234 1234 1234"
                      className="pr-12"
                    />
                    <CreditCardIcon className="absolute top-1/2 right-3 size-[18px] -translate-y-1/2 text-muted-foreground" />
                  </div>
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label={strings.cart.expiry}>
                    <Input placeholder="MM / YY" />
                  </Field>
                  <Field label={strings.cart.cvc}>
                    <Input placeholder="123" />
                  </Field>
                </div>
                <Field label={strings.cart.nameOnCard}>
                  <Input placeholder="Jane Creator" />
                </Field>
                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={pending}
                >
                  <LockSimpleIcon />
                  {pending
                    ? strings.cart.paying
                    : strings.cart.pay.replace(
                        "{total}",
                        `$${total.toFixed(2)}`,
                      )}
                </Button>
                <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                  <LockSimpleIcon className="size-3.5" />
                  {strings.cart.securedBy}
                </div>
              </form>
            </div>
          </Card>
        )}

        {summary}
      </div>
    </div>
  )
}
