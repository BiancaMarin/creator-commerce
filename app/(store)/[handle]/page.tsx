import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { buttonVariants } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ProductCover } from "@/components/store/product-cover"
import { strings } from "@/constants/strings"
import { getCreatorByHandle } from "@/lib/server/dal/creators"
import { listProductsByHandle } from "@/lib/server/dal/products"
import { formatPrice } from "@/lib/store-data"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>
}): Promise<Metadata> {
  const { handle } = await params
  const creator = await getCreatorByHandle(handle)

  if (!creator) {
    return { title: `${strings.store.brand}` }
  }

  return {
    title: `${creator.name} — ${strings.store.brand}`,
    description: strings.store.tagline.replace("{name}", creator.name),
  }
}

export default async function StorefrontPage({
  params,
}: {
  params: Promise<{ handle: string }>
}) {
  const { handle } = await params
  // Cached alongside the layout's lookup, so this is the same single query.
  const creator = await getCreatorByHandle(handle)

  if (!creator) {
    notFound()
  }

  const products = await listProductsByHandle(creator.handle)

  return (
    <>
      <section className="mx-auto flex max-w-[1000px] items-center gap-5 px-8 pt-12 pb-8">
        <Avatar size="lg" className="size-18">
          {creator.image ? (
            <AvatarImage src={creator.image} alt={creator.name} />
          ) : null}
          <AvatarFallback className="text-2xl font-medium">
            {creator.initials}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="font-heading text-3xl font-semibold tracking-[-0.02em]">
            {creator.name}
          </h1>
          {/* There's no bio column on `user` yet, so the handle stands in
              rather than inventing copy for the creator. */}
          <p className="mt-1 max-w-[520px] text-muted-foreground">
            @{creator.handle}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-[1000px] px-8 pb-14">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-heading text-xl font-semibold">
            {strings.store.products}
          </h2>
          <span className="text-sm text-muted-foreground">
            {strings.store.itemCount.replace("{count}", String(products.length))}
          </span>
        </div>
        {products.length === 0 && (
          <Card className="flex items-center justify-center py-14 text-sm text-muted-foreground">
            {strings.store.noProducts}
          </Card>
        )}

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <Card
              key={product.id}
              className="gap-0 overflow-hidden p-0 transition-shadow hover:shadow-lg"
            >
              <Link
                href={`/${creator.handle}/${product.id}/${product.slug}`}
                className="block"
              >
                <ProductCover
                  seed={product.slug}
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
                    <span className={buttonVariants({ size: "sm" })}>
                      {strings.store.buy}
                    </span>
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
