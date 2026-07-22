"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeftIcon,
  CreditCardIcon,
  FileArrowDownIcon,
  LockSimpleIcon,
  ShieldCheckIcon,
} from "@phosphor-icons/react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { ProductCover } from "@/components/store/product-cover"
import { formatPrice, type StoreProduct } from "@/lib/store-data"

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

export function ProductCheckoutFlow({
  product,
  storeHandle,
}: {
  product: StoreProduct
  storeHandle: string
}) {
  const router = useRouter()
  const [step, setStep] = React.useState<"product" | "checkout">("product")

  const price = Number(product.price)
  const fee = price * 0.02
  const total = price + fee

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
            <ProductCover
              seed={product.slug}
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
            {product.files && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileArrowDownIcon className="size-4" />
                {product.files}
              </div>
            )}
            <Separator />
            <div className="flex items-center justify-between">
              <span className="font-mono text-[28px] font-bold">
                {formatPrice(product.price)}
              </span>
              <Button size="lg" onClick={() => setStep("checkout")}>
                <LockSimpleIcon />
                Buy now
              </Button>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <ShieldCheckIcon className="size-4" />
              Secure Stripe checkout · instant download
            </div>
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
            <form
              className="flex flex-col gap-4"
              onSubmit={(event) => {
                event.preventDefault()
                // TODO: wire up Stripe payment.
                router.push(
                  `/checkout/success?p=${product.id}&s=${storeHandle}`
                )
              }}
            >
              <Field label="Email">
                <Input type="email" placeholder="you@example.com" />
              </Field>
              <Separator />
              <div className="text-sm font-semibold text-muted-foreground">
                Payment details
              </div>
              <Field label="Card number">
                <div className="relative">
                  <Input placeholder="1234 1234 1234 1234" className="pr-12" />
                  <CreditCardIcon className="absolute top-1/2 right-3 size-[18px] -translate-y-1/2 text-muted-foreground" />
                </div>
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Expiry">
                  <Input placeholder="MM / YY" />
                </Field>
                <Field label="CVC">
                  <Input placeholder="123" />
                </Field>
              </div>
              <Field label="Name on card">
                <Input placeholder="Jane Creator" />
              </Field>
              <Button type="submit" size="lg" className="w-full">
                <LockSimpleIcon />
                Pay ${total.toFixed(2)}
              </Button>
              <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                <LockSimpleIcon className="size-3.5" />
                Payments secured by Stripe
              </div>
            </form>
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
              <div className="flex justify-between">
                <span className="text-muted-foreground">Platform fee (2%)</span>
                <span className="font-mono">${fee.toFixed(2)}</span>
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
