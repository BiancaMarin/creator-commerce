# Seller App — UI kit

An interactive recreation of the Creator Commerce **seller dashboard** (`(app)` route group). Chrome-free primitives from this design system compose the whole surface.

## Screens
- **Dashboard** (`DashboardScreen`) — KPI stat tiles, recent-orders panel, top-products panel. Mirrors `app/(app)/dashboard/page.tsx`.
- **Products** (`ProductsScreen`) — T3 list/data table with search + status filter, status badges, row actions.
- **Orders** (`OrdersScreen`) — order list with customer avatars and status badges.
- **Customers** (`CustomersScreen`) — customer list with lifetime value.
- **Analytics / Settings** — placeholders (templates not built in this kit).

## Shell
`AppShell.jsx` — collapsible icon **Sidebar** (toggle via the header button) + sticky **Topbar** with breadcrumb. Mirrors `components/app-sidebar.tsx` and `components/site-header.tsx`.

## Interaction
Click sidebar items or in-page links (View all → Orders, View analytics, New product → Products) to navigate. The sidebar collapses to icons with tooltips.

Open `index.html`. Built on the DS `Button, Card, Badge, Avatar, Separator, Input, Tooltip` components.
