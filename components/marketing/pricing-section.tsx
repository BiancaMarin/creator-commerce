"use client"

import * as React from "react"
import { CheckIcon } from "@phosphor-icons/react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { strings } from "@/constants/strings"

const tiers = [
  {
    name: "Starter",
    monthly: 0,
    yearly: 0,
    sub: "For your first sales",
    fee: "2% + Stripe fees",
    feats: [
      "Public storefront",
      "Unlimited products",
      "Protected downloads",
      "Basic analytics",
    ],
    cta: "Start free",
    highlight: false,
  },
  {
    name: "Pro",
    monthly: 19,
    yearly: 15,
    sub: "For growing creators",
    fee: "1% + Stripe fees",
    feats: [
      "Everything in Starter",
      "AI product pages",
      "Customer segments",
      "Custom domain",
      "Priority support",
    ],
    cta: "Start Pro trial",
    highlight: true,
  },
  {
    name: "Studio",
    monthly: 49,
    yearly: 39,
    sub: "For full catalogs",
    fee: "0% platform fee",
    feats: [
      "Everything in Pro",
      "Team members",
      "Stripe Connect payouts",
      "Advanced analytics",
      "Sentry & PostHog",
    ],
    cta: "Contact sales",
    highlight: false,
  },
]

export function PricingSection() {
  const [yearly, setYearly] = React.useState(false)
  const copy = strings.marketing.pricing

  return (
    <section id="pricing" className="py-20">
      <div className="mx-auto max-w-[1120px] px-8">
        <div className="mb-8 text-center">
          <h2 className="font-heading text-3xl font-semibold tracking-[-0.03em] sm:text-[38px]">
            {copy.title}
          </h2>
          <p className="mt-3 text-base text-muted-foreground sm:text-[17px]">
            {copy.subtitle}
          </p>
          <div className="mt-6 inline-flex items-center gap-1 rounded-full bg-muted p-1">
            {[copy.monthly, copy.yearly].map((label, index) => {
              const active = (index === 1) === yearly
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => setYearly(index === 1)}
                  className={cn(
                    "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-background text-foreground shadow-xs"
                      : "text-muted-foreground"
                  )}
                >
                  {label}
                  {index === 1 && (
                    <span className="text-primary"> {copy.save}</span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3 md:items-start">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={cn(
                "flex flex-col gap-4 rounded-4xl bg-card p-6 shadow-md ring-1 ring-foreground/5",
                tier.highlight && "shadow-lg ring-2 ring-primary"
              )}
            >
              <div className="flex items-center justify-between">
                <span className="font-heading text-lg font-semibold">
                  {tier.name}
                </span>
                {tier.highlight && <Badge>{copy.mostPopular}</Badge>}
              </div>
              <div>
                <span className="font-mono text-4xl font-semibold tracking-[-0.03em]">
                  ${yearly ? tier.yearly : tier.monthly}
                </span>
                <span className="text-sm text-muted-foreground">
                  {copy.perMonth}
                </span>
                <div className="mt-1 text-sm text-muted-foreground">
                  {tier.sub}
                </div>
              </div>
              <Button
                variant={tier.highlight ? "default" : "outline"}
                className="w-full"
              >
                {tier.cta}
              </Button>
              <Separator />
              <div className="flex flex-col gap-2.5">
                <div className="text-xs font-medium text-muted-foreground">
                  {tier.fee}
                </div>
                {tier.feats.map((feat) => (
                  <div key={feat} className="flex items-center gap-2.5 text-sm">
                    <CheckIcon className="size-4 shrink-0 text-primary" />
                    {feat}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
