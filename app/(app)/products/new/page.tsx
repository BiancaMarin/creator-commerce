import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr"

import { ProductForm } from "@/components/dashboard/product-form"
import { Button } from "@/components/ui/button"
import { getStrings, pageMetadata } from "@/lib/server/i18n"
import { requireUser } from "@/lib/server/dal/session"

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("newProduct")
}

export default async function NewProductPage() {
  const strings = await getStrings()
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
