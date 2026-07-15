import React from "react";

const CSS = `
.cc-badge{display:inline-flex;align-items:center;gap:.25rem;border-radius:var(--radius-full);padding:.125rem .5rem;font-family:var(--font-sans);font-size:var(--text-xs);font-weight:500;line-height:1.4;text-transform:capitalize;white-space:nowrap}
.cc-badge--neutral{background:var(--muted);color:var(--muted-foreground)}
.cc-badge--success{background:color-mix(in oklch,var(--success),transparent 90%);color:var(--success)}
.cc-badge--warning{background:color-mix(in oklch,var(--warning),transparent 88%);color:var(--warning)}
.cc-badge--destructive{background:color-mix(in oklch,var(--destructive),transparent 90%);color:var(--destructive)}
.cc-badge--primary{background:color-mix(in oklch,var(--primary),transparent 88%);color:var(--primary)}
.cc-badge--outline{background:transparent;border:1px solid var(--border);color:var(--foreground)}
`;

function inject() {
  if (typeof document === "undefined") return;
  if (document.getElementById("cc-badge-css")) return;
  const s = document.createElement("style");
  s.id = "cc-badge-css";
  s.textContent = CSS;
  document.head.appendChild(s);
}

/** Status pill — used for order status (paid/pending/refunded), product Draft/Published, etc. */
export function Badge({ variant = "neutral", className = "", children, ...props }) {
  inject();
  return (
    <span className={`cc-badge cc-badge--${variant} ${className}`.trim()} {...props}>
      {children}
    </span>
  );
}
