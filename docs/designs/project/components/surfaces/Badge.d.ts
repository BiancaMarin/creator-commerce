import * as React from "react";

/**
 * Small status pill. Semantic color maps to state: success = paid/published,
 * warning = pending, destructive = failed, neutral = refunded/draft.
 */
export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** @default "neutral" */
  variant?: "neutral" | "success" | "warning" | "destructive" | "primary" | "outline";
}

export declare function Badge(props: BadgeProps): JSX.Element;
