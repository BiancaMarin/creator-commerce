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
  icon: ComponentType<{ className?: string }>;
  /** Classes for the icon tile — a tone from lib/tones. Muted when omitted. */
  iconClassName?: string;
};

/** One dashboard tile: a headline figure and its trend over the period. */
export function KpiCard({
  label,
  value,
  delta,
  hint,
  icon: Icon,
  iconClassName = "bg-muted text-muted-foreground",
}: KpiCardProps) {
  const TrendIcon = delta !== null && delta < 0 ? TrendDownIcon : TrendUpIcon;

  return (
    <Card size="sm">
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-2xl">{value}</CardTitle>
        <CardAction>
          <span
            className={cn(
              "flex size-9 items-center justify-center rounded-2xl",
              iconClassName,
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
