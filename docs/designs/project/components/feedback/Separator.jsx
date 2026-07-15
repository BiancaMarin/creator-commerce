import React from "react";

const CSS = `
.cc-sep{flex-shrink:0;background:var(--border);border:none}
.cc-sep--h{height:1px;width:100%;margin:0}
.cc-sep--v{width:1px;align-self:stretch;height:auto}
`;

function inject() {
  if (typeof document === "undefined") return;
  if (document.getElementById("cc-sep-css")) return;
  const s = document.createElement("style");
  s.id = "cc-sep-css";
  s.textContent = CSS;
  document.head.appendChild(s);
}

/** Hairline divider — horizontal by default; used between list rows and in card footers/headers. */
export function Separator({ orientation = "horizontal", className = "", ...props }) {
  inject();
  const dir = orientation === "vertical" ? "cc-sep--v" : "cc-sep--h";
  return <div role="separator" className={`cc-sep ${dir} ${className}`.trim()} {...props} />;
}
