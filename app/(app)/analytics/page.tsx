import type { Metadata } from "next"
import {
  ChartLineIcon,
  CreditCardIcon,
  EyeIcon,
} from "@phosphor-icons/react/dist/ssr"

import { KpiCard } from "@/components/dashboard/kpi-card"
import { INTL_LOCALE } from "@/lib/i18n"
import { requireUser } from "@/lib/server/dal/session"
import { getLocale, getStrings, pageMetadata } from "@/lib/server/i18n"
import { getStoreTraffic, TRAFFIC_EVENTS } from "@/lib/server/posthog-query"
import { toneAt } from "@/lib/tones"

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("analytics")
}

const DAYS = 30

const EVENT_ICONS = {
  product_viewed: EyeIcon,
  checkout_started: CreditCardIcon,
} as const

export default async function AnalyticsPage() {
  const [strings, locale, user] = await Promise.all([
    getStrings(),
    getLocale(),
    requireUser(),
  ])
  const copy = strings.analytics
  // `handle` is always set (the signup hook fills it) but typed optional —
  // see the Authentication notes in CLAUDE.md.
  const traffic = await getStoreTraffic(user.handle ?? "", DAYS)
  const number = new Intl.NumberFormat(INTL_LOCALE[locale])
  const period = copy.period.replace("{days}", String(DAYS))

  return (
    <div className="flex flex-1 flex-col gap-5 p-4 md:p-6">
      <div className="space-y-1">
        <h1 className="text-brand-gradient font-heading text-2xl font-semibold tracking-tight">
          {copy.title}
        </h1>
        <p className="text-sm text-muted-foreground">{copy.subtitle}</p>
      </div>

      {traffic.status === "ok" ? (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {TRAFFIC_EVENTS.map((event, index) => (
              <KpiCard
                key={event}
                label={copy.events[event]}
                value={number.format(traffic.counts[event].total)}
                total={copy.visitors.replace(
                  "{count}",
                  number.format(traffic.counts[event].visitors),
                )}
                delta={null}
                hint={period}
                icon={EVENT_ICONS[event]}
                tone={toneAt(index)}
              />
            ))}
          </div>
          <p className="text-xs text-muted-foreground">{copy.note}</p>
        </>
      ) : (
        <div className="flex flex-1 items-center justify-center">
          <div className="flex max-w-xs flex-col items-center gap-3 text-center text-muted-foreground">
            <span className="flex size-14 items-center justify-center rounded-4xl bg-brand-indigo/15 text-brand-indigo">
              <ChartLineIcon className="size-6" />
            </span>
            <p className="text-sm">
              {traffic.status === "unconfigured" ? copy.unconfigured : copy.error}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
