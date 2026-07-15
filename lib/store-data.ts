export type ProductIcon =
  | "sliders-horizontal"
  | "play-circle"
  | "palette"
  | "shapes"

export type Product = {
  slug: string
  name: string
  tag: string
  price: number
  icon: ProductIcon
  cover: string
  desc: string
  files: string
}

export const creator = {
  slug: "alex.studio",
  name: "Alex Rivera",
  handle: "alex.studio",
  initials: "AR",
  bio: "Photographer & educator. Presets, courses and templates to help you shoot and edit with confidence.",
}

export const products: Product[] = [
  {
    slug: "studio-preset-pack",
    name: "Studio Preset Pack",
    tag: "Lightroom presets",
    price: 48,
    icon: "sliders-horizontal",
    cover: "linear-gradient(135deg,var(--chart-2),var(--chart-4))",
    desc: "40 hand-tuned Lightroom presets for warm, filmic editorial portraits. Works with Lightroom Classic, CC and mobile.",
    files: "12 files · .xmp, .dng · 84 MB",
  },
  {
    slug: "lightroom-masterclass",
    name: "Lightroom Masterclass",
    tag: "Video course",
    price: 129,
    icon: "play-circle",
    cover: "linear-gradient(135deg,var(--primary),var(--chart-4))",
    desc: "A 6-hour video course taking you from import to export, with RAW files to follow along.",
    files: "18 lessons · .mp4 · 4.2 GB",
  },
  {
    slug: "brand-kit-templates",
    name: "Brand Kit Templates",
    tag: "Design templates",
    price: 64,
    icon: "palette",
    cover: "linear-gradient(135deg,var(--chart-1),var(--chart-3))",
    desc: "Editable brand identity templates: logos, social layouts and a type system in Figma + Canva.",
    files: "6 files · .fig, .pdf · 220 MB",
  },
  {
    slug: "motion-graphics-bundle",
    name: "Motion Graphics Bundle",
    tag: "After Effects",
    price: 89,
    icon: "shapes",
    cover: "linear-gradient(135deg,var(--chart-3),var(--primary))",
    desc: "120 drag-and-drop After Effects motion presets and lower-thirds for creators.",
    files: "120 files · .aep · 1.1 GB",
  },
]

export function getProduct(slug: string): Product | undefined {
  return products.find((product) => product.slug === slug)
}

/** Whole prices render as `$48`; anything with cents keeps two decimals. */
export function formatPrice(value: number) {
  return `$${Number.isInteger(value) ? value : value.toFixed(2)}`
}
