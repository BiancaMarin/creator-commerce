import type { Metadata } from "next";
import Link from "next/link";
import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/ssr";

import { SearchControls } from "@/components/explore/search-controls";
import { ProductCover } from "@/components/store/product-cover";
import { Card } from "@/components/ui/card";
import { strings } from "@/constants/strings";
import {
  hasActiveFilters,
  isSearchable,
  searchParamsSchema,
} from "@/lib/schemas/search";
import { listProductTypes, searchProducts } from "@/lib/server/dal/products";
import { formatPrice } from "@/lib/store-data";

export const metadata: Metadata = {
  title: "Explore · Creator Commerce",
  description: "Find digital products from creators across the platform.",
};

export default async function ExplorePage({
  searchParams,
}: {
  // A promise since Next 15 — it can't be read synchronously.
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // No session read here on purpose: (app)/layout.tsx gates the whole group,
  // and nothing on this page is scoped to the viewer — /explore shows every
  // live product, the reader's own catalog included.
  //
  // Every field `.catch()`es, so a hand-edited query string degrades to the
  // defaults instead of throwing on a page that has a perfectly good answer.
  const params = searchParamsSchema.parse(await searchParams);
  const { q, sort, type, min, max } = params;

  const [products, types] = await Promise.all([
    searchProducts(q, sort, type, min, max),
    listProductTypes(),
  ]);

  // Below the minimum the query ran unfiltered, so this is a browse — the copy
  // has to say that rather than claim these are matches for a partial term.
  const searching = isSearchable(q);
  const filtered = hasActiveFilters(params);

  // The search term is the most salient thing to echo back, so it wins the
  // copy when present. Otherwise the filters are named only in the aggregate —
  // see the note on `browsingFiltered` in constants/strings.ts.
  const summary = searching
    ? (products.length === 1
        ? strings.explore.resultCountOne
        : strings.explore.resultCount
      )
        .replace("{count}", String(products.length))
        .replace("{query}", q)
    : filtered
      ? (products.length === 1
          ? strings.explore.browsingFilteredOne
          : strings.explore.browsingFiltered
        ).replace("{count}", String(products.length))
      : strings.explore.browsing.replace("{count}", String(products.length));

  const emptyMessage = searching
    ? strings.explore.noResults.replace("{query}", q)
    : filtered
      ? strings.explore.noResultsFiltered
      : strings.explore.empty;

  const emptyHint = searching
    ? strings.explore.noResultsHint
    : filtered
      ? strings.explore.noResultsHintFilters
      : null;

  return (
    <div className="flex flex-1 flex-col gap-5 p-4 md:p-6">
      <div className="space-y-1">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          {strings.explore.title}
        </h1>
        <p className="text-sm text-muted-foreground">
          {strings.explore.subtitle}
        </p>
      </div>

      <SearchControls
        query={q}
        sort={sort}
        type={type}
        types={types}
        min={min}
        max={max}
      />

      {products.length === 0 ? (
        <Card className="flex flex-col items-center justify-center gap-2 py-16 text-center">
          <MagnifyingGlassIcon className="size-7 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
          {emptyHint && (
            <p className="text-xs text-muted-foreground">{emptyHint}</p>
          )}
        </Card>
      ) : (
        <>
          <p className="text-sm text-muted-foreground" aria-live="polite">
            {summary}
          </p>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <Card
                key={product.id}
                className="gap-0 overflow-hidden p-0 transition-shadow hover:shadow-lg"
              >
                <Link
                  href={`/${product.handle}/${product.id}/${product.slug}`}
                  className="block"
                >
                  <ProductCover
                    seed={product.slug}
                    imageUrl={product.imageUrls[0]}
                    alt={product.name}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 320px"
                    className="aspect-[16/10]"
                    iconClassName="size-9"
                  />
                  <div className="flex flex-col gap-2.5 p-4">
                    <div>
                      <div className="font-heading text-[15px] font-medium">
                        {product.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {/* The creator, not the product type — on a
                            platform-wide list, whose store this is matters
                            more than the tag the storefront grid shows. */}
                        {strings.explore.byCreator.replace(
                          "{handle}",
                          product.handle,
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-base font-semibold">
                        {formatPrice(product.price)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {product.tag}
                      </span>
                    </div>
                  </div>
                </Link>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
