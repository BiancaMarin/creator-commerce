import type { Metadata } from "next"
import { ChartLineIcon } from "@phosphor-icons/react/dist/ssr"
import { getStrings, pageMetadata } from "@/lib/server/i18n"

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("analytics")
}

export default async function AnalyticsPage() {
  const strings = await getStrings()

  return (
    <div className="flex flex-1 flex-col gap-5 p-4 md:p-6">
      <div className="space-y-1">
        <h1 className="text-brand-gradient font-heading text-2xl font-semibold tracking-tight">
          {strings.analytics.title}
        </h1>
        <p className="text-sm text-muted-foreground">
          {strings.analytics.subtitle}
        </p>
      </div>

      <div className="flex flex-1 items-center justify-center">
        <div className="flex max-w-xs flex-col items-center gap-3 text-center text-muted-foreground">
          <span className="flex size-14 items-center justify-center rounded-4xl bg-brand-indigo/15 text-brand-indigo">
            <ChartLineIcon className="size-6" />
          </span>
          <p className="text-sm">
            {strings.analytics.placeholder}
          </p>
        </div>
      </div>
    </div>
  )
}
