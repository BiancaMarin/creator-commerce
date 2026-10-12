/**
 * The accents that sit beside the primary blue (tokens in app/globals.css).
 * Cycled across repeated items — feature cards, KPI tiles, avatars — so each
 * reads as its own thing without the UI turning into a rainbow.
 *
 * Literal class strings on purpose: Tailwind only generates classes it can see
 * written out in full.
 */
export const TONES = [
  {
    tile: "bg-primary/15 text-primary",
    solid: "bg-primary",
    text: "text-primary",
    edge: "border-t-primary",
    wash: "bg-linear-to-br from-primary/15 via-primary/5 to-transparent ring-primary/25 dark:ring-primary/30",
  },
  {
    tile: "bg-brand-indigo/15 text-brand-indigo",
    solid: "bg-brand-indigo",
    text: "text-brand-indigo",
    edge: "border-t-brand-indigo",
    wash: "bg-linear-to-br from-brand-indigo/15 via-brand-indigo/5 to-transparent ring-brand-indigo/25 dark:ring-brand-indigo/30",
  },
  {
    tile: "bg-brand-violet/15 text-brand-violet",
    solid: "bg-brand-violet",
    text: "text-brand-violet",
    edge: "border-t-brand-violet",
    wash: "bg-linear-to-br from-brand-violet/15 via-brand-violet/5 to-transparent ring-brand-violet/25 dark:ring-brand-violet/30",
  },
  {
    tile: "bg-brand-mint/15 text-brand-mint",
    solid: "bg-brand-mint",
    text: "text-brand-mint",
    edge: "border-t-brand-mint",
    wash: "bg-linear-to-br from-brand-mint/15 via-brand-mint/5 to-transparent ring-brand-mint/25 dark:ring-brand-mint/30",
  },
] as const;

export type Tone = (typeof TONES)[number];

/** The tone at a position, wrapping around. */
export function toneAt(index: number): Tone {
  return TONES[index % TONES.length];
}

/**
 * A stable tone for a string — so the same buyer's avatar is the same colour
 * on every page and every render.
 */
export function toneFor(seed: string): Tone {
  let hash = 0;
  for (const char of seed) {
    hash = (hash * 31 + char.charCodeAt(0)) | 0;
  }
  return toneAt(Math.abs(hash));
}
