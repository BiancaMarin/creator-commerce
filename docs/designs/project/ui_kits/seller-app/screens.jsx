/* Seller screens — Dashboard, Products, Orders, Customers, Settings. Data mirrors the product. */
const S = window.CreatorCommerceDesignSystem_8efbba;
const { Card, CardHeader, CardTitle, CardDescription, CardAction, CardContent, CardFooter, Button, Badge, Avatar, Separator, Input } = S;

const stats = [
  { label: "Revenue", value: "$48,120", delta: "+12.4%", up: true, icon: "ph-currency-dollar" },
  { label: "Orders", value: "1,204", delta: "+8.1%", up: true, icon: "ph-receipt" },
  { label: "New customers", value: "318", delta: "+4.7%", up: true, icon: "ph-users" },
  { label: "Conversion", value: "3.2%", delta: "-0.4%", up: false, icon: "ph-trend-up" },
];
const recentOrders = [
  { id: "#3812", customer: "Amara Okafor", product: "Studio Preset Pack", amount: "$48.00", status: "paid" },
  { id: "#3811", customer: "Leo Nakamura", product: "Lightroom Masterclass", amount: "$129.00", status: "paid" },
  { id: "#3810", customer: "Sofia Rossi", product: "Brand Kit Templates", amount: "$64.00", status: "refunded" },
  { id: "#3809", customer: "Daniel Weber", product: "Studio Preset Pack", amount: "$48.00", status: "pending" },
  { id: "#3808", customer: "Priya Menon", product: "1:1 Coaching Call", amount: "$220.00", status: "paid" },
];
const topProducts = [
  { name: "Studio Preset Pack", sales: 412, share: 82 },
  { name: "Lightroom Masterclass", sales: 286, share: 57 },
  { name: "Brand Kit Templates", sales: 173, share: 34 },
  { name: "1:1 Coaching Call", sales: 64, share: 13 },
];
const badgeFor = { paid: "success", pending: "warning", refunded: "neutral", failed: "destructive" };

function PageHeader({ title, subtitle, actions }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 4 }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <h1 style={{ margin: 0, fontFamily: "var(--font-heading)", fontSize: "var(--text-2xl)", fontWeight: 600, letterSpacing: "-.02em" }}>{title}</h1>
          {subtitle && <p style={{ margin: 0, fontSize: 14, color: "var(--muted-foreground)" }}>{subtitle}</p>}
        </div>
        <div style={{ display: "flex", gap: 8 }}>{actions}</div>
      </div>
    </div>
  );
}

function DashboardScreen({ onNav }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, padding: 24 }}>
      <PageHeader title="Dashboard" subtitle="Here's how your storefront is performing this month." actions={<>
        <Button variant="outline" size="sm"><i className="ph ph-export"></i>Export</Button>
        <Button size="sm" onClick={() => onNav("products")}><i className="ph ph-plus"></i>New product</Button>
      </>} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
        {stats.map((s) => (
          <Card key={s.label} size="sm">
            <CardHeader hasAction>
              <CardDescription>{s.label}</CardDescription>
              <CardTitle style={{ fontSize: "var(--text-2xl)" }}>{s.value}</CardTitle>
              <CardAction><span style={{ display: "flex", width: 36, height: 36, alignItems: "center", justifyContent: "center", borderRadius: "var(--radius-2xl)", background: "var(--muted)", color: "var(--muted-foreground)" }}><i className={"ph " + s.icon}></i></span></CardAction>
            </CardHeader>
            <CardFooter style={{ gap: 6, fontSize: 12, color: "var(--muted-foreground)" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontWeight: 500, color: s.up ? "var(--success)" : "var(--destructive)" }}><i className={"ph " + (s.up ? "ph-trend-up" : "ph-trend-down")} style={{ fontSize: 14 }}></i>{s.delta}</span>vs. last 30 days
            </CardFooter>
          </Card>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
        <Card>
          <CardHeader hasAction>
            <CardTitle>Recent orders</CardTitle>
            <CardDescription>Your latest 5 orders across the store.</CardDescription>
            <CardAction><Button variant="ghost" size="sm" onClick={() => onNav("orders")}>View all<i className="ph ph-arrow-up-right"></i></Button></CardAction>
          </CardHeader>
          <CardContent style={{ display: "flex", flexDirection: "column" }}>
            {recentOrders.map((o, i) => (
              <div key={o.id}>
                {i > 0 && <Separator />}
                <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0" }}>
                  <Avatar name={o.customer} />
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{o.customer}</p>
                    <p style={{ margin: 0, fontSize: 12, color: "var(--muted-foreground)" }}>{o.product} · {o.id}</p>
                  </div>
                  <Badge variant={badgeFor[o.status]}>{o.status}</Badge>
                  <span style={{ width: 64, textAlign: "right", fontSize: 14, fontWeight: 500, fontFamily: "var(--font-mono)" }}>{o.amount}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Top products</CardTitle><CardDescription>Best sellers this month.</CardDescription></CardHeader>
          <CardContent style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {topProducts.map((p) => (
              <div key={p.name} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, fontSize: 14 }}>
                  <span style={{ display: "flex", minWidth: 0, alignItems: "center", gap: 8 }}><i className="ph ph-package" style={{ color: "var(--muted-foreground)" }}></i><span style={{ fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</span></span>
                  <span style={{ color: "var(--muted-foreground)", fontFamily: "var(--font-mono)" }}>{p.sales}</span>
                </div>
                <div style={{ height: 6, width: "100%", overflow: "hidden", borderRadius: "var(--radius-full)", background: "var(--muted)" }}><div style={{ height: "100%", borderRadius: "var(--radius-full)", background: "var(--primary)", width: p.share + "%" }} /></div>
              </div>
            ))}
          </CardContent>
          <CardFooter><Button variant="outline" style={{ width: "100%" }} onClick={() => onNav("analytics")}>View analytics</Button></CardFooter>
        </Card>
      </div>
    </div>
  );
}

/* ---- Generic data table ---- */
function DataTable({ columns, rows, renderCell }) {
  return (
    <Card style={{ padding: 0 }}>
      <div style={{ overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              {columns.map((c) => <th key={c.key} style={{ textAlign: c.align || "left", padding: "12px 20px", fontSize: 12, fontWeight: 500, color: "var(--muted-foreground)" }}>{c.label}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} style={{ borderBottom: i < rows.length - 1 ? "1px solid var(--border)" : "none" }}>
                {columns.map((c) => <td key={c.key} style={{ textAlign: c.align || "left", padding: "12px 20px", verticalAlign: "middle" }}>{renderCell(r, c.key)}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

const products = [
  { name: "Studio Preset Pack", type: "Lightroom presets", price: "$48.00", sales: 412, status: "Published" },
  { name: "Lightroom Masterclass", type: "Video course", price: "$129.00", sales: 286, status: "Published" },
  { name: "Brand Kit Templates", type: "Design templates", price: "$64.00", sales: 173, status: "Published" },
  { name: "1:1 Coaching Call", type: "Service", price: "$220.00", sales: 64, status: "Published" },
  { name: "Motion Graphics Bundle", type: "After Effects", price: "$89.00", sales: 0, status: "Draft" },
];

function ProductsScreen() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, padding: 24 }}>
      <PageHeader title="Products" subtitle="Manage your catalog of digital products." actions={<Button size="sm"><i className="ph ph-plus"></i>New product</Button>} />
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <div style={{ position: "relative", maxWidth: 280, flex: 1 }}>
          <i className="ph ph-magnifying-glass" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--muted-foreground)", fontSize: 15 }}></i>
          <Input placeholder="Search products" style={{ paddingLeft: 34 }} />
        </div>
        <Button variant="outline" size="sm"><i className="ph ph-funnel"></i>Status</Button>
      </div>
      <DataTable
        columns={[{ key: "name", label: "Product" }, { key: "type", label: "Type" }, { key: "price", label: "Price", align: "right" }, { key: "sales", label: "Sales", align: "right" }, { key: "status", label: "Status" }, { key: "act", label: "", align: "right" }]}
        rows={products}
        renderCell={(r, k) => {
          if (k === "name") return <div style={{ display: "flex", alignItems: "center", gap: 10 }}><span style={{ display: "flex", width: 36, height: 36, alignItems: "center", justifyContent: "center", borderRadius: "var(--radius-2xl)", background: "var(--muted)", color: "var(--muted-foreground)" }}><i className="ph ph-package"></i></span><span style={{ fontWeight: 500 }}>{r.name}</span></div>;
          if (k === "type") return <span style={{ color: "var(--muted-foreground)" }}>{r.type}</span>;
          if (k === "price") return <span style={{ fontFamily: "var(--font-mono)" }}>{r.price}</span>;
          if (k === "sales") return <span style={{ fontFamily: "var(--font-mono)", color: "var(--muted-foreground)" }}>{r.sales}</span>;
          if (k === "status") return <Badge variant={r.status === "Published" ? "success" : "outline"}>{r.status}</Badge>;
          return <Button variant="ghost" size="icon-sm" aria-label="More"><i className="ph ph-dots-three"></i></Button>;
        }}
      />
    </div>
  );
}

function OrdersScreen() {
  const rows = [...recentOrders, { id: "#3807", customer: "Marco Bianchi", product: "Brand Kit Templates", amount: "$64.00", status: "paid" }, { id: "#3806", customer: "Yuki Tanaka", product: "Lightroom Masterclass", amount: "$129.00", status: "failed" }];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, padding: 24 }}>
      <PageHeader title="Orders" subtitle="Track fulfillment and manage refunds." actions={<Button variant="outline" size="sm"><i className="ph ph-export"></i>Export</Button>} />
      <DataTable
        columns={[{ key: "id", label: "Order" }, { key: "customer", label: "Customer" }, { key: "product", label: "Product" }, { key: "status", label: "Status" }, { key: "amount", label: "Amount", align: "right" }]}
        rows={rows}
        renderCell={(r, k) => {
          if (k === "id") return <span style={{ fontFamily: "var(--font-mono)", fontWeight: 500 }}>{r.id}</span>;
          if (k === "customer") return <div style={{ display: "flex", alignItems: "center", gap: 8 }}><Avatar name={r.customer} size="sm" /><span>{r.customer}</span></div>;
          if (k === "product") return <span style={{ color: "var(--muted-foreground)" }}>{r.product}</span>;
          if (k === "status") return <Badge variant={badgeFor[r.status]}>{r.status}</Badge>;
          return <span style={{ fontFamily: "var(--font-mono)", fontWeight: 500 }}>{r.amount}</span>;
        }}
      />
    </div>
  );
}

const customers = [
  { name: "Amara Okafor", email: "amara@studio.co", orders: 8, spent: "$612.00" },
  { name: "Leo Nakamura", email: "leo.n@gmail.com", orders: 5, spent: "$438.00" },
  { name: "Priya Menon", email: "priya@lens.io", orders: 4, spent: "$396.00" },
  { name: "Sofia Rossi", email: "sofia.rossi@mail.com", orders: 3, spent: "$192.00" },
  { name: "Daniel Weber", email: "d.weber@web.de", orders: 2, spent: "$96.00" },
];

function CustomersScreen() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, padding: 24 }}>
      <PageHeader title="Customers" subtitle="View profiles, segments, and lifetime value." actions={<Button variant="outline" size="sm"><i className="ph ph-export"></i>Export</Button>} />
      <DataTable
        columns={[{ key: "name", label: "Customer" }, { key: "email", label: "Email" }, { key: "orders", label: "Orders", align: "right" }, { key: "spent", label: "Lifetime value", align: "right" }]}
        rows={customers}
        renderCell={(r, k) => {
          if (k === "name") return <div style={{ display: "flex", alignItems: "center", gap: 10 }}><Avatar name={r.name} /><span style={{ fontWeight: 500 }}>{r.name}</span></div>;
          if (k === "email") return <span style={{ color: "var(--muted-foreground)" }}>{r.email}</span>;
          if (k === "orders") return <span style={{ fontFamily: "var(--font-mono)", color: "var(--muted-foreground)" }}>{r.orders}</span>;
          return <span style={{ fontFamily: "var(--font-mono)", fontWeight: 500 }}>{r.spent}</span>;
        }}
      />
    </div>
  );
}

function PlaceholderScreen({ title, icon }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, padding: 24, height: "100%" }}>
      <PageHeader title={title} />
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, color: "var(--muted-foreground)", textAlign: "center" }}>
          <span style={{ display: "flex", width: 56, height: 56, alignItems: "center", justifyContent: "center", borderRadius: "var(--radius-4xl)", background: "var(--muted)" }}><i className={"ph " + icon} style={{ fontSize: 26 }}></i></span>
          <p style={{ margin: 0, maxWidth: 300 }}>The {title.toLowerCase()} view lives here — a template not yet built in this kit.</p>
        </div>
      </div>
    </div>
  );
}

window.CCScreens = { DashboardScreen, ProductsScreen, OrdersScreen, CustomersScreen, PlaceholderScreen };
