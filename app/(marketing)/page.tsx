import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRightIcon,
  ChartLineUpIcon,
  CheckCircleIcon,
  CreditCardIcon,
  LockKeyIcon,
  MagicWandIcon,
  HandCoinsIcon,
  PlayCircleIcon,
  SparkleIcon,
  StorefrontIcon,
  UploadSimpleIcon,
  UsersThreeIcon,
} from "@phosphor-icons/react/dist/ssr";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AppPreview } from "@/components/marketing/app-preview";
import { LogoMark } from "@/components/marketing/logo";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { PricingSection } from "@/components/marketing/pricing-section";
import { strings } from "@/constants/strings";

export const metadata: Metadata = {
  title: strings.marketing.meta.title,
  description: strings.marketing.hero.subtitle,
};

// Copy lives in constants/strings.ts; only the icon — which isn't copy — is
// paired in here, by name rather than by position.
const features = [
  { icon: StorefrontIcon, ...strings.marketing.features.items.storefront },
  { icon: CreditCardIcon, ...strings.marketing.features.items.checkout },
  { icon: LockKeyIcon, ...strings.marketing.features.items.downloads },
  { icon: SparkleIcon, ...strings.marketing.features.items.aiPages },
  { icon: ChartLineUpIcon, ...strings.marketing.features.items.analytics },
  { icon: UsersThreeIcon, ...strings.marketing.features.items.customers },
];

const steps = [
  { icon: UploadSimpleIcon, ...strings.marketing.how.steps.upload },
  { icon: MagicWandIcon, ...strings.marketing.how.steps.publish },
  { icon: HandCoinsIcon, ...strings.marketing.how.steps.getPaid },
];

const headingClass = "font-heading font-semibold tracking-[-0.03em]";

export default function MarketingHomePage() {
  const { hero, trust, features: featuresCopy, how, cta } = strings.marketing;

  return (
    <>
      <MarketingNav />

      {/* Hero */}
      <section className="py-20">
        <div className="mx-auto grid max-w-[1120px] items-center gap-14 px-8 md:grid-cols-2">
          <div className="flex flex-col gap-6">
            <span>
              <Badge>
                <SparkleIcon />
                {hero.badge}
              </Badge>
            </span>
            <h1
              className={`${headingClass} text-4xl leading-[1.02] sm:text-5xl md:text-[54px]`}
            >
              {hero.title}
            </h1>
            <p className="max-w-[460px] text-lg leading-relaxed text-muted-foreground">
              {hero.subtitle}
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                size="lg"
                nativeButton={false}
                render={<Link href="/signup" />}
              >
                {hero.ctaPrimary}
                <ArrowRightIcon />
              </Button>
              <Button size="lg" variant="outline">
                <PlayCircleIcon />
                {hero.ctaSecondary}
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-2.5 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <CheckCircleIcon className="size-4 text-success" />
                {hero.trustNoCard}
              </span>
              <span className="text-border">·</span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircleIcon className="size-4 text-success" />
                {hero.trustFee}
              </span>
            </div>
          </div>
          <AppPreview />
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-y bg-muted">
        <div className="mx-auto grid max-w-[1120px] grid-cols-2 gap-6 px-8 py-8 md:grid-cols-4">
          {trust.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="font-mono text-3xl font-semibold tracking-[-0.03em]">
                {stat.value}
              </div>
              <div className="mt-1 text-sm text-muted-foreground">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20">
        <div className="mx-auto max-w-[1120px] px-8">
          <div className="mx-auto mb-11 flex max-w-[640px] flex-col gap-3.5 text-center">
            <span className="mx-auto">
              <Badge variant="secondary">{featuresCopy.badge}</Badge>
            </span>
            <h2 className={`${headingClass} text-3xl sm:text-[38px]`}>
              {featuresCopy.title}
            </h2>
            <p className="text-base text-muted-foreground sm:text-[17px]">
              {featuresCopy.subtitle}
            </p>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature.title}>
                <div className="flex flex-col gap-3 px-6">
                  <span className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <feature.icon className="size-6" />
                  </span>
                  <div className="font-heading text-[17px] font-semibold">
                    {feature.title}
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {feature.desc}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="border-y bg-muted py-20">
        <div className="mx-auto max-w-[1120px] px-8">
          <div className="mb-11 text-center">
            <h2 className={`${headingClass} mb-3 text-3xl sm:text-[38px]`}>
              {how.title}
            </h2>
            <p className="text-base text-muted-foreground sm:text-[17px]">
              {how.subtitle}
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {steps.map((step, index) => (
              <div key={step.title} className="flex flex-col gap-3.5">
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <step.icon className="size-5" />
                  </span>
                  <span className="font-mono text-sm text-muted-foreground">
                    0{index + 1}
                  </span>
                </div>
                <div className="font-heading text-lg font-semibold">
                  {step.title}
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <PricingSection />

      {/* CTA band */}
      <section className="pb-20">
        <div className="mx-auto max-w-[1120px] px-8">
          <div className="flex flex-col items-center gap-5 rounded-4xl bg-primary px-10 py-14 text-center text-primary-foreground">
            <span className="flex size-13 items-center justify-center rounded-2xl bg-white/20 text-white">
              <LogoMark className="size-7" />
            </span>
            <h2
              className={`${headingClass} max-w-[560px] text-3xl sm:text-[38px]`}
            >
              {cta.title}
            </h2>
            <p className="max-w-[460px] text-base leading-relaxed opacity-85 sm:text-[17px]">
              {cta.subtitle}
            </p>
            <Button
              size="lg"
              variant="secondary"
              nativeButton={false}
              render={<Link href="/signup" />}
            >
              {cta.button}
              <ArrowRightIcon />
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
