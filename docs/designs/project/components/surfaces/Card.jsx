import React from "react";

const CSS = `
.cc-card{--cc-card-pad:1.5rem;display:flex;flex-direction:column;gap:var(--cc-card-pad);overflow:hidden;border-radius:var(--radius-4xl);background:var(--card);color:var(--card-foreground);font-family:var(--font-sans);font-size:var(--text-sm);padding-top:var(--cc-card-pad);padding-bottom:var(--cc-card-pad);box-shadow:var(--shadow-md),0 0 0 1px color-mix(in oklch,var(--foreground),transparent 95%)}
.cc-card[data-size="sm"]{--cc-card-pad:1rem}
.cc-card__header{display:grid;grid-auto-rows:min-content;align-items:start;gap:.375rem;padding:0 var(--cc-card-pad)}
.cc-card__header--action{grid-template-columns:1fr auto}
.cc-card__title{font-family:var(--font-heading);font-size:var(--text-base);font-weight:500;letter-spacing:var(--tracking-tight)}
.cc-card__desc{font-size:var(--text-sm);color:var(--muted-foreground)}
.cc-card__action{grid-column-start:2;grid-row:1 / span 2;align-self:start;justify-self:end}
.cc-card__content{padding:0 var(--cc-card-pad)}
.cc-card__footer{display:flex;align-items:center;padding:0 var(--cc-card-pad)}
`;

function inject() {
  if (typeof document === "undefined") return;
  if (document.getElementById("cc-card-css")) return;
  const s = document.createElement("style");
  s.id = "cc-card-css";
  s.textContent = CSS;
  document.head.appendChild(s);
}

/** Card surface — the base container across every screen. Large radius, soft shadow + hairline ring. */
export function Card({ size = "default", className = "", children, ...props }) {
  inject();
  return (
    <div className={`cc-card ${className}`.trim()} data-size={size} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ className = "", hasAction = false, children, ...props }) {
  return (
    <div className={`cc-card__header ${hasAction ? "cc-card__header--action" : ""} ${className}`.trim()} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className = "", children, ...props }) {
  return <div className={`cc-card__title ${className}`.trim()} {...props}>{children}</div>;
}

export function CardDescription({ className = "", children, ...props }) {
  return <div className={`cc-card__desc ${className}`.trim()} {...props}>{children}</div>;
}

export function CardAction({ className = "", children, ...props }) {
  return <div className={`cc-card__action ${className}`.trim()} {...props}>{children}</div>;
}

export function CardContent({ className = "", children, ...props }) {
  return <div className={`cc-card__content ${className}`.trim()} {...props}>{children}</div>;
}

export function CardFooter({ className = "", children, ...props }) {
  return <div className={`cc-card__footer ${className}`.trim()} {...props}>{children}</div>;
}
