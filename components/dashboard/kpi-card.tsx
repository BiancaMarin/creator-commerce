import type { ComponentType } from "react";
import { TrendDownIcon, TrendUpIcon } from "@phosphor-icons/react/dist/ssr";

import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Tone } from "@/lib/tones";
import { cn } from "@/lib/utils";

/**
 * Percent change between two windows, or null when there's nothing to compare
 * against.
 *
 * A previous window of zero has no percentage — "up ∞%" from the first sale is
 * noise, not information — so the card omits the delta rather than inventing
 * one. That's also the normal state for a new creator.
 */
export function deltaOf(current: number, previous: number): number | null {
  if (previous === 0) {
    return null;
  }

  return ((current - previous) / previous) * 100;
}

export function formatDelta(delta: number) {
  return `${delta >= 0 ? "+" : ""}${delta.toFixed(1)}%`;
}

type KpiCardProps = {
  label: string;
  /** Already formatted for display — the card doesn't know about money. */
  value: string;
  /** Percent change from `deltaOf`; null hides the trend entirely. */
  delta: number | null;
  /** The period the figure covers, e.g. "vs. previous 30 days". */
  hint: string;
  /**
   * Optional line under the figure, e.g. the all-time total — so a window
   * with no activity doesn't make the account look empty.
   */
  total?: string;
  icon: ComponentType<{ className?: string }>;
  /** Colours the card from lib/tones. Plain and muted when omitted. */
  tone?: Tone;
};

/** One dashboard tile: a headline figure and its trend over the period. */
export function KpiCard({
  label,
  value,
  delta,
  hint,
  total,
  icon: Icon,
  tone,
}: KpiCardProps) {
  const TrendIcon = delta !== null && delta < 0 ? TrendDownIcon : TrendUpIcon;

  return (
    <Card size="sm" className={tone?.wash}>
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle className={cn("text-2xl", tone?.text)}>{value}</CardTitle>
        {total && (
          <p className="text-xs text-muted-foreground">{total}</p>
        )}
        <CardAction>
          <span
            className={cn(
              "flex size-9 items-center justify-center rounded-2xl shadow-sm",
              tone ? [tone.solid, "text-white"] : "bg-muted text-muted-foreground",
            )}
          >
            <Icon className="size-4" />
          </span>
        </CardAction>
      </CardHeader>
      <CardFooter className="gap-1.5 text-xs text-muted-foreground">
        {/* No delta when the previous window was empty — see `deltaOf`. The
            hint still explains the period. */}
        {delta !== null && (
          <span
            data-trend={delta >= 0 ? "up" : "down"}
            className={cn(
              "inline-flex items-center gap-1 font-medium",
              delta >= 0 ? "text-success" : "text-destructive",
            )}
          >
            <TrendIcon className="size-3.5" />
            {formatDelta(delta)}
          </span>
        )}
        {hint}
      </CardFooter>
    </Card>
  );
}
