import * as React from "react";

/** Thin divider line between content. */
export interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  /** @default "horizontal" */
  orientation?: "horizontal" | "vertical";
}

export declare function Separator(props: SeparatorProps): JSX.Element;
