import React from "react";

const CSS = `
.cc-avatar{display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;border-radius:var(--radius-full);background:var(--muted);color:var(--muted-foreground);font-family:var(--font-sans);font-weight:500;overflow:hidden}
.cc-avatar img{width:100%;height:100%;object-fit:cover}
.cc-avatar--sm{width:2rem;height:2rem;font-size:var(--text-xs)}
.cc-avatar--md{width:2.25rem;height:2.25rem;font-size:var(--text-xs)}
.cc-avatar--lg{width:2.5rem;height:2.5rem;font-size:var(--text-sm)}
`;

function inject() {
  if (typeof document === "undefined") return;
  if (document.getElementById("cc-avatar-css")) return;
  const s = document.createElement("style");
  s.id = "cc-avatar-css";
  s.textContent = CSS;
  document.head.appendChild(s);
}

function initials(name = "") {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

/** Round avatar — image when `src` given, otherwise muted circle with the name's initials. */
export function Avatar({ name = "", src, size = "md", className = "", ...props }) {
  inject();
  return (
    <span className={`cc-avatar cc-avatar--${size} ${className}`.trim()} {...props}>
      {src ? <img src={src} alt={name} /> : initials(name)}
    </span>
  );
}
