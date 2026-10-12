import "server-only";

import type { Metadata } from "next";
import { cache } from "react";
import { cookies, headers } from "next/headers";

import {
  DEFAULT_LOCALE,
  getDictionary,
  isLocale,
  LOCALE_COOKIE,
  type Locale,
  type Strings,
} from "@/lib/i18n";

/**
 * The reader's language for this request. The toggle's cookie wins; without
 * one, a browser that prefers Romanian gets Romanian, everyone else English.
 *
 * Reading cookies makes every route that calls this dynamic — fine here, since
 * almost every page already reads the session cookie anyway.
 */
export const getLocale = cache(async (): Promise<Locale> => {
  const chosen = (await cookies()).get(LOCALE_COOKIE)?.value;
  if (isLocale(chosen)) return chosen;

  const accepted = (await headers()).get("accept-language") ?? "";
  // Only the first preference: "en-US,ro;q=0.8" is someone reading English.
  const primary = accepted.split(",")[0]?.trim().slice(0, 2).toLowerCase();
  return isLocale(primary) ? primary : DEFAULT_LOCALE;
});

/** The dictionary for this request — what Server Components and actions read. */
export async function getStrings(): Promise<Strings> {
  return getDictionary(await getLocale());
}

/**
 * `generateMetadata` for an app page, from `strings.meta`. A static `metadata`
 * export can't follow the reader's language, so every page goes through this.
 */
export async function pageMetadata(
  page: keyof Strings["meta"],
): Promise<Metadata> {
  const strings = await getStrings();
  return {
    title: `${strings.meta[page].title} · ${strings.store.brand}`,
    description: strings.meta[page].description,
  };
}
