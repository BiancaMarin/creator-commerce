import React from "react";

const CSS = `
@keyframes cc-pulse{0%,100%{opacity:1}50%{opacity:.5}}
.cc-skeleton{border-radius:var(--radius-2xl);background:var(--muted);animation:cc-pulse 2s cubic-bezier(.4,0,.6,1) infinite}
`;

function inject() {
  if (typeof document === "undefined") return;
  if (document.getElementById("cc-skeleton-css")) return;
  const s = document.createElement("style");
  s.id = "cc-skeleton-css";
  s.textContent = CSS;
  document.head.appendChild(s);
}

/** Loading placeholder — pulsing muted block. Give it width/height via style or className. */
export function Skeleton({ className = "", style, ...props }) {
  inject();
  return <div className={`cc-skeleton ${className}`.trim()} style={style} {...props} />;
}
