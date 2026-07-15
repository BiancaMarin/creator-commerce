/* Seller app chrome: collapsible icon sidebar + top header. Mirrors app-sidebar.tsx + site-header.tsx. */
const S = window.CreatorCommerceDesignSystem_8efbba;
const { Tooltip, Separator, Button } = S;

const NAV = [
  { key: "dashboard", title: "Dashboard", icon: "ph-house" },
  { key: "products", title: "Products", icon: "ph-package" },
  { key: "orders", title: "Orders", icon: "ph-receipt" },
  { key: "customers", title: "Customers", icon: "ph-users" },
  { key: "analytics", title: "Analytics", icon: "ph-chart-line" },
];

function Sidebar({ active, onNav, collapsed }) {
  const W = collapsed ? 60 : 248;
  return (
    <aside style={{ width: W, flexShrink: 0, background: "var(--sidebar)", borderRight: "1px solid var(--sidebar-border)", display: "flex", flexDirection: "column", transition: "width .18s ease" }}>
      <div style={{ padding: 10 }}>
        <button onClick={() => onNav("dashboard")} style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: 6, borderRadius: "var(--radius-2xl)", border: "none", background: "transparent", cursor: "pointer", color: "var(--sidebar-foreground)" }}>
          <span style={{ display: "flex", flexShrink: 0, width: 32, height: 32, alignItems: "center", justifyContent: "center", borderRadius: "var(--radius-lg)", background: "var(--sidebar-primary)", color: "var(--sidebar-primary-foreground)" }}><svg width="19" height="19" viewBox="0 0 48 48" fill="none"><path d="M35 15 A13 13 0 1 0 35 33" stroke="currentColor" strokeWidth="4.4" strokeLinecap="round"/><path d="M31 21 A6.5 6.5 0 1 0 31 27" stroke="currentColor" strokeWidth="4.4" strokeLinecap="round"/></svg></span>
          {!collapsed && <span style={{ textAlign: "left", lineHeight: 1.15 }}><span style={{ display: "block", fontSize: 14, fontWeight: 500 }}>Creator Commerce</span><span style={{ display: "block", fontSize: 11, color: "color-mix(in oklch,var(--sidebar-foreground),transparent 30%)" }}>Workspace</span></span>}
        </button>
      </div>
      <nav style={{ flex: 1, padding: "4px 8px", display: "flex", flexDirection: "column", gap: 2 }}>
        {!collapsed && <div style={{ fontSize: 11, fontWeight: 500, color: "var(--muted-foreground)", padding: "8px 8px 4px" }}>Platform</div>}
        {NAV.map((it) => {
          const on = active === it.key;
          const btn = (
            <button key={it.key} onClick={() => onNav(it.key)} style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", height: 34, padding: collapsed ? 0 : "0 10px", justifyContent: collapsed ? "center" : "flex-start", borderRadius: "var(--radius-2xl)", border: "none", cursor: "pointer", fontFamily: "var(--font-sans)", fontSize: 14, fontWeight: on ? 500 : 400, background: on ? "var(--sidebar-accent)" : "transparent", color: on ? "var(--sidebar-accent-foreground)" : "var(--sidebar-foreground)" }}>
              <i className={"ph " + it.icon} style={{ fontSize: 17 }}></i>{!collapsed && <span>{it.title}</span>}
            </button>
          );
          return collapsed ? <Tooltip key={it.key} label={it.title}>{btn}</Tooltip> : btn;
        })}
      </nav>
      <div style={{ padding: "4px 8px 10px" }}>
        <button onClick={() => onNav("settings")} style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", height: 34, padding: collapsed ? 0 : "0 10px", justifyContent: collapsed ? "center" : "flex-start", borderRadius: "var(--radius-2xl)", border: "none", cursor: "pointer", fontFamily: "var(--font-sans)", fontSize: 14, background: active === "settings" ? "var(--sidebar-accent)" : "transparent", color: "var(--sidebar-foreground)" }}>
          <i className="ph ph-gear" style={{ fontSize: 17 }}></i>{!collapsed && <span>Settings</span>}
        </button>
      </div>
    </aside>
  );
}

function Topbar({ onToggle, title }) {
  return (
    <header style={{ position: "sticky", top: 0, zIndex: 30, display: "flex", height: 56, flexShrink: 0, alignItems: "center", gap: 8, borderBottom: "1px solid var(--border)", background: "color-mix(in oklch,var(--background),transparent 20%)", backdropFilter: "blur(8px)", padding: "0 16px" }}>
      <Button variant="ghost" size="icon-sm" aria-label="Toggle sidebar" onClick={onToggle}><i className="ph ph-sidebar-simple"></i></Button>
      <Separator orientation="vertical" style={{ height: 20, margin: "0 4px" }} />
      <span style={{ fontSize: 13, color: "var(--muted-foreground)" }}>Creator Commerce</span>
      <i className="ph ph-caret-right" style={{ fontSize: 12, color: "var(--muted-foreground)" }}></i>
      <span style={{ fontSize: 13, fontWeight: 500, textTransform: "capitalize" }}>{title}</span>
      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
        <Button variant="ghost" size="sm"><i className="ph ph-lifebuoy"></i>Support</Button>
        <span style={{ display: "flex", width: 32, height: 32, alignItems: "center", justifyContent: "center", borderRadius: "var(--radius-full)", background: "var(--muted)", color: "var(--muted-foreground)", fontSize: 12, fontWeight: 500 }}>AM</span>
      </div>
    </header>
  );
}

function AppShell({ active, onNav, collapsed, onToggle, children }) {
  return (
    <div style={{ display: "flex", height: "100%", background: "var(--background)", color: "var(--foreground)", fontFamily: "var(--font-sans)" }}>
      <Sidebar active={active} onNav={onNav} collapsed={collapsed} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <Topbar onToggle={onToggle} title={active} />
        <main style={{ flex: 1, overflow: "auto" }}>{children}</main>
      </div>
    </div>
  );
}

window.CCShell = { AppShell, NAV };
