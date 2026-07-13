import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRightIcon, StorefrontIcon } from "@phosphor-icons/react/dist/ssr"

import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Creator Commerce",
  description: "Sell your digital products with a storefront built for creators.",
}

export default function Home() {
  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <div className="flex max-w-md flex-col items-center gap-6 text-center">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
          <StorefrontIcon className="size-6" />
        </span>
        <div className="space-y-2">
          <h1 className="font-heading text-3xl font-semibold tracking-tight">
            Creator Commerce
          </h1>
          <p className="text-muted-foreground">
            The storefront built for creators. Track revenue, manage orders, and
            grow your audience — all in one place.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Button nativeButton={false} render={<Link href="/dashboard" />}>
            Go to dashboard
            <ArrowRightIcon />
          </Button>
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href="/login" />}
          >
            Sign in
          </Button>
        </div>
      </div>
    </div>
  )
}
