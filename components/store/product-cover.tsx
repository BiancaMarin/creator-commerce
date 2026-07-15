"use client"

import {
  PaletteIcon,
  PlayCircleIcon,
  ShapesIcon,
  SlidersHorizontalIcon,
} from "@phosphor-icons/react"

import { cn } from "@/lib/utils"
import type { Product, ProductIcon } from "@/lib/store-data"

const icons: Record<ProductIcon, React.ComponentType<{ className?: string }>> = {
  "sliders-horizontal": SlidersHorizontalIcon,
  "play-circle": PlayCircleIcon,
  palette: PaletteIcon,
  shapes: ShapesIcon,
}

/**
 * The gradient cover art placeholder for a digital product — swap for real
 * cover images later. Size it via `className`, the glyph via `iconClassName`.
 */
export function ProductCover({
  product,
  className,
  iconClassName,
}: {
  product: Product
  className?: string
  iconClassName?: string
}) {
  const Icon = icons[product.icon]
  return (
    <div
      className={cn("flex items-center justify-center text-white", className)}
      style={{ background: product.cover }}
    >
      <Icon className={cn("size-8", iconClassName)} />
    </div>
  )
}
