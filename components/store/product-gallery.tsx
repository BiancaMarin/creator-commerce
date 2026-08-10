"use client"

import * as React from "react"

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel"
import { ProductCover } from "@/components/store/product-cover"
import { strings } from "@/constants/strings"
import { cn } from "@/lib/utils"

/**
 * The product's images on its detail page.
 *
 * With zero or one image there is nothing to page through, so this renders a
 * plain `ProductCover` — same markup as before, no Embla instance, and the
 * gradient fallback still works. The carousel only appears from the second
 * image on. `imageUrls` order is meaningful: entry 0 is the cover, so it is
 * the slide the carousel opens on.
 */
export function ProductGallery({
  seed,
  imageUrls,
  alt,
  sizes,
  className,
  iconClassName,
}: {
  /** Fallback-gradient seed; use the product slug. */
  seed: string
  imageUrls: string[]
  alt?: string
  /** Passed to next/image — the rendered width of one slide. */
  sizes?: string
  className?: string
  iconClassName?: string
}) {
  const [api, setApi] = React.useState<CarouselApi>()
  const [current, setCurrent] = React.useState(0)

  React.useEffect(() => {
    if (!api) return

    // Only ever set state from Embla's own callbacks — the initial snap is 0,
    // which `current` already is.
    const onSelect = () => setCurrent(api.selectedScrollSnap())

    api.on("select", onSelect).on("reInit", onSelect)

    return () => {
      api.off("select", onSelect).off("reInit", onSelect)
    }
  }, [api])

  if (imageUrls.length < 2) {
    return (
      <ProductCover
        seed={seed}
        imageUrl={imageUrls[0]}
        alt={alt}
        sizes={sizes}
        className={className}
        iconClassName={iconClassName}
      />
    )
  }

  return (
    <Carousel setApi={setApi} opts={{ loop: true }}>
      {/* The primitive's default `-ml-4`/`pl-4` gutter would show a strip of
          card between slides mid-drag; these covers are full-bleed. */}
      <CarouselContent className="ml-0">
        {imageUrls.map((imageUrl, index) => (
          // The URL alone isn't guaranteed unique — the same file uploaded
          // twice is allowed — so pair it with the position.
          <CarouselItem key={`${index}-${imageUrl}`} className="pl-0">
            <ProductCover
              seed={seed}
              imageUrl={imageUrl}
              alt={alt}
              sizes={sizes}
              className={className}
              iconClassName={iconClassName}
            />
          </CarouselItem>
        ))}
      </CarouselContent>

      {/* The default arrows sit outside the frame, where the card's
          `overflow-hidden` would clip them — pull them back inside. */}
      <CarouselPrevious
        aria-label={strings.store.gallery.previousImage}
        className="left-3 bg-background/80 backdrop-blur-sm"
      />
      <CarouselNext
        aria-label={strings.store.gallery.nextImage}
        className="right-3 bg-background/80 backdrop-blur-sm"
      />

      <div
        aria-hidden
        className="absolute top-3 right-3 rounded-full bg-background/80 px-2 py-0.5 font-mono text-xs backdrop-blur-sm"
      >
        {strings.store.gallery.imageCount
          .replace("{current}", String(current + 1))
          .replace("{total}", String(imageUrls.length))}
      </div>

      <div className="absolute inset-x-0 bottom-3 flex items-center justify-center gap-1.5">
        {imageUrls.map((imageUrl, index) => (
          <button
            key={`${index}-${imageUrl}`}
            type="button"
            aria-label={strings.store.gallery.goToImage.replace(
              "{index}",
              String(index + 1),
            )}
            aria-current={index === current}
            onClick={() => api?.scrollTo(index)}
            className={cn(
              "size-2 rounded-full bg-background/60 ring-1 ring-foreground/10 transition-colors",
              index === current && "bg-background",
            )}
          />
        ))}
      </div>
    </Carousel>
  )
}
