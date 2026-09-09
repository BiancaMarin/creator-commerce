"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import type { Route } from "next"
import {
  ArrowLeftIcon,
  DownloadSimpleIcon,
  FileArrowDownIcon,
  LockSimpleIcon,
  PencilSimpleIcon,
  ShieldCheckIcon,
} from "@phosphor-icons/react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { AddToCartButton } from "@/components/store/add-to-cart-button"
import { ProductCover } from "@/components/store/product-cover"
import { ProductGallery } from "@/components/store/product-gallery"
import { strings } from "@/constants/strings"
import { checkoutProduct } from "@/lib/actions/cart"
import { capture } from "@/lib/analytics/capture"
import { ANALYTICS_EVENTS } from "@/lib/analytics/events"
import { formatPrice, type StoreProduct } from "@/lib/store-data"
import {
  CHECKOUT_INTENT_PARAM,
  formatFileSize,
  signInToCheckoutHref,
} from "@/lib/utils"

export function ProductCheckoutFlow({
  product,
  storeHandle,
  inCart,
  signedIn,
  isOwner,
  hasPurchased,
  email,
}: {
  product: StoreProduct
  storeHandle: string
  /** Whether this product is already in the visitor's cart cookie. */
  inCart: boolean
  /** Buying needs an account; browsing doesn't. Enforced in `checkoutProduct`. */
  signedIn: boolean
  /** The viewer owns this product, so it is not for sale to them. */
  isOwner: boolean
  /** The viewer already bought this. A digital product is sold once. */
  hasPurchased: boolean
  email: string
}) {
  const router = useRouter()
  // The buyer pressed "Buy now", was sent to sign in, and came back — reopen the
  // payment form instead of making them press it again. Resolved at the first
  // render so that step is what paints, not a flash of the product page.
  //
  // `!isOwner` matters: the flag comes from the URL, so without it a creator
  // could type `?checkout=1` on their own product and land on a payment form
  // that `checkoutProduct` would only refuse once they pressed Pay.
  const resuming =
    useSearchParams().get(CHECKOUT_INTENT_PARAM) === "1" &&
    signedIn &&
    !isOwner &&
    !hasPurchased
  const [step, setStep] = React.useState<"product" | "checkout">(
    resuming ? "checkout" : "product",
  )
  const [pending, startTransition] = React.useTransition()
  const [error, setError] = React.useState<string | null>(null)

  function pay() {
    setError(null)

    startTransition(async () => {
      const result = await checkoutProduct(product.id)

      if (!result.ok) {
        if (result.signInHref) {
          router.push(result.signInHref as Route)

          return
        }

        setError(result.error)

        return
      }

      // Funnel step 4, captured before the navigation. PostHog sends it with
      // `navigator.sendBeacon`, which survives the page being torn down — but
      // only if it was queued while the page still existed.
      capture(ANALYTICS_EVENTS.checkoutStarted, {
        product_id: product.id,
        handle: storeHandle,
        price: product.price,
        source: "product_page",
      })

      // Stripe Checkout is another origin, so this can't be `router.push`.
      // The transition stays pending until the browser leaves, which keeps the
      // button disabled and stops a second click opening a second session.
      window.location.href = result.url
    })
  }

  const price = Number(product.price)
  // What the buyer pays. The 2% platform fee comes out of the creator's payout
  // rather than being added here — see the note in cart-view.tsx.
  const total = price

  if (step === "product") {
    return (
      <div className="mx-auto max-w-[960px] px-8 pt-7 pb-14">
        <Button
          variant="ghost"
          size="sm"
          className="mb-5"
          onClick={() => router.push(`/${storeHandle}`)}
        >
          <ArrowLeftIcon />
          Back to shop
        </Button>
        <div className="grid items-start gap-7 md:grid-cols-[1.3fr_1fr]">
          <Card className="overflow-hidden p-0">
            <ProductGallery
              seed={product.slug}
              imageUrls={product.imageUrls}
              alt={product.name}
              sizes="(max-width: 768px) 100vw, 560px"
              className="aspect-[4/3]"
              iconClassName="size-16"
            />
          </Card>
          <div className="flex flex-col gap-4">
            <div>
              <Badge>{product.tag}</Badge>
            </div>
            <h1 className="font-heading text-2xl font-semibold tracking-[-0.02em]">
              {product.name}
            </h1>
            <p className="leading-relaxed text-muted-foreground">
              {product.description}
            </p>
            {/* What the buyer gets, named from the actual upload rather than a
                claim the creator typed. Not a link: the file is what is being
                paid for, so it's only reachable through /downloads. */}
            {product.fileName && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileArrowDownIcon className="size-4 shrink-0" />
                <span className="truncate" title={product.fileName}>
                  {product.fileName}
                </span>
                {product.fileSize !== null && (
                  <span className="shrink-0 font-mono text-xs">
                    {formatFileSize(product.fileSize)}
                  </span>
                )}
              </div>
            )}
            <Separator />
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="font-mono text-[28px] font-bold">
                {formatPrice(product.price)}
              </span>
              {/* Two ways to buy: straight through the single-product checkout
                  below, or into the cart to pay for several at once. */}
              <div className="flex items-center gap-2">
                {isOwner ? (
                  // The creator viewing their own listing. Neither buying nor
                  // carting is on offer — both are refused server side — so the
                  // page points at the one thing they can actually do here.
                  <>
                    <Badge variant="neutral">{strings.store.yourProduct}</Badge>
                    <Button
                      size="lg"
                      variant="outline"
                      nativeButton={false}
                      render={<Link href={`/products/${product.id}`} />}
                    >
                      <PencilSimpleIcon />
                      {strings.store.editProduct}
                    </Button>
                  </>
                ) : hasPurchased ? (
                  // Already bought. Same treatment as the owner case and for
                  // the same reason: buying is refused server side, so the page
                  // offers the thing they actually came back for instead of a
                  // button that would fail. /downloads is where the file is.
                  <>
                    <Badge variant="neutral">{strings.store.owned}</Badge>
                    <Button
                      size="lg"
                      variant="outline"
                      nativeButton={false}
                      render={<Link href="/downloads" />}
                    >
                      <DownloadSimpleIcon />
                      {strings.store.goToDownloads}
                    </Button>
                  </>
                ) : (
                  <>
                    <AddToCartButton productId={product.id} inCart={inCart} />
                    {signedIn ? (
                      <Button size="lg" onClick={() => setStep("checkout")}>
                        <LockSimpleIcon />
                        Buy now
                      </Button>
                    ) : (
                      // Adding to the cart stays open to anonymous visitors;
                      // paying does not. Say so before the payment form rather
                      // than after it — `checkoutProduct` refuses either way.
                      <Button
                        size="lg"
                        nativeButton={false}
                        render={
                          <Link
                            href={
                              signInToCheckoutHref(
                                `/${storeHandle}/${product.id}/${product.slug}`,
                              ) as Route
                            }
                          />
                        }
                      >
                        <LockSimpleIcon />
                        {strings.cart.signInToBuy}
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
            {/* Nothing to reassure an owner or an existing buyer about — this
                listing isn't for sale to either of them. */}
            {!isOwner && !hasPurchased && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <ShieldCheckIcon className="size-4" />
                Secure Stripe checkout · instant download
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[960px] px-8 pt-7 pb-14">
      <Button
        variant="ghost"
        size="sm"
        className="mb-5"
        onClick={() => setStep("product")}
      >
        <ArrowLeftIcon />
        Back
      </Button>
      <div className="grid items-start gap-7 md:grid-cols-[1.2fr_1fr]">
        <Card className="p-0">
          <div className="flex flex-col gap-4 p-6">
            <h1 className="font-heading text-xl font-semibold">Checkout</h1>
            {error && (
              <p
                role="alert"
                className="rounded-2xl bg-destructive/10 px-3 py-2 text-xs text-destructive"
              >
                {error}
              </p>
            )}
            {/* Card details are collected on Stripe's hosted page, never
                here — see the note on the same panel in cart-view.tsx. */}
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium">Email</span>
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
              onClick={pay}
            >
              <LockSimpleIcon />
              {pending ? strings.cart.paying : `Pay $${total.toFixed(2)}`}
            </Button>
            <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
              <LockSimpleIcon className="size-3.5" />
              {strings.cart.securedBy}
            </div>
          </div>
        </Card>

        <Card className="p-0">
          <div className="flex flex-col gap-4 p-6">
            <div className="text-sm font-semibold text-muted-foreground">
              Order summary
            </div>
            <div className="flex items-center gap-3">
              <ProductCover
                seed={product.slug}
                imageUrl={product.imageUrls[0]}
                alt={product.name}
                sizes="56px"
                className="size-14 shrink-0 rounded-2xl"
                iconClassName="size-[22px]"
              />
              <div className="min-w-0">
                <div className="text-sm font-medium">{product.name}</div>
                <div className="text-xs text-muted-foreground">
                  {product.tag}
                </div>
              </div>
            </div>
            <Separator />
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-mono">${price.toFixed(2)}</span>
              </div>
            </div>
            <Separator />
            <div className="flex items-baseline justify-between">
              <span className="font-semibold">Total</span>
              <span className="font-mono text-[22px] font-bold">
                ${total.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <FileArrowDownIcon className="size-4" />
              Instant download after payment
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
