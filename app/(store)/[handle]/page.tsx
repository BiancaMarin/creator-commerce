import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { TrackEvent } from "@/components/analytics/track-event"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ProductCover } from "@/components/store/product-cover"
import { strings } from "@/constants/strings"
import { ANALYTICS_EVENTS } from "@/lib/analytics/events"
import { getCreatorByHandle } from "@/lib/server/dal/creators"
import { listPurchasedProductIds } from "@/lib/server/dal/orders"
import { listProductsByHandle } from "@/lib/server/dal/products"
import { getSession } from "@/lib/server/dal/session"
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

  // The storefront is public, so this is the first look at the session on this
  // route. It only decides whether the cards invite a purchase — the server
  // actions in lib/actions/cart.ts are what actually refuse one.
  const [products, session] = await Promise.all([
    listProductsByHandle(creator.handle),
    getSession(),
  ])
  // Compared by handle rather than user id, because `Creator` is deliberately
  // the public slice of the row and carries no id. Both sides come from the
  // database, so they're already in the stored casing — the case-insensitive
  // lookup happens on the URL segment, above.
  //
  // Every product on this page belongs to this one creator, so one comparison
  // settles the whole grid. A missing session or a null handle both compare
  // false against a non-null column, which is the answer we want anyway.
  const isOwner = session?.user.handle === creator.handle

  // Which of these the viewer already bought. One batched query for the grid
  // rather than `hasPurchasedProduct` per card — that is what
  // `listPurchasedProductIds` is for. Skipped entirely for the creator's own
  // storefront, where every card already says "Your product".
  const purchased =
    session && !isOwner
      ? await listPurchasedProductIds(
          session.user.id,
          products.map((product) => product.id),
        )
      : new Set<number>()

  return (
    <>
      {/* Funnel step 1. The session was already read above, so identifying the
          viewer here costs nothing extra; an anonymous browser is expected and
          gets merged in when they later sign in. */}
      <TrackEvent
        event={ANALYTICS_EVENTS.storefrontViewed}
        userId={session?.user.id}
        properties={{
          handle: creator.handle,
          products: products.length,
          is_owner: isOwner,
        }}
      />
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
                  imageUrl={product.imageUrls[0]}
                  alt={product.name}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 320px"
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
                    {/* The pill is decorative — the whole card is the link.
                        On the creator's own storefront, and on something the
                        viewer already bought, it says so rather than inviting
                        a purchase the server would refuse. */}
                    {isOwner ? (
                      <Badge variant="neutral">{strings.store.yourProduct}</Badge>
                    ) : purchased.has(product.id) ? (
                      <Badge variant="neutral">{strings.store.owned}</Badge>
                    ) : (
                      <span className={buttonVariants({ size: "sm" })}>
                        {strings.store.buy}
                      </span>
                    )}
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
