import * as React from "react";

/**
 * The base surface for every screen — KPI tiles, panels, auth cards, list containers.
 * Composed from header / title / description / action / content / footer sub-parts.
 *
 * @startingPoint section="Surfaces" subtitle="Card surface & sub-parts" viewport="700x260"
 */
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** `sm` tightens internal padding (used by dense KPI tiles). @default "default" */
  size?: "default" | "sm";
}

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Reserve a right-aligned action column (renders CardAction top-right). */
  hasAction?: boolean;
}

export declare function Card(props: CardProps): JSX.Element;
export declare function CardHeader(props: CardHeaderProps): JSX.Element;
export declare function CardTitle(props: React.HTMLAttributes<HTMLDivElement>): JSX.Element;
export declare function CardDescription(props: React.HTMLAttributes<HTMLDivElement>): JSX.Element;
export declare function CardAction(props: React.HTMLAttributes<HTMLDivElement>): JSX.Element;
export declare function CardContent(props: React.HTMLAttributes<HTMLDivElement>): JSX.Element;
export declare function CardFooter(props: React.HTMLAttributes<HTMLDivElement>): JSX.Element;
