/**
 * URL-safe slugs. Deliberately *not* under `lib/server/`: the product form
 * previews the slug as you type, so the client needs the exact same function
 * the server stores — otherwise the preview lies.
 */

/** Fits comfortably in the `slug` column and keeps URLs readable. */
export const SLUG_MAX_LENGTH = 60;

// Combining marks left behind by NFKD decomposition ("e" + U+0301 for "é").
// Written as escapes on purpose: literal combining characters in source attach
// themselves to the neighbouring `[` and `-`, silently breaking the class.
const COMBINING_MARKS = /[\u0300-\u036f]/g;

export function slugify(input: string, maxLength = SLUG_MAX_LENGTH) {
  return (
    input
      // "Café Décor" -> "cafe-decor" rather than dropping the accented letters.
      .normalize("NFKD")
      .replace(COMBINING_MARKS, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .replace(/-{2,}/g, "-")
      .slice(0, maxLength)
      // The slice can land mid-separator and leave a trailing hyphen.
      .replace(/-+$/, "")
  );
}
