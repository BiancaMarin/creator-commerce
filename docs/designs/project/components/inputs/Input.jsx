import React from "react";

const CSS = `
.cc-input{height:2.25rem;width:100%;min-width:0;border-radius:var(--radius-3xl);border:1px solid transparent;background:color-mix(in oklch,var(--input),transparent 50%);padding:.25rem .75rem;font-family:var(--font-sans);font-size:var(--text-sm);color:var(--foreground);transition:color .15s,box-shadow .15s,background-color .15s;outline:none}
.cc-input::placeholder{color:var(--muted-foreground)}
.cc-input:focus-visible{border-color:var(--ring);box-shadow:0 0 0 3px color-mix(in oklch,var(--ring),transparent 70%)}
.cc-input:disabled{pointer-events:none;cursor:not-allowed;opacity:.5}
.cc-input[aria-invalid="true"]{border-color:var(--destructive);box-shadow:0 0 0 3px color-mix(in oklch,var(--destructive),transparent 80%)}
`;

function inject() {
  if (typeof document === "undefined") return;
  if (document.getElementById("cc-input-css")) return;
  const s = document.createElement("style");
  s.id = "cc-input-css";
  s.textContent = CSS;
  document.head.appendChild(s);
}

/** Creator Commerce text input — soft-filled (input/50), radius-3xl, destructive ring on aria-invalid. */
export function Input({ className = "", ...props }) {
  inject();
  return <input className={`cc-input ${className}`.trim()} {...props} />;
}
