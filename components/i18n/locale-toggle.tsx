"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { useLocale, useStrings } from "@/components/i18n/i18n-provider";
import { setLocale } from "@/lib/actions/locale";
import { LOCALE_LABELS, LOCALES, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/**
 * EN | RO switch. Writes the cookie through a Server Action, then refreshes so
 * Server Components re-render in the new language without a full reload —
 * form input and the CECE conversation survive the switch.
 */
export function LocaleToggle({ className }: { className?: string }) {
  const router = useRouter();
  const strings = useStrings();
  const current = useLocale();
  const [isPending, startTransition] = React.useTransition();

  function choose(locale: Locale) {
    if (locale === current) return;
    startTransition(async () => {
      await setLocale(locale);
      router.refresh();
    });
  }

  return (
    <div
      role="group"
      aria-label={strings.common.language}
      className={cn(
        "inline-flex h-8 shrink-0 items-center gap-0.5 rounded-4xl bg-muted p-0.5 text-xs font-medium",
        isPending && "opacity-70",
        className,
      )}
    >
      {LOCALES.map((locale) => {
        const active = locale === current;
        return (
          <button
            key={locale}
            type="button"
            lang={locale}
            aria-pressed={active}
            title={LOCALE_LABELS[locale].name}
            disabled={isPending}
            onClick={() => choose(locale)}
            className={cn(
              "h-7 rounded-4xl px-2.5 outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/30",
              active
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {LOCALE_LABELS[locale].short}
          </button>
        );
      })}
    </div>
  );
}
