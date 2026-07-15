import React from "react";

const CSS = `
.cc-btn{--_bg:var(--primary);--_fg:var(--primary-foreground);display:inline-flex;flex-shrink:0;align-items:center;justify-content:center;gap:.375rem;border-radius:var(--radius-4xl);border:1px solid transparent;background-clip:padding-box;font-family:var(--font-sans);font-size:var(--text-sm);font-weight:500;white-space:nowrap;cursor:pointer;transition:all .15s ease;outline:none;user-select:none}
.cc-btn:focus-visible{border-color:var(--ring);box-shadow:0 0 0 3px color-mix(in oklch,var(--ring),transparent 70%)}
.cc-btn:active:not([aria-haspopup]){transform:translateY(1px)}
.cc-btn:disabled{pointer-events:none;opacity:.5}
.cc-btn svg{pointer-events:none;flex-shrink:0}
.cc-btn--default{background:var(--primary);color:var(--primary-foreground)}
.cc-btn--default:hover{background:color-mix(in oklch,var(--primary),transparent 20%)}
.cc-btn--outline{border-color:var(--border);background:var(--background);color:var(--foreground)}
.cc-btn--outline:hover{background:var(--muted)}
.cc-btn--secondary{background:var(--secondary);color:var(--secondary-foreground)}
.cc-btn--secondary:hover{background:color-mix(in oklch,var(--secondary),var(--foreground) 5%)}
.cc-btn--ghost{background:transparent;color:var(--foreground)}
.cc-btn--ghost:hover{background:var(--muted)}
.cc-btn--destructive{background:color-mix(in oklch,var(--destructive),transparent 90%);color:var(--destructive)}
.cc-btn--destructive:hover{background:color-mix(in oklch,var(--destructive),transparent 80%)}
.cc-btn--link{background:transparent;color:var(--primary);text-underline-offset:4px}
.cc-btn--link:hover{text-decoration:underline}
.cc-btn--xs{height:1.5rem;gap:.25rem;padding:0 .625rem;font-size:var(--text-xs)}
.cc-btn--sm{height:2rem;gap:.25rem;padding:0 .75rem}
.cc-btn--md{height:2.25rem;padding:0 .75rem}
.cc-btn--lg{height:2.5rem;padding:0 1rem}
.cc-btn--icon{height:2.25rem;width:2.25rem;padding:0}
.cc-btn--icon-sm{height:2rem;width:2rem;padding:0}
.cc-btn--icon-lg{height:2.5rem;width:2.5rem;padding:0}
`;

function inject() {
  if (typeof document === "undefined") return;
  if (document.getElementById("cc-btn-css")) return;
  const s = document.createElement("style");
  s.id = "cc-btn-css";
  s.textContent = CSS;
  document.head.appendChild(s);
}

/**
 * Creator Commerce Button — Base UI / shadcn "base-luma" style: fully-rounded (radius-4xl),
 * font-medium, 6 variants, presses down 1px on click.
 */
export function Button({
  variant = "default",
  size = "md",
  className = "",
  children,
  ...props
}) {
  inject();
  const cls = `cc-btn cc-btn--${variant} cc-btn--${size} ${className}`.trim();
  return (
    <button className={cls} {...props}>
      {children}
    </button>
  );
}
