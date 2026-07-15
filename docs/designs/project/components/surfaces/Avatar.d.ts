import * as React from "react";

/**
 * Round avatar. Falls back to two-letter initials on a muted circle when no image `src`.
 * Used in order/customer rows and the account menu.
 */
export interface AvatarProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Full name — drives the initials fallback and image alt text. */
  name?: string;
  /** Image URL; when omitted, initials render instead. */
  src?: string;
  /** @default "md" */
  size?: "sm" | "md" | "lg";
}

export declare function Avatar(props: AvatarProps): JSX.Element;
