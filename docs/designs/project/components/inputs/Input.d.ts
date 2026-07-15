import * as React from "react";

/**
 * Single-line text field. Soft translucent fill, large radius, shows a destructive ring
 * when `aria-invalid` is set (wire this to your validation state).
 *
 * @startingPoint section="Forms" subtitle="Text input field" viewport="700x120"
 */
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export declare function Input(props: InputProps): JSX.Element;
