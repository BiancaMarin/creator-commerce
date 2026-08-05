/**
 * Presentation helpers for products. The products themselves now live in the
 * database — see `lib/server/dal/products.ts`.
 */

/**
 * The client-safe view of a product. Client Components can't import the row
 * type from `lib/server/dal/products` (it's `server-only`), so storefront UI
 * takes this structural shape instead.
 *
 * `price` is a string because Postgres `numeric` round-trips as one.
 */
export type StoreProduct = {
  id: number
  slug: string
  name: string
  tag: string
  description: string
  price: string
  files: string | null
  /** Display order; the first entry is the cover. Empty when there are none. */
  imageUrls: string[]
}

export type ProductIcon =
  | "sliders-horizontal"
  | "play-circle"
  | "palette"
  | "shapes"

/** Everything `ProductCover` needs, so it doesn't depend on a server type. */
export type ProductVisuals = {
  icon: ProductIcon
  cover: string
}

const VISUALS: ProductVisuals[] = [
  {
    icon: "sliders-horizontal",
    cover: "linear-gradient(135deg,var(--chart-2),var(--chart-4))",
  },
  {
    icon: "play-circle",
    cover: "linear-gradient(135deg,var(--primary),var(--chart-4))",
  },
  {
    icon: "palette",
    cover: "linear-gradient(135deg,var(--chart-1),var(--chart-3))",
  },
  {
    icon: "shapes",
    cover: "linear-gradient(135deg,var(--chart-3),var(--primary))",
  },
]

/**
 * The fallback cover for a product with no uploaded image. It should at least
 * be *stable* — the same product always gets the same gradient, derived from
 * its slug rather than its position on the page.
 */
export function visualsFor(seed: string): ProductVisuals {
  let hash = 0

  for (let index = 0; index < seed.length; index++) {
    hash = (hash * 31 + seed.charCodeAt(index)) % 0xffffffff
  }

  return VISUALS[hash % VISUALS.length]
}

/**
 * Whole prices render as `$48`; anything with cents keeps two decimals.
 * Accepts the string Drizzle returns for `numeric` columns.
 */
export function formatPrice(value: number | string) {
  const amount = typeof value === "string" ? Number(value) : value

  return `$${Number.isInteger(amount) ? amount : amount.toFixed(2)}`
}
