"use client";

import * as React from "react";
import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MagnifyingGlassIcon, XIcon } from "@phosphor-icons/react";

import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { strings } from "@/constants/strings";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import {
  MIN_SEARCH_LENGTH,
  SEARCH_DEBOUNCE_MS,
  SEARCH_SORTS,
  type ProductTypeFacet,
  type SearchSort,
} from "@/lib/schemas/search";
import { cn } from "@/lib/utils";

const sortLabels: Record<SearchSort, string> = {
  newest: strings.explore.sortNewest,
  oldest: strings.explore.sortOldest,
};

type ExploreQuery = {
  query: string;
  sort: SearchSort;
  type: string;
  min: string;
  max: string;
};

/**
 * `/explore?q=…&sort=…&type=…`, with empty values left off rather than sent
 * blank. Taking the whole state is what lets each control change one parameter
 * while carrying the other two, so filtering doesn't silently drop the search.
 *
 * Cast to `Route` because typed routes only validate string *literals* — a
 * built-up path is just `string` to the compiler. The literal prefix here is
 * `/explore`, which is a real route; the cast covers the query string.
 */
function exploreHref({ query, sort, type, min, max }: ExploreQuery): Route {
  const params = new URLSearchParams();

  if (query) {
    params.set("q", query);
  }

  // `newest` is the schema's default, so spelling it out only makes the URL
  // noisier — a bare /explore and /explore?sort=newest are the same page.
  if (sort !== "newest") {
    params.set("sort", sort);
  }

  if (type) {
    params.set("type", type);
  }

  if (min) {
    params.set("min", min);
  }

  if (max) {
    params.set("max", max);
  }

  const search = params.toString();

  return `/explore${search ? `?${search}` : ""}` as Route;
}

/**
 * The search box and sort toggle for /explore.
 *
 * State lives in the URL, not here: this component only decides *when* to
 * navigate. The page re-runs the query server-side and renders the results, so
 * a search is linkable and survives a refresh.
 *
 * The sort control is a pair of links rather than a button with an onClick —
 * it needs no JavaScript, and it means the two controls compose (each preserves
 * the other's parameter) without sharing any state.
 */
export function SearchControls({
  query,
  sort,
  type,
  types,
  min,
  max,
}: {
  /** The `q` currently reflected in the URL. */
  query: string;
  sort: SearchSort;
  /** The active product type, or "" for every type. */
  type: string;
  /** Every type on offer, most common first. */
  types: ProductTypeFacet[];
  /** Price bounds currently in the URL; "" for unbounded. */
  min: string;
  max: string;
}) {
  const router = useRouter();

  // Seeded from the props once and never re-synced. Syncing on every server
  // render would yank the caret back mid-word, because the value the server
  // knows about always trails what has been typed since.
  const [value, setValue] = React.useState(query);
  const [minValue, setMinValue] = React.useState(min);
  const [maxValue, setMaxValue] = React.useState(max);

  // Debounced separately so editing one field doesn't restart another's clock.
  const debounced = useDebouncedValue(value.trim(), SEARCH_DEBOUNCE_MS);
  const debouncedMin = useDebouncedValue(minValue.trim(), SEARCH_DEBOUNCE_MS);
  const debouncedMax = useDebouncedValue(maxValue.trim(), SEARCH_DEBOUNCE_MS);

  React.useEffect(() => {
    // Covers mount and the back button: if the debounced values already match
    // the URL there is nothing to navigate to, and replacing anyway would
    // fight a history entry the user just moved to.
    if (debounced === query && debouncedMin === min && debouncedMax === max) {
      return;
    }

    // `replace`, not `push` — otherwise every pause in typing leaves a history
    // entry and the back button walks the search letter by letter. `scroll:
    // false` keeps a long result list from jumping to the top as it refines.
    router.replace(
      exploreHref({
        query: debounced,
        sort,
        type,
        min: debouncedMin,
        max: debouncedMax,
      }),
      { scroll: false },
    );
  }, [
    debounced,
    debouncedMin,
    debouncedMax,
    query,
    min,
    max,
    sort,
    type,
    router,
  ]);

  // Only a hint while a term is started but too short to run. Below the floor
  // the page browses, so this explains why nothing has changed yet.
  const showMinLength =
    value.trim().length > 0 && value.trim().length < MIN_SEARCH_LENGTH;

  // Reads the live inputs, not the URL, so the reset appears as soon as
  // something is typed rather than a beat later once navigation lands.
  const hasFilters = Boolean(type || minValue.trim() || maxValue.trim());

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <MagnifyingGlassIcon
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            type="search"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            aria-label={strings.explore.searchLabel}
            placeholder={strings.explore.searchPlaceholder}
            className="pl-9"
          />
        </div>

        <div
          role="group"
          aria-label={strings.explore.sortLabel}
          className="flex items-center gap-1 rounded-4xl bg-muted/50 p-1"
        >
          {SEARCH_SORTS.map((option) => (
            <Link
              key={option}
              // Built from the *typed* values, not the URL's, so switching
              // sort mid-word doesn't discard what hasn't been committed yet.
              href={exploreHref({
                query: value.trim(),
                sort: option,
                type,
                min: minValue.trim(),
                max: maxValue.trim(),
              })}
              scroll={false}
              aria-current={option === sort ? "true" : undefined}
              className={cn(
                buttonVariants({
                  variant: option === sort ? "default" : "ghost",
                  size: "sm",
                }),
                // The inactive half shouldn't read as a second primary action.
                option !== sort && "text-muted-foreground",
              )}
            >
              {sortLabels[option]}
            </Link>
          ))}
        </div>
      </div>

      {showMinLength && (
        <p className="text-xs text-muted-foreground">
          {strings.explore.minLengthHint.replace(
            "{count}",
            String(MIN_SEARCH_LENGTH),
          )}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {strings.explore.priceLabel}
          </span>
          <PriceInput
            value={minValue}
            onChange={setMinValue}
            label={strings.explore.priceMinAria}
            placeholder={strings.explore.priceMin}
          />
          <span aria-hidden className="text-muted-foreground">
            –
          </span>
          <PriceInput
            value={maxValue}
            onChange={setMaxValue}
            label={strings.explore.priceMaxAria}
            placeholder={strings.explore.priceMax}
          />
        </div>

        {/* Three filters can combine into an empty page whose cause isn't
            obvious. One link resets all of them and keeps the search term. */}
        {hasFilters && (
          <Link
            href={exploreHref({
              query: value.trim(),
              sort,
              type: "",
              min: "",
              max: "",
            })}
            scroll={false}
            onClick={() => {
              // The inputs aren't re-synced from props, so navigating alone
              // would leave the old numbers sitting in them.
              setMinValue("");
              setMaxValue("");
            }}
            className={cn(
              buttonVariants({ variant: "ghost", size: "xs" }),
              "text-muted-foreground",
            )}
          >
            <XIcon />
            {strings.explore.clearFilters}
          </Link>
        )}
      </div>

      {/* Hidden when the platform only offers one type — a filter with a
          single option next to "All" can't narrow anything. */}
      {types.length > 1 && (
        <div
          role="group"
          aria-label={strings.explore.typeLabel}
          className="flex flex-wrap items-center gap-1.5"
        >
          <TypeChip
            label={strings.explore.typeAll}
            href={exploreHref({
              query: value.trim(),
              sort,
              type: "",
              min: minValue.trim(),
              max: maxValue.trim(),
            })}
            isActive={type === ""}
          />

          {types.map((facet) => (
            <TypeChip
              key={facet.type}
              label={facet.type}
              count={facet.products}
              href={exploreHref({
                query: value.trim(),
                sort,
                type: facet.type,
                min: minValue.trim(),
                max: maxValue.trim(),
              })}
              // Case-insensitive, matching how the query compares it: the URL
              // may carry a different spelling than the label shown here.
              isActive={type.toLowerCase() === facet.type.toLowerCase()}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * One end of the price range.
 *
 * `type="number"` for the numeric keyboard and the browser's own rejection of
 * letters; `step="0.01"` so cents aren't flagged as invalid. Server-side the
 * value still goes through `priceBound`, which is what actually decides — the
 * input type is a convenience, not the check.
 */
function PriceInput({
  value,
  onChange,
  label,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder: string;
}) {
  return (
    <Input
      type="number"
      inputMode="decimal"
      min={0}
      step={0.01}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      aria-label={label}
      placeholder={placeholder}
      className="w-24"
    />
  );
}

function TypeChip({
  label,
  count,
  href,
  isActive,
}: {
  label: string;
  count?: number;
  href: Route;
  isActive: boolean;
}) {
  return (
    <Link
      href={href}
      scroll={false}
      aria-current={isActive ? "true" : undefined}
      className={cn(
        buttonVariants({ variant: isActive ? "secondary" : "ghost", size: "xs" }),
        "rounded-4xl ring ring-foreground/5",
        !isActive && "text-muted-foreground",
      )}
    >
      {label}
      {count !== undefined && (
        <span className="font-mono text-[10px] opacity-60">{count}</span>
      )}
    </Link>
  );
}
