import { strings as en } from "@/constants/strings";
import { ro } from "@/constants/strings.ro";

/**
 * The languages the UI ships in. English is the source dictionary
 * (`constants/strings.ts`); every other one is typed against its shape, so a
 * key added to English and forgotten elsewhere fails the build.
 *
 * Neutral on purpose — imported by Client Components, server code and the zod
 * schemas alike. The request-scoped half (reading the cookie) lives in
 * `lib/server/i18n.ts`.
 */
export const LOCALES = ["en", "ro"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

/** Set by the language toggle; read on every request. */
export const LOCALE_COOKIE = "locale";

export const LOCALE_LABELS: Record<Locale, { short: string; name: string }> = {
  en: { short: "EN", name: "English" },
  ro: { short: "RO", name: "Română" },
};

/** The BCP 47 tag `Intl` formatters take for each locale (dates, counts). */
export const INTL_LOCALE: Record<Locale, string> = {
  en: "en-US",
  ro: "ro-RO",
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

/**
 * `typeof en` with every literal widened to `string`. English is declared
 * `as const`, so without this a translation would have to repeat the English
 * text to type-check.
 */
type Widen<T> = T extends string
  ? string
  : T extends readonly (infer U)[]
    ? readonly Widen<U>[]
    : { readonly [K in keyof T]: Widen<T[K]> };

export type Strings = Widen<typeof en>;

const dictionaries: Record<Locale, Strings> = { en, ro };

export function getDictionary(locale: Locale): Strings {
  return dictionaries[locale];
}

/**
 * The badge text for an `orders.status` value. The column is typed `string`,
 * so an unexpected value shows as itself rather than as nothing.
 */
export function orderStatusLabel(t: Strings, status: string): string {
  return (t.orderStatus as Record<string, string>)[status] ?? status;
}

// --- Messages that cross a boundary ---------------------------------------
//
// Zod schemas are module-level and shared by client and server, so they can't
// know the reader's language when they're built. They carry a *key* instead
// (`validation.invalidEmail`), and whoever renders the error resolves it with
// `translateMessage`. Parameters ride along as a query string:
// `validation.productImageCount?count=6`.

type MessageGroup = "validation" | "errors";

export type MessageKey = {
  [G in MessageGroup]: `${G}.${keyof Strings[G] & string}`;
}[MessageGroup];

export function messageKey(
  key: MessageKey,
  params?: Record<string, string | number>,
): string {
  if (!params) return key;
  return `${key}?${new URLSearchParams(
    Object.entries(params).map(([name, value]) => [name, String(value)]),
  )}`;
}

const MESSAGE_KEY_PATTERN = /^(validation|errors)\.(\w+)(?:\?(.*))?$/;

/**
 * Resolves a message produced by `messageKey` in the given dictionary. Anything
 * else — a server action's already-translated error, an UploadThing message —
 * passes through untouched, so every error display can call this blindly.
 */
export function translateMessage(t: Strings, message: string): string {
  const match = MESSAGE_KEY_PATTERN.exec(message);
  if (!match) return message;

  const [, group, name, query] = match;
  const text = (t[group as MessageGroup] as Record<string, string>)[name];
  if (typeof text !== "string") return message;

  let resolved = text;
  for (const [param, value] of new URLSearchParams(query ?? "")) {
    resolved = resolved.replaceAll(`{${param}}`, value);
  }
  return resolved;
}
