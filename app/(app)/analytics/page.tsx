import type { Metadata } from "next"
import { ChartLineIcon } from "@phosphor-icons/react/dist/ssr"

export const metadata: Metadata = {
  title: "Analytics · Creator Commerce",
  description: "Revenue, traffic, and conversion.",
}

export default function AnalyticsPage() {
  return (
    <div className="flex flex-1 flex-col gap-5 p-4 md:p-6">
      <div className="space-y-1">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Analytics
        </h1>
        <p className="text-sm text-muted-foreground">
          Understand revenue, traffic, and conversion.
        </p>
      </div>

      <div className="flex flex-1 items-center justify-center">
        <div className="flex max-w-xs flex-col items-center gap-3 text-center text-muted-foreground">
          <span className="flex size-14 items-center justify-center rounded-4xl bg-muted">
            <ChartLineIcon className="size-6" />
          </span>
          <p className="text-sm">
            The analytics view lives here — a template not yet built.
          </p>
        </div>
      </div>
    </div>
  )
}
