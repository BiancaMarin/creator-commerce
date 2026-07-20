import type { Metadata } from "next"
import Link from "next/link"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { buttonVariants } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ProductCover } from "@/components/store/product-cover"
import { creator, formatPrice, products } from "@/lib/store-data"

export const metadata: Metadata = {
  title: `${creator.name} — Creator Commerce`,
  description: creator.bio,
}

export default async function StorefrontPage({
  params,
}: {
  params: Promise<{ handle: string }>
}) {
  const { handle } = await params

  return (
    <>
      <section className="mx-auto flex max-w-[1000px] items-center gap-5 px-8 pt-12 pb-8">
        <Avatar size="lg" className="size-18">
          <AvatarFallback className="text-2xl font-medium">
            {creator.initials}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="font-heading text-3xl font-semibold tracking-[-0.02em]">
            {creator.name}
          </h1>
          <p className="mt-1 max-w-[520px] text-muted-foreground">
            {creator.bio}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-[1000px] px-8 pb-14">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-heading text-xl font-semibold">Products</h2>
          <span className="text-sm text-muted-foreground">
            {products.length} items
          </span>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <Card
              key={product.slug}
              className="gap-0 overflow-hidden p-0 transition-shadow hover:shadow-lg"
            >
              <Link
                href={`/${handle}/${product.id}/${product.slug}`}
                className="block"
              >
                <ProductCover
                  product={product}
                  className="aspect-[16/10]"
                  iconClassName="size-9"
                />
                <div className="flex flex-col gap-2.5 p-4">
                  <div>
                    <div className="font-heading text-[15px] font-medium">
                      {product.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {product.tag}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-base font-semibold">
                      {formatPrice(product.price)}
                    </span>
                    <span className={buttonVariants({ size: "sm" })}>Buy</span>
                  </div>
                </div>
              </Link>
            </Card>
          ))}
        </div>
      </section>
    </>
  )
}
