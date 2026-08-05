"use client"

import Image from "next/image"
import {
  PaletteIcon,
  PlayCircleIcon,
  ShapesIcon,
  SlidersHorizontalIcon,
} from "@phosphor-icons/react"

import { cn } from "@/lib/utils"
import { visualsFor, type ProductIcon } from "@/lib/store-data"

const icons: Record<ProductIcon, React.ComponentType<{ className?: string }>> = {
  "sliders-horizontal": SlidersHorizontalIcon,
  "play-circle": PlayCircleIcon,
  palette: PaletteIcon,
  shapes: ShapesIcon,
}

/**
 * Cover art for a digital product.
 *
 * Renders the creator's uploaded image when the product has one, and otherwise
 * falls back to a gradient keyed off `seed` (use the product slug), so a
 * product without an image still looks the same everywhere it appears.
 *
 * Size it via `className` — the image fills whatever box that sets, so the
 * class has to establish one (an `aspect-*`, a height, or a width on a square).
 * The glyph is sized via `iconClassName`.
 */
export function ProductCover({
  seed,
  imageUrl,
  alt,
  sizes,
  className,
  iconClassName,
}: {
  seed: string
  /** The product's `image_url`; falls back to the gradient when absent. */
  imageUrl?: string | null
  alt?: string
  /** Passed to next/image — tell it the rendered width so it picks a variant. */
  sizes?: string
  className?: string
  iconClassName?: string
}) {
  if (imageUrl) {
    return (
      // `fill` needs a positioned parent, and the muted background keeps the
      // box from flashing white before the image decodes.
      <div
        className={cn(
          "relative aspect-square overflow-hidden bg-muted",
          className,
        )}
      >
        <Image
          src={imageUrl}
          alt={alt ?? ""}
          fill
          sizes={sizes ?? "(max-width: 640px) 100vw, 33vw"}
          className="object-cover"
        />
      </div>
    )
  }

  const { icon, cover } = visualsFor(seed)
  const Icon = icons[icon]

  return (
    <div
      className={cn(
        "flex aspect-square items-center justify-center text-white",
        className,
      )}
      style={{ background: cover }}
    >
      <Icon className={cn("size-8", iconClassName)} />
    </div>
  )
}
