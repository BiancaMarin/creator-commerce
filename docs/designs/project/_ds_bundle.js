/* @ds-bundle: {"format":4,"namespace":"CreatorCommerceDesignSystem_8efbba","components":[{"name":"Button","sourcePath":"components/buttons/Button.jsx"},{"name":"Separator","sourcePath":"components/feedback/Separator.jsx"},{"name":"Skeleton","sourcePath":"components/feedback/Skeleton.jsx"},{"name":"Tooltip","sourcePath":"components/feedback/Tooltip.jsx"},{"name":"Input","sourcePath":"components/inputs/Input.jsx"},{"name":"Avatar","sourcePath":"components/surfaces/Avatar.jsx"},{"name":"Badge","sourcePath":"components/surfaces/Badge.jsx"},{"name":"Card","sourcePath":"components/surfaces/Card.jsx"},{"name":"CardHeader","sourcePath":"components/surfaces/Card.jsx"},{"name":"CardTitle","sourcePath":"components/surfaces/Card.jsx"},{"name":"CardDescription","sourcePath":"components/surfaces/Card.jsx"},{"name":"CardAction","sourcePath":"components/surfaces/Card.jsx"},{"name":"CardContent","sourcePath":"components/surfaces/Card.jsx"},{"name":"CardFooter","sourcePath":"components/surfaces/Card.jsx"}],"sourceHashes":{"components/buttons/Button.jsx":"be64088a422c","components/feedback/Separator.jsx":"afdf23b552cb","components/feedback/Skeleton.jsx":"12b92503ebbe","components/feedback/Tooltip.jsx":"664ab4965714","components/inputs/Input.jsx":"b75888e9f54c","components/surfaces/Avatar.jsx":"8b9c290dc672","components/surfaces/Badge.jsx":"0b7eb550b5b1","components/surfaces/Card.jsx":"1984c3ed4d13","ui_kits/seller-app/AppShell.jsx":"0f0cdbf25fe6","ui_kits/seller-app/screens.jsx":"df1fc030d0b9"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.CreatorCommerceDesignSystem_8efbba = window.CreatorCommerceDesignSystem_8efbba || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/buttons/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
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
function Button({
  variant = "default",
  size = "md",
  className = "",
  children,
  ...props
}) {
  inject();
  const cls = `cc-btn cc-btn--${variant} cc-btn--${size} ${className}`.trim();
  return /*#__PURE__*/React.createElement("button", _extends({
    className: cls
  }, props), children);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/buttons/Button.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Separator.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
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
function Separator({
  orientation = "horizontal",
  className = "",
  ...props
}) {
  inject();
  const dir = orientation === "vertical" ? "cc-sep--v" : "cc-sep--h";
  return /*#__PURE__*/React.createElement("div", _extends({
    role: "separator",
    className: `cc-sep ${dir} ${className}`.trim()
  }, props));
}
Object.assign(__ds_scope, { Separator });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Separator.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Skeleton.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
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
function Skeleton({
  className = "",
  style,
  ...props
}) {
  inject();
  return /*#__PURE__*/React.createElement("div", _extends({
    className: `cc-skeleton ${className}`.trim(),
    style: style
  }, props));
}
Object.assign(__ds_scope, { Skeleton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Skeleton.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Tooltip.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
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
function Tooltip({
  label,
  className = "",
  children,
  ...props
}) {
  inject();
  return /*#__PURE__*/React.createElement("span", _extends({
    className: `cc-tip ${className}`.trim()
  }, props), children, /*#__PURE__*/React.createElement("span", {
    role: "tooltip",
    className: "cc-tip__pop"
  }, label));
}
Object.assign(__ds_scope, { Tooltip });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Tooltip.jsx", error: String((e && e.message) || e) }); }

// components/inputs/Input.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
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
function Input({
  className = "",
  ...props
}) {
  inject();
  return /*#__PURE__*/React.createElement("input", _extends({
    className: `cc-input ${className}`.trim()
  }, props));
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/inputs/Input.jsx", error: String((e && e.message) || e) }); }

// components/surfaces/Avatar.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
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
  return name.split(" ").map(p => p[0]).slice(0, 2).join("").toUpperCase();
}

/** Round avatar — image when `src` given, otherwise muted circle with the name's initials. */
function Avatar({
  name = "",
  src,
  size = "md",
  className = "",
  ...props
}) {
  inject();
  return /*#__PURE__*/React.createElement("span", _extends({
    className: `cc-avatar cc-avatar--${size} ${className}`.trim()
  }, props), src ? /*#__PURE__*/React.createElement("img", {
    src: src,
    alt: name
  }) : initials(name));
}
Object.assign(__ds_scope, { Avatar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/surfaces/Avatar.jsx", error: String((e && e.message) || e) }); }

// components/surfaces/Badge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
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
function Badge({
  variant = "neutral",
  className = "",
  children,
  ...props
}) {
  inject();
  return /*#__PURE__*/React.createElement("span", _extends({
    className: `cc-badge cc-badge--${variant} ${className}`.trim()
  }, props), children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/surfaces/Badge.jsx", error: String((e && e.message) || e) }); }

// components/surfaces/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
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
function Card({
  size = "default",
  className = "",
  children,
  ...props
}) {
  inject();
  return /*#__PURE__*/React.createElement("div", _extends({
    className: `cc-card ${className}`.trim(),
    "data-size": size
  }, props), children);
}
function CardHeader({
  className = "",
  hasAction = false,
  children,
  ...props
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    className: `cc-card__header ${hasAction ? "cc-card__header--action" : ""} ${className}`.trim()
  }, props), children);
}
function CardTitle({
  className = "",
  children,
  ...props
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    className: `cc-card__title ${className}`.trim()
  }, props), children);
}
function CardDescription({
  className = "",
  children,
  ...props
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    className: `cc-card__desc ${className}`.trim()
  }, props), children);
}
function CardAction({
  className = "",
  children,
  ...props
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    className: `cc-card__action ${className}`.trim()
  }, props), children);
}
function CardContent({
  className = "",
  children,
  ...props
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    className: `cc-card__content ${className}`.trim()
  }, props), children);
}
function CardFooter({
  className = "",
  children,
  ...props
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    className: `cc-card__footer ${className}`.trim()
  }, props), children);
}
Object.assign(__ds_scope, { Card, CardHeader, CardTitle, CardDescription, CardAction, CardContent, CardFooter });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/surfaces/Card.jsx", error: String((e && e.message) || e) }); }

// ui_kits/seller-app/AppShell.jsx
try { (() => {
/* Seller app chrome: collapsible icon sidebar + top header. Mirrors app-sidebar.tsx + site-header.tsx. */
const S = window.CreatorCommerceDesignSystem_8efbba;
const {
  Tooltip,
  Separator,
  Button
} = S;
const NAV = [{
  key: "dashboard",
  title: "Dashboard",
  icon: "ph-house"
}, {
  key: "products",
  title: "Products",
  icon: "ph-package"
}, {
  key: "orders",
  title: "Orders",
  icon: "ph-receipt"
}, {
  key: "customers",
  title: "Customers",
  icon: "ph-users"
}, {
  key: "analytics",
  title: "Analytics",
  icon: "ph-chart-line"
}];
function Sidebar({
  active,
  onNav,
  collapsed
}) {
  const W = collapsed ? 60 : 248;
  return /*#__PURE__*/React.createElement("aside", {
    style: {
      width: W,
      flexShrink: 0,
      background: "var(--sidebar)",
      borderRight: "1px solid var(--sidebar-border)",
      display: "flex",
      flexDirection: "column",
      transition: "width .18s ease"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 10
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => onNav("dashboard"),
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      width: "100%",
      padding: 6,
      borderRadius: "var(--radius-2xl)",
      border: "none",
      background: "transparent",
      cursor: "pointer",
      color: "var(--sidebar-foreground)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "flex",
      flexShrink: 0,
      width: 32,
      height: 32,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "var(--radius-lg)",
      background: "var(--sidebar-primary)",
      color: "var(--sidebar-primary-foreground)"
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "19",
    height: "19",
    viewBox: "0 0 48 48",
    fill: "none"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M35 15 A13 13 0 1 0 35 33",
    stroke: "currentColor",
    strokeWidth: "4.4",
    strokeLinecap: "round"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M31 21 A6.5 6.5 0 1 0 31 27",
    stroke: "currentColor",
    strokeWidth: "4.4",
    strokeLinecap: "round"
  }))), !collapsed && /*#__PURE__*/React.createElement("span", {
    style: {
      textAlign: "left",
      lineHeight: 1.15
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "block",
      fontSize: 14,
      fontWeight: 500
    }
  }, "Creator Commerce"), /*#__PURE__*/React.createElement("span", {
    style: {
      display: "block",
      fontSize: 11,
      color: "color-mix(in oklch,var(--sidebar-foreground),transparent 30%)"
    }
  }, "Workspace")))), /*#__PURE__*/React.createElement("nav", {
    style: {
      flex: 1,
      padding: "4px 8px",
      display: "flex",
      flexDirection: "column",
      gap: 2
    }
  }, !collapsed && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      fontWeight: 500,
      color: "var(--muted-foreground)",
      padding: "8px 8px 4px"
    }
  }, "Platform"), NAV.map(it => {
    const on = active === it.key;
    const btn = /*#__PURE__*/React.createElement("button", {
      key: it.key,
      onClick: () => onNav(it.key),
      style: {
        display: "flex",
        alignItems: "center",
        gap: 10,
        width: "100%",
        height: 34,
        padding: collapsed ? 0 : "0 10px",
        justifyContent: collapsed ? "center" : "flex-start",
        borderRadius: "var(--radius-2xl)",
        border: "none",
        cursor: "pointer",
        fontFamily: "var(--font-sans)",
        fontSize: 14,
        fontWeight: on ? 500 : 400,
        background: on ? "var(--sidebar-accent)" : "transparent",
        color: on ? "var(--sidebar-accent-foreground)" : "var(--sidebar-foreground)"
      }
    }, /*#__PURE__*/React.createElement("i", {
      className: "ph " + it.icon,
      style: {
        fontSize: 17
      }
    }), !collapsed && /*#__PURE__*/React.createElement("span", null, it.title));
    return collapsed ? /*#__PURE__*/React.createElement(Tooltip, {
      key: it.key,
      label: it.title
    }, btn) : btn;
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "4px 8px 10px"
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => onNav("settings"),
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      width: "100%",
      height: 34,
      padding: collapsed ? 0 : "0 10px",
      justifyContent: collapsed ? "center" : "flex-start",
      borderRadius: "var(--radius-2xl)",
      border: "none",
      cursor: "pointer",
      fontFamily: "var(--font-sans)",
      fontSize: 14,
      background: active === "settings" ? "var(--sidebar-accent)" : "transparent",
      color: "var(--sidebar-foreground)"
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph ph-gear",
    style: {
      fontSize: 17
    }
  }), !collapsed && /*#__PURE__*/React.createElement("span", null, "Settings"))));
}
function Topbar({
  onToggle,
  title
}) {
  return /*#__PURE__*/React.createElement("header", {
    style: {
      position: "sticky",
      top: 0,
      zIndex: 30,
      display: "flex",
      height: 56,
      flexShrink: 0,
      alignItems: "center",
      gap: 8,
      borderBottom: "1px solid var(--border)",
      background: "color-mix(in oklch,var(--background),transparent 20%)",
      backdropFilter: "blur(8px)",
      padding: "0 16px"
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    size: "icon-sm",
    "aria-label": "Toggle sidebar",
    onClick: onToggle
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph ph-sidebar-simple"
  })), /*#__PURE__*/React.createElement(Separator, {
    orientation: "vertical",
    style: {
      height: 20,
      margin: "0 4px"
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      color: "var(--muted-foreground)"
    }
  }, "Creator Commerce"), /*#__PURE__*/React.createElement("i", {
    className: "ph ph-caret-right",
    style: {
      fontSize: 12,
      color: "var(--muted-foreground)"
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      fontWeight: 500,
      textTransform: "capitalize"
    }
  }, title), /*#__PURE__*/React.createElement("div", {
    style: {
      marginLeft: "auto",
      display: "flex",
      alignItems: "center",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    size: "sm"
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph ph-lifebuoy"
  }), "Support"), /*#__PURE__*/React.createElement("span", {
    style: {
      display: "flex",
      width: 32,
      height: 32,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "var(--radius-full)",
      background: "var(--muted)",
      color: "var(--muted-foreground)",
      fontSize: 12,
      fontWeight: 500
    }
  }, "AM")));
}
function AppShell({
  active,
  onNav,
  collapsed,
  onToggle,
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      height: "100%",
      background: "var(--background)",
      color: "var(--foreground)",
      fontFamily: "var(--font-sans)"
    }
  }, /*#__PURE__*/React.createElement(Sidebar, {
    active: active,
    onNav: onNav,
    collapsed: collapsed
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement(Topbar, {
    onToggle: onToggle,
    title: active
  }), /*#__PURE__*/React.createElement("main", {
    style: {
      flex: 1,
      overflow: "auto"
    }
  }, children)));
}
window.CCShell = {
  AppShell,
  NAV
};
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/seller-app/AppShell.jsx", error: String((e && e.message) || e) }); }

// ui_kits/seller-app/screens.jsx
try { (() => {
/* Seller screens — Dashboard, Products, Orders, Customers, Settings. Data mirrors the product. */
const S = window.CreatorCommerceDesignSystem_8efbba;
const {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
  CardFooter,
  Button,
  Badge,
  Avatar,
  Separator,
  Input
} = S;
const stats = [{
  label: "Revenue",
  value: "$48,120",
  delta: "+12.4%",
  up: true,
  icon: "ph-currency-dollar"
}, {
  label: "Orders",
  value: "1,204",
  delta: "+8.1%",
  up: true,
  icon: "ph-receipt"
}, {
  label: "New customers",
  value: "318",
  delta: "+4.7%",
  up: true,
  icon: "ph-users"
}, {
  label: "Conversion",
  value: "3.2%",
  delta: "-0.4%",
  up: false,
  icon: "ph-trend-up"
}];
const recentOrders = [{
  id: "#3812",
  customer: "Amara Okafor",
  product: "Studio Preset Pack",
  amount: "$48.00",
  status: "paid"
}, {
  id: "#3811",
  customer: "Leo Nakamura",
  product: "Lightroom Masterclass",
  amount: "$129.00",
  status: "paid"
}, {
  id: "#3810",
  customer: "Sofia Rossi",
  product: "Brand Kit Templates",
  amount: "$64.00",
  status: "refunded"
}, {
  id: "#3809",
  customer: "Daniel Weber",
  product: "Studio Preset Pack",
  amount: "$48.00",
  status: "pending"
}, {
  id: "#3808",
  customer: "Priya Menon",
  product: "1:1 Coaching Call",
  amount: "$220.00",
  status: "paid"
}];
const topProducts = [{
  name: "Studio Preset Pack",
  sales: 412,
  share: 82
}, {
  name: "Lightroom Masterclass",
  sales: 286,
  share: 57
}, {
  name: "Brand Kit Templates",
  sales: 173,
  share: 34
}, {
  name: "1:1 Coaching Call",
  sales: 64,
  share: 13
}];
const badgeFor = {
  paid: "success",
  pending: "warning",
  refunded: "neutral",
  failed: "destructive"
};
function PageHeader({
  title,
  subtitle,
  actions
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 16,
      marginBottom: 4
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "flex-end",
      justifyContent: "space-between",
      gap: 16,
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 4
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: 0,
      fontFamily: "var(--font-heading)",
      fontSize: "var(--text-2xl)",
      fontWeight: 600,
      letterSpacing: "-.02em"
    }
  }, title), subtitle && /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: 14,
      color: "var(--muted-foreground)"
    }
  }, subtitle)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8
    }
  }, actions)));
}
function DashboardScreen({
  onNav
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 24,
      padding: 24
    }
  }, /*#__PURE__*/React.createElement(PageHeader, {
    title: "Dashboard",
    subtitle: "Here's how your storefront is performing this month.",
    actions: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
      variant: "outline",
      size: "sm"
    }, /*#__PURE__*/React.createElement("i", {
      className: "ph ph-export"
    }), "Export"), /*#__PURE__*/React.createElement(Button, {
      size: "sm",
      onClick: () => onNav("products")
    }, /*#__PURE__*/React.createElement("i", {
      className: "ph ph-plus"
    }), "New product"))
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(4,1fr)",
      gap: 16
    }
  }, stats.map(s => /*#__PURE__*/React.createElement(Card, {
    key: s.label,
    size: "sm"
  }, /*#__PURE__*/React.createElement(CardHeader, {
    hasAction: true
  }, /*#__PURE__*/React.createElement(CardDescription, null, s.label), /*#__PURE__*/React.createElement(CardTitle, {
    style: {
      fontSize: "var(--text-2xl)"
    }
  }, s.value), /*#__PURE__*/React.createElement(CardAction, null, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "flex",
      width: 36,
      height: 36,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "var(--radius-2xl)",
      background: "var(--muted)",
      color: "var(--muted-foreground)"
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph " + s.icon
  })))), /*#__PURE__*/React.createElement(CardFooter, {
    style: {
      gap: 6,
      fontSize: 12,
      color: "var(--muted-foreground)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 4,
      fontWeight: 500,
      color: s.up ? "var(--success)" : "var(--destructive)"
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph " + (s.up ? "ph-trend-up" : "ph-trend-down"),
    style: {
      fontSize: 14
    }
  }), s.delta), "vs. last 30 days")))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "2fr 1fr",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement(CardHeader, {
    hasAction: true
  }, /*#__PURE__*/React.createElement(CardTitle, null, "Recent orders"), /*#__PURE__*/React.createElement(CardDescription, null, "Your latest 5 orders across the store."), /*#__PURE__*/React.createElement(CardAction, null, /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    size: "sm",
    onClick: () => onNav("orders")
  }, "View all", /*#__PURE__*/React.createElement("i", {
    className: "ph ph-arrow-up-right"
  })))), /*#__PURE__*/React.createElement(CardContent, {
    style: {
      display: "flex",
      flexDirection: "column"
    }
  }, recentOrders.map((o, i) => /*#__PURE__*/React.createElement("div", {
    key: o.id
  }, i > 0 && /*#__PURE__*/React.createElement(Separator, null), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: "12px 0"
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    name: o.customer
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0,
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: 14,
      fontWeight: 500,
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis"
    }
  }, o.customer), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: 12,
      color: "var(--muted-foreground)"
    }
  }, o.product, " \xB7 ", o.id)), /*#__PURE__*/React.createElement(Badge, {
    variant: badgeFor[o.status]
  }, o.status), /*#__PURE__*/React.createElement("span", {
    style: {
      width: 64,
      textAlign: "right",
      fontSize: 14,
      fontWeight: 500,
      fontFamily: "var(--font-mono)"
    }
  }, o.amount)))))), /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement(CardHeader, null, /*#__PURE__*/React.createElement(CardTitle, null, "Top products"), /*#__PURE__*/React.createElement(CardDescription, null, "Best sellers this month.")), /*#__PURE__*/React.createElement(CardContent, {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 16
    }
  }, topProducts.map(p => /*#__PURE__*/React.createElement("div", {
    key: p.name,
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 8,
      fontSize: 14
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "flex",
      minWidth: 0,
      alignItems: "center",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph ph-package",
    style: {
      color: "var(--muted-foreground)"
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 500,
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis"
    }
  }, p.name)), /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--muted-foreground)",
      fontFamily: "var(--font-mono)"
    }
  }, p.sales)), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 6,
      width: "100%",
      overflow: "hidden",
      borderRadius: "var(--radius-full)",
      background: "var(--muted)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: "100%",
      borderRadius: "var(--radius-full)",
      background: "var(--primary)",
      width: p.share + "%"
    }
  }))))), /*#__PURE__*/React.createElement(CardFooter, null, /*#__PURE__*/React.createElement(Button, {
    variant: "outline",
    style: {
      width: "100%"
    },
    onClick: () => onNav("analytics")
  }, "View analytics")))));
}

/* ---- Generic data table ---- */
function DataTable({
  columns,
  rows,
  renderCell
}) {
  return /*#__PURE__*/React.createElement(Card, {
    style: {
      padding: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("table", {
    style: {
      width: "100%",
      borderCollapse: "collapse",
      fontSize: 14
    }
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", {
    style: {
      borderBottom: "1px solid var(--border)"
    }
  }, columns.map(c => /*#__PURE__*/React.createElement("th", {
    key: c.key,
    style: {
      textAlign: c.align || "left",
      padding: "12px 20px",
      fontSize: 12,
      fontWeight: 500,
      color: "var(--muted-foreground)"
    }
  }, c.label)))), /*#__PURE__*/React.createElement("tbody", null, rows.map((r, i) => /*#__PURE__*/React.createElement("tr", {
    key: i,
    style: {
      borderBottom: i < rows.length - 1 ? "1px solid var(--border)" : "none"
    }
  }, columns.map(c => /*#__PURE__*/React.createElement("td", {
    key: c.key,
    style: {
      textAlign: c.align || "left",
      padding: "12px 20px",
      verticalAlign: "middle"
    }
  }, renderCell(r, c.key)))))))));
}
const products = [{
  name: "Studio Preset Pack",
  type: "Lightroom presets",
  price: "$48.00",
  sales: 412,
  status: "Published"
}, {
  name: "Lightroom Masterclass",
  type: "Video course",
  price: "$129.00",
  sales: 286,
  status: "Published"
}, {
  name: "Brand Kit Templates",
  type: "Design templates",
  price: "$64.00",
  sales: 173,
  status: "Published"
}, {
  name: "1:1 Coaching Call",
  type: "Service",
  price: "$220.00",
  sales: 64,
  status: "Published"
}, {
  name: "Motion Graphics Bundle",
  type: "After Effects",
  price: "$89.00",
  sales: 0,
  status: "Draft"
}];
function ProductsScreen() {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 20,
      padding: 24
    }
  }, /*#__PURE__*/React.createElement(PageHeader, {
    title: "Products",
    subtitle: "Manage your catalog of digital products.",
    actions: /*#__PURE__*/React.createElement(Button, {
      size: "sm"
    }, /*#__PURE__*/React.createElement("i", {
      className: "ph ph-plus"
    }), "New product")
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      maxWidth: 280,
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph ph-magnifying-glass",
    style: {
      position: "absolute",
      left: 12,
      top: "50%",
      transform: "translateY(-50%)",
      color: "var(--muted-foreground)",
      fontSize: 15
    }
  }), /*#__PURE__*/React.createElement(Input, {
    placeholder: "Search products",
    style: {
      paddingLeft: 34
    }
  })), /*#__PURE__*/React.createElement(Button, {
    variant: "outline",
    size: "sm"
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph ph-funnel"
  }), "Status")), /*#__PURE__*/React.createElement(DataTable, {
    columns: [{
      key: "name",
      label: "Product"
    }, {
      key: "type",
      label: "Type"
    }, {
      key: "price",
      label: "Price",
      align: "right"
    }, {
      key: "sales",
      label: "Sales",
      align: "right"
    }, {
      key: "status",
      label: "Status"
    }, {
      key: "act",
      label: "",
      align: "right"
    }],
    rows: products,
    renderCell: (r, k) => {
      if (k === "name") return /*#__PURE__*/React.createElement("div", {
        style: {
          display: "flex",
          alignItems: "center",
          gap: 10
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          display: "flex",
          width: 36,
          height: 36,
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "var(--radius-2xl)",
          background: "var(--muted)",
          color: "var(--muted-foreground)"
        }
      }, /*#__PURE__*/React.createElement("i", {
        className: "ph ph-package"
      })), /*#__PURE__*/React.createElement("span", {
        style: {
          fontWeight: 500
        }
      }, r.name));
      if (k === "type") return /*#__PURE__*/React.createElement("span", {
        style: {
          color: "var(--muted-foreground)"
        }
      }, r.type);
      if (k === "price") return /*#__PURE__*/React.createElement("span", {
        style: {
          fontFamily: "var(--font-mono)"
        }
      }, r.price);
      if (k === "sales") return /*#__PURE__*/React.createElement("span", {
        style: {
          fontFamily: "var(--font-mono)",
          color: "var(--muted-foreground)"
        }
      }, r.sales);
      if (k === "status") return /*#__PURE__*/React.createElement(Badge, {
        variant: r.status === "Published" ? "success" : "outline"
      }, r.status);
      return /*#__PURE__*/React.createElement(Button, {
        variant: "ghost",
        size: "icon-sm",
        "aria-label": "More"
      }, /*#__PURE__*/React.createElement("i", {
        className: "ph ph-dots-three"
      }));
    }
  }));
}
function OrdersScreen() {
  const rows = [...recentOrders, {
    id: "#3807",
    customer: "Marco Bianchi",
    product: "Brand Kit Templates",
    amount: "$64.00",
    status: "paid"
  }, {
    id: "#3806",
    customer: "Yuki Tanaka",
    product: "Lightroom Masterclass",
    amount: "$129.00",
    status: "failed"
  }];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 20,
      padding: 24
    }
  }, /*#__PURE__*/React.createElement(PageHeader, {
    title: "Orders",
    subtitle: "Track fulfillment and manage refunds.",
    actions: /*#__PURE__*/React.createElement(Button, {
      variant: "outline",
      size: "sm"
    }, /*#__PURE__*/React.createElement("i", {
      className: "ph ph-export"
    }), "Export")
  }), /*#__PURE__*/React.createElement(DataTable, {
    columns: [{
      key: "id",
      label: "Order"
    }, {
      key: "customer",
      label: "Customer"
    }, {
      key: "product",
      label: "Product"
    }, {
      key: "status",
      label: "Status"
    }, {
      key: "amount",
      label: "Amount",
      align: "right"
    }],
    rows: rows,
    renderCell: (r, k) => {
      if (k === "id") return /*#__PURE__*/React.createElement("span", {
        style: {
          fontFamily: "var(--font-mono)",
          fontWeight: 500
        }
      }, r.id);
      if (k === "customer") return /*#__PURE__*/React.createElement("div", {
        style: {
          display: "flex",
          alignItems: "center",
          gap: 8
        }
      }, /*#__PURE__*/React.createElement(Avatar, {
        name: r.customer,
        size: "sm"
      }), /*#__PURE__*/React.createElement("span", null, r.customer));
      if (k === "product") return /*#__PURE__*/React.createElement("span", {
        style: {
          color: "var(--muted-foreground)"
        }
      }, r.product);
      if (k === "status") return /*#__PURE__*/React.createElement(Badge, {
        variant: badgeFor[r.status]
      }, r.status);
      return /*#__PURE__*/React.createElement("span", {
        style: {
          fontFamily: "var(--font-mono)",
          fontWeight: 500
        }
      }, r.amount);
    }
  }));
}
const customers = [{
  name: "Amara Okafor",
  email: "amara@studio.co",
  orders: 8,
  spent: "$612.00"
}, {
  name: "Leo Nakamura",
  email: "leo.n@gmail.com",
  orders: 5,
  spent: "$438.00"
}, {
  name: "Priya Menon",
  email: "priya@lens.io",
  orders: 4,
  spent: "$396.00"
}, {
  name: "Sofia Rossi",
  email: "sofia.rossi@mail.com",
  orders: 3,
  spent: "$192.00"
}, {
  name: "Daniel Weber",
  email: "d.weber@web.de",
  orders: 2,
  spent: "$96.00"
}];
function CustomersScreen() {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 20,
      padding: 24
    }
  }, /*#__PURE__*/React.createElement(PageHeader, {
    title: "Customers",
    subtitle: "View profiles, segments, and lifetime value.",
    actions: /*#__PURE__*/React.createElement(Button, {
      variant: "outline",
      size: "sm"
    }, /*#__PURE__*/React.createElement("i", {
      className: "ph ph-export"
    }), "Export")
  }), /*#__PURE__*/React.createElement(DataTable, {
    columns: [{
      key: "name",
      label: "Customer"
    }, {
      key: "email",
      label: "Email"
    }, {
      key: "orders",
      label: "Orders",
      align: "right"
    }, {
      key: "spent",
      label: "Lifetime value",
      align: "right"
    }],
    rows: customers,
    renderCell: (r, k) => {
      if (k === "name") return /*#__PURE__*/React.createElement("div", {
        style: {
          display: "flex",
          alignItems: "center",
          gap: 10
        }
      }, /*#__PURE__*/React.createElement(Avatar, {
        name: r.name
      }), /*#__PURE__*/React.createElement("span", {
        style: {
          fontWeight: 500
        }
      }, r.name));
      if (k === "email") return /*#__PURE__*/React.createElement("span", {
        style: {
          color: "var(--muted-foreground)"
        }
      }, r.email);
      if (k === "orders") return /*#__PURE__*/React.createElement("span", {
        style: {
          fontFamily: "var(--font-mono)",
          color: "var(--muted-foreground)"
        }
      }, r.orders);
      return /*#__PURE__*/React.createElement("span", {
        style: {
          fontFamily: "var(--font-mono)",
          fontWeight: 500
        }
      }, r.spent);
    }
  }));
}
function PlaceholderScreen({
  title,
  icon
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 20,
      padding: 24,
      height: "100%"
    }
  }, /*#__PURE__*/React.createElement(PageHeader, {
    title: title
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 12,
      color: "var(--muted-foreground)",
      textAlign: "center"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "flex",
      width: 56,
      height: 56,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "var(--radius-4xl)",
      background: "var(--muted)"
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph " + icon,
    style: {
      fontSize: 26
    }
  })), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      maxWidth: 300
    }
  }, "The ", title.toLowerCase(), " view lives here \u2014 a template not yet built in this kit."))));
}
window.CCScreens = {
  DashboardScreen,
  ProductsScreen,
  OrdersScreen,
  CustomersScreen,
  PlaceholderScreen
};
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/seller-app/screens.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Separator = __ds_scope.Separator;

__ds_ns.Skeleton = __ds_scope.Skeleton;

__ds_ns.Tooltip = __ds_scope.Tooltip;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.Avatar = __ds_scope.Avatar;

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.CardHeader = __ds_scope.CardHeader;

__ds_ns.CardTitle = __ds_scope.CardTitle;

__ds_ns.CardDescription = __ds_scope.CardDescription;

__ds_ns.CardAction = __ds_scope.CardAction;

__ds_ns.CardContent = __ds_scope.CardContent;

__ds_ns.CardFooter = __ds_scope.CardFooter;

})();
