import React from "react";

const CSS = `
.cc-tip{position:relative;display:inline-flex}
.cc-tip__pop{position:absolute;bottom:calc(100% + .4rem);left:50%;transform:translateX(-50%) scale(.96);transform-origin:bottom center;background:var(--foreground);color:var(--background);font-family:var(--font-sans);font-size:var(--text-xs);font-weight:500;line-height:1.2;padding:.3rem .5rem;border-radius:var(--radius-md);white-space:nowrap;pointer-events:none;opacity:0;transition:opacity .12s ease,transform .12s ease;z-index:50}
.cc-tip:hover .cc-tip__pop,.cc-tip:focus-within .cc-tip__pop{opacity:1;transform:translateX(-50%) scale(1)}
`;

function inject() {
  if (typeof document === "undefined") return;
  if (document.getElementById("cc-tip-css")) return;
  const s = document.createElement("style");
  s.id = "cc-tip-css";
  s.textContent = CSS;
  document.head.appendChild(s);
}

/** Tooltip — wraps a trigger; shows `label` above it on hover/focus. Dark pill, small radius. */
export function Tooltip({ label, className = "", children, ...props }) {
  inject();
  return (
    <span className={`cc-tip ${className}`.trim()} {...props}>
      {children}
      <span role="tooltip" className="cc-tip__pop">{label}</span>
    </span>
  );
}
