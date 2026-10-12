import {
  CoinsIcon,
  ReceiptIcon,
  TrendUpIcon,
  UsersIcon,
} from "@phosphor-icons/react/dist/ssr"

import { cn } from "@/lib/utils"
import { getStrings } from "@/lib/server/i18n"

const bars = [82, 57, 34, 64, 46]
// One accent per bar, so the mini chart previews the page's palette.
const barTones = [
  "bg-primary",
  "bg-brand-sky",
  "bg-brand-mint",
  "bg-brand-indigo",
  "bg-brand-violet",
]

/** Stylized product preview — a mini dashboard, not a screenshot. */
export async function AppPreview() {
  const strings = await getStrings()
  const stats = strings.marketing.hero.previewStats
  const previewStats = [
    { label: stats.revenue, value: "48.120 RON", icon: CoinsIcon, tone: "text-primary" },
    { label: stats.orders, value: "1.204", icon: ReceiptIcon, tone: "text-brand-indigo" },
    { label: stats.customers, value: "318", icon: UsersIcon, tone: "text-brand-violet" },
  ]

  return (
    <div className="overflow-hidden rounded-4xl bg-card shadow-lg ring-1 ring-foreground/5">
      <div className="flex items-center gap-1.5 border-b px-4 py-3">
        <span className="size-2.5 rounded-full bg-border" />
        <span className="size-2.5 rounded-full bg-border" />
        <span className="size-2.5 rounded-full bg-border" />
        <span className="ml-2.5 text-xs text-muted-foreground">
          {strings.marketing.hero.previewLabel}
        </span>
      </div>
      <div className="flex flex-col gap-4 p-4">
        <div className="grid grid-cols-3 gap-3">
          {previewStats.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col gap-1.5 rounded-2xl bg-background p-3.5 ring-1 ring-foreground/5"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground">
                  {stat.label}
                </span>
                <stat.icon className={cn("size-3.5", stat.tone)} />
              </div>
              <span className="font-mono text-xl font-semibold">
                {stat.value}
              </span>
              <span className="flex items-center gap-1 text-[11px] text-success">
                <TrendUpIcon className="size-3" />
                +12%
              </span>
            </div>
          ))}
        </div>
        <div className="rounded-2xl bg-background p-4 ring-1 ring-foreground/5">
          <div className="mb-3 text-xs text-muted-foreground">
            {strings.marketing.hero.previewChart}
          </div>
          <div className="flex h-[90px] items-end gap-2.5">
            {bars.map((height, index) => (
              <div
                key={index}
                className={cn(
                  "flex-1 rounded-t-md",
                  barTones[index % barTones.length]
                )}
                style={{ height: `${height}%` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
