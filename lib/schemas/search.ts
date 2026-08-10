import { z } from "zod";

/**
 * Shortest term the search will actually filter on. Anything below this is
 * treated as no query at all and the page browses instead.
 *
 * Not an arbitrary UX number: the trigram indexes backing the search
 * (`products_name_trgm_idx`, see lib/server/db/schemas/product.ts) key on
 * three-character sequences, so a shorter pattern yields no complete trigram
 * to seek on. The planner still picks the index, but the scan degenerates to
 * reading the whole thing and rechecking every row — measured on this database
 * at an estimated cost of 304 for a 2-character term against 8.5 for a
 * 3-character one. Three is where a lookup stops being a full scan.
 */
export const MIN_SEARCH_LENGTH = 3;

/** Results per search. No pagination yet, so this is the whole answer. */
export const SEARCH_RESULT_LIMIT = 50;

/** How long typing has to pause before the URL updates and the query runs. */
export const SEARCH_DEBOUNCE_MS = 300;

/** Longer than any useful search; stops a pathological URL reaching the DB. */
const MAX_SEARCH_LENGTH = 100;

/** Mirrors the `tag` column width in lib/server/db/schemas/product.ts. */
const PRODUCT_TAG_MAX_LENGTH = 60;

/**
 * Same shape as `productSchema`'s price: digits, at most two decimals, no sign
 * or exponent. Kept as a string end to end because the column is `numeric`,
 * which Drizzle round-trips as a string — money should never pass through a
 * float, and that applies to a filter bound as much as to a price.
 */
const PRICE_PATTERN = /^\d{1,8}(\.\d{1,2})?$/;

/**
 * One end of the price range. Anything that isn't a plain amount — including
 * the empty string — becomes "", which the query reads as "no bound".
 */
const priceBound = z.string().trim().regex(PRICE_PATTERN).catch("");

export const SEARCH_SORTS = ["newest", "oldest"] as const;

/**
 * The /explore query string. Shared by the page (which parses the incoming
 * params) and the controls (which build outgoing ones), so the two can't
 * disagree about what a valid search looks like.
 *
 * Every field `.catch()`es rather than throwing. These values come from a URL a
 * user can edit, so `?sort=banana` has to degrade to the default — throwing
 * would turn a typo into a 500 on a page that has a perfectly good answer.
 */
export const searchParamsSchema = z.object({
  q: z.string().trim().max(MAX_SEARCH_LENGTH).catch(""),
  sort: z.enum(SEARCH_SORTS).catch("newest"),
  // The product's "Type" field (the `tag` column). Free text typed per product
  // rather than a fixed vocabulary, so this can't be a z.enum — an unknown
  // value simply matches nothing, which is the honest result for a type no one
  // sells. Capped at the column width.
  type: z.string().trim().max(PRODUCT_TAG_MAX_LENGTH).catch(""),
  // Independently optional: a max with no min is "under $25", a min with no max
  // is "$100 and up". An inverted range (min above max) is left alone rather
  // than silently swapped — it returns nothing, and both values are visible in
  // the inputs, so the cause is on screen.
  min: priceBound,
  max: priceBound,
});

export type SearchParams = z.infer<typeof searchParamsSchema>;
export type SearchSort = SearchParams["sort"];

/**
 * One entry in the /explore type filter: a product type and how many products
 * carry it.
 *
 * Declared here rather than in the DAL that produces it because the filter UI
 * is a Client Component and `lib/server/*` must never reach a client bundle —
 * the same reason `StoreProduct` lives in lib/store-data.ts.
 */
export type ProductTypeFacet = { type: string; products: number };

/** Is this term long enough to filter on, as opposed to browse? */
export function isSearchable(query: string) {
  return query.trim().length >= MIN_SEARCH_LENGTH;
}

/**
 * Is anything narrowing the results besides the search term? Drives the copy:
 * with three filter dimensions, spelling out every combination is a matrix
 * nobody can keep correct, and the active filters are on screen anyway.
 */
export function hasActiveFilters({ type, min, max }: SearchParams) {
  return Boolean(type || min || max);
}
