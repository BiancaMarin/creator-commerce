import * as React from "react";

/**
 * Hover/focus tooltip. Wrap the trigger element; the label appears in a dark pill above it.
 * Used on collapsed sidebar icons and icon-only buttons.
 */
export interface TooltipProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Text shown in the tooltip bubble. */
  label: React.ReactNode;
  /** The trigger element(s). */
  children?: React.ReactNode;
}

export declare function Tooltip(props: TooltipProps): JSX.Element;
