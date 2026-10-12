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
  },
  {
    tile: "bg-brand-indigo/15 text-brand-indigo",
    solid: "bg-brand-indigo",
    text: "text-brand-indigo",
    edge: "border-t-brand-indigo",
  },
  {
    tile: "bg-brand-violet/15 text-brand-violet",
    solid: "bg-brand-violet",
    text: "text-brand-violet",
    edge: "border-t-brand-violet",
  },
  {
    tile: "bg-brand-mint/15 text-brand-mint",
    solid: "bg-brand-mint",
    text: "text-brand-mint",
    edge: "border-t-brand-mint",
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
