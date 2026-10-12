"use server";

import { cookies } from "next/headers";

import { isLocale, LOCALE_COOKIE, type Locale } from "@/lib/i18n";

/**
 * Remembers the reader's language. A cookie rather than a URL prefix: every
 * route stays where it is, and a link shared between a Romanian and an English
 * reader opens in each one's own language.
 *
 * Not `httpOnly` — there's nothing secret in it — but it's still only ever
 * written here, so a value outside `LOCALES` can't get in.
 */
export async function setLocale(locale: Locale): Promise<void> {
  if (!isLocale(locale)) return;

  (await cookies()).set(LOCALE_COOKIE, locale, {
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
  });
}
