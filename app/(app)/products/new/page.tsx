import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr"

import { ProductForm } from "@/components/dashboard/product-form"
import { Button } from "@/components/ui/button"
import { strings } from "@/constants/strings"
import { requireUser } from "@/lib/server/dal/session"

export const metadata: Metadata = {
  title: "New product · Creator Commerce",
  description: "Add a digital product to your storefront.",
}

export default async function NewProductPage() {
  const user = await requireUser()

  return (
    <div className="flex flex-1 flex-col gap-5 p-4 md:p-6">
      <Button
        variant="ghost"
        size="sm"
        className="self-start text-muted-foreground"
        nativeButton={false}
        render={<Link href="/products" />}
      >
        <ArrowLeftIcon />
        {strings.products.backToProducts}
      </Button>

      <div className="max-w-2xl">
        <ProductForm handle={user.handle ?? ""} />
      </div>
    </div>
  )
}
