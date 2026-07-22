"use client"

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
 * The gradient cover art placeholder for a digital product — swap for real
 * cover images later. `seed` (use the product slug) picks a stable gradient, so
 * a product looks the same everywhere it appears. Size it via `className`, the
 * glyph via `iconClassName`.
 */
export function ProductCover({
  seed,
  className,
  iconClassName,
}: {
  seed: string
  className?: string
  iconClassName?: string
}) {
  const { icon, cover } = visualsFor(seed)
  const Icon = icons[icon]

  return (
    <div
      className={cn("flex items-center justify-center text-white", className)}
      style={{ background: cover }}
    >
      <Icon className={cn("size-8", iconClassName)} />
    </div>
  )
}
