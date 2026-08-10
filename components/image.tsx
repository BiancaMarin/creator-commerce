import NextImage from "next/image";

type NextImageProps = React.ComponentProps<typeof NextImage>;

/**
 * Either dimension hint, but never neither.
 *
 * `next/image` types `width`/`height` as optional because a static import
 * supplies them and `fill` makes them meaningless — which leaves a remote `src`
 * with no dimensions compiling fine and reserving no space, so the page reflows
 * when the image decodes. Every image here is remote (UploadThing), so the
 * union closes that hole: pass `fill` and let a positioned parent set the box,
 * or pass the intrinsic `width` and `height` as a pair.
 *
 * `width`/`height` are the image's *intrinsic* pixel size, used only to derive
 * the aspect ratio the browser reserves. CSS still controls the rendered size,
 * so `width={36} height={36}` alongside `className="size-9"` is correct and not
 * a contradiction.
 */
type SizeHint =
  | { fill: true; width?: never; height?: never }
  | {
      fill?: false;
      width: NonNullable<NextImageProps["width"]>;
      height: NonNullable<NextImageProps["height"]>;
    };

export type ImageProps = Omit<NextImageProps, "fill" | "width" | "height"> &
  SizeHint;

/**
 * Every image in the app renders through this component.
 *
 * It is a pass-through over `next/image` — same props, same behaviour, bar the
 * mandatory size hint above — and exists so the implementation is swappable
 * from one file. Nothing else should import `next/image` directly; that keeps a
 * future change (a different optimizer, a CDN loader, a plain `<img>` for a
 * static export) to an edit here instead of a sweep across call sites.
 *
 * Two rules the type can't enforce:
 *
 * - Pass `sizes` whenever the rendered box isn't viewport-wide, or the browser
 *   downloads a variant far larger than it paints. It also switches Next from a
 *   1x/2x `srcset` to a full width-based one.
 * - Remote hosts must be listed in `images.remotePatterns` (`next.config.ts`),
 *   currently pinned to this app's own UploadThing subdomain.
 *
 * For an LCP image, prefer `loading="eager"` + `fetchPriority="high"` over
 * `preload` — the Next 16 docs say not to combine `preload` with either, and
 * `priority` is deprecated in favour of `preload`. See `ProductCover`'s `eager`
 * prop, which is the app's one caller that needs this.
 *
 * Deliberately not `"use client"`: as a plain re-export it renders in Server
 * and Client Components alike, exactly as `next/image` does.
 */
export function Image(props: ImageProps) {
  return <NextImage {...props} />;
}
