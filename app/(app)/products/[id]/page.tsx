import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr"

import { ProductForm } from "@/components/dashboard/product-form"
import { Button } from "@/components/ui/button"
import { strings } from "@/constants/strings"
import { getProductForUser } from "@/lib/server/dal/products"
import { requireUser } from "@/lib/server/dal/session"

export const metadata: Metadata = {
  title: "Edit product · Creator Commerce",
  description: "Update the details buyers see on your storefront.",
}

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const productId = Number(id)

  // "/products/abc" is not a product — bail before hitting the database.
  if (!Number.isInteger(productId)) {
    notFound()
  }

  const user = await requireUser()
  // Scoped to the owner, so another creator's id 404s rather than loading.
  const product = await getProductForUser(productId, user.id)

  if (!product) {
    notFound()
  }

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
        <ProductForm
          handle={user.handle ?? ""}
          product={{
            id: product.id,
            slug: product.slug,
            name: product.name,
            tag: product.tag,
            description: product.description,
            price: product.price,
            // The three columns become one object for the form, which holds
            // the file as a unit — you can't attach a name without a key.
            // Null when the product predates product files.
            file:
              product.fileKey && product.fileName && product.fileSize !== null
                ? {
                    key: product.fileKey,
                    name: product.fileName,
                    size: product.fileSize,
                  }
                : null,
            imageUrls: product.imageUrls,
          }}
        />
      </div>
    </div>
  )
}
