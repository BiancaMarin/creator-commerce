import * as React from "react";

/**
 * Primary action control. Fully-rounded, six variants, presses down on click.
 *
 * @startingPoint section="Actions" subtitle="Button variants & sizes" viewport="700x180"
 */
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style. @default "default" */
  variant?: "default" | "outline" | "secondary" | "ghost" | "destructive" | "link";
  /** Control size. `icon*` sizes are square. @default "md" */
  size?: "xs" | "sm" | "md" | "lg" | "icon" | "icon-sm" | "icon-lg";
}

export declare function Button(props: ButtonProps): JSX.Element;
