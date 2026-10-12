"use client";

import * as React from "react";

import {
  translateMessage,
  type Locale,
  type Strings,
} from "@/lib/i18n";

type I18nValue = { locale: Locale; strings: Strings };

const I18nContext = React.createContext<I18nValue | null>(null);

/**
 * Hands the request's dictionary to Client Components. The root layout passes
 * it in already resolved, so only the active language reaches the browser.
 */
export function I18nProvider({
  locale,
  strings,
  children,
}: I18nValue & { children: React.ReactNode }) {
  const value = React.useMemo(() => ({ locale, strings }), [locale, strings]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

function useI18n(): I18nValue {
  const value = React.useContext(I18nContext);
  if (!value) {
    throw new Error("useStrings must be used inside <I18nProvider>.");
  }
  return value;
}

export function useStrings(): Strings {
  return useI18n().strings;
}

export function useLocale(): Locale {
  return useI18n().locale;
}

/**
 * Resolves a validation or error message for display — see `translateMessage`.
 * Use it wherever a zod or server-action message is rendered.
 */
export function useTranslateMessage(): (message: string | undefined) => string {
  const strings = useStrings();
  return React.useCallback(
    (message) => (message ? translateMessage(strings, message) : ""),
    [strings],
  );
}
