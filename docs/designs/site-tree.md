# Site Map — Creator Commerce

Every **user-facing page/screen** in the product, mapped to the **course session** that
builds it. This is a routing/planning reference, not an implementation guide.

**Scope:** user-facing pages and screens only. API route handlers, Server Actions, and
other non-page endpoints are **out of scope** for this document.

**Two lenses on the same tree:**
- **[Grouped by layout](#pages-grouped-by-layout-design-lens)** — the design lens. Pages
  sharing a layout template are collected together so each template is designed **once** in
  the AI design tool and reused across every route that uses it. **Start here for design work.**
- **[Grouped by session](#sessions-at-a-glance)** — the build lens. Sessions are derived
  from the build order in [`CLAUDE.md`](../CLAUDE.md); earlier sessions cover work already
  built, later ones group remaining pages into shippable increments.

**Legend:** ✅ built · 🔜 to build · Type = React Server / Client Component ·
Group = App Router route group (does not appear in the URL).

---

## Pages grouped by layout (design lens)

Layouts come in two levels. Design each **once** in the AI tool, then reuse.

1. **Outer shells** — the persistent chrome around a page (nav, header, footer). One per
   route group.
2. **Page templates** — the reusable *content skeleton* inside a shell (e.g. a data table
   with a header + filters). This is where the design leverage is: **10 templates cover all
   29 screens** — the buyer account (see [callout](#buyer-account-reuses-existing-templates))
   adds screens but **no new templates**.

### Outer shells (4)

| Shell | Group | Chrome | Wraps |
| --------------- | ----------- | -------------------------------- | ---------------------------- |
| App shell | `(app)` | Left sidebar nav + top header | 15 seller dashboard screens |
| Auth shell | `(auth)` | Centered, chrome-free viewport | 4 auth screens (shared seller + buyer) |
| Storefront shell| `(store)` | Public top nav + footer | 3 public storefront screens |
| Buyer account shell | `(account)` | Buyer top nav (no seller sidebar) | 7 buyer account screens |

### Page templates (10)

Ranked by **design priority** = reuse count × centrality. Build the High ones first — they
account for most screens and set the component kit (see [shared blocks](#shared-building-blocks)).

| # | Template | Shell | Pages | Screens | Priority |
| -- | ----------------------- | ------ | ------------------------------------------------------ | ------- | -------- |
| T1 | Auth card form | Auth | login · signup · forgot-password · reset-password | 4 | **High** |
| T2 | Overview dashboard | App | dashboard · analytics | 2 | **High** |
| T3 | List / data table | App | products · orders · customers · **account/orders** | 4 | **High** |
| T4 | Record detail | App+Acct | products/:id · orders/:id · customers/:id · **account/orders/:id** | 4 | **High** |
| T6 | Settings tabbed form | App+Acct | settings/{profile,store,billing,notifications} · **account/settings/{profile,delivery,notifications}** | 7 | **High** |
| T5 | Resource create form | App | products/new | 1 | Medium |
| T7 | Content / landing | App | `/` welcome · support | 2 | Medium |
| T8 | Card grid (storefront / library) | Store+Acct | `/:slug` · **account/library** · **account/wishlist** | 3 | Medium |
| T9 | Product & checkout | Store | `/:slug/:product` | 1 | Low (opt) |
| T10| Confirmation | Store | checkout/success | 1 | Low (opt) |

> Buyer routes (**bold**) reuse seller templates — see the
> [buyer-account callout](#buyer-account-reuses-existing-templates).
>
> Three routes are **redirects** with no UI screen (`/settings`, `/account`,
> `/account/settings`): **32 routes, 29 designable screens**.

### Template regions & wireframes

**T1 · Auth card form** — centered card, single-column. Logo → title/subtitle → fields →
primary button → OAuth buttons → footer link. Variants differ only in field set (login = 2
fields; forgot = email-only; reset = new password ×2).
```
        ┌───────────────────┐
        │      [ logo ]      │
        │   title / subtext  │
        │  [ field        ]  │
        │  [ field        ]  │
        │  [   Submit     ]  │
        │  — or continue —   │
        │ [Google][GitHub]   │
        │   footer link →    │
        └───────────────────┘
```

**T2 · Overview dashboard** — page header → KPI/stat-tile row → chart(s) → summary panels
(recent list + top list). Dashboard and analytics are the **same skeleton**, different
tiles/charts.
```
 Title ........................ [range ▾]
 [ KPI ][ KPI ][ KPI ][ KPI ]
 [======  chart  ======][ panel ]
 [ recent list ][ top list ]
```

**T3 · List / data table** — page header with primary action → filter/search bar → data
table (sortable, row actions, status badges) → pagination. Needs `table` + `badge`.
```
 Title ................. [ + New ]
 [search][filter ▾][filter ▾]
 ┌─────────────────────────────┐
 │ col │ col │ col │ badge │ ⋯ │
 │ ... rows ...                │
 └─────────────────────────────┘
              ◄ 1 2 3 ►
```

**T4 · Record detail** — breadcrumb → entity header (title + status badge + actions) →
two-column body: main panels (left) + meta sidebar (right) + a related list (reuses T3's
table). Orders/customers/products differ in panel content, not layout.
```
 ‹ back / breadcrumb
 Name           [badge] [Edit][⋯]
 ┌── main panels ──┐ ┌ meta ┐
 │                 │ │ key: │
 │  related table  │ │ val  │
 └─────────────────┘ └──────┘
```

**T6 · Settings tabbed form** — settings sub-nav (tabs, from a `settings/layout.tsx`) →
sectioned single-column form → save bar. Both the seller settings tabs and the buyer
account settings tabs share this template — only the tab set and field sections change.
```
 [Profile][Store][Billing][Notifs]
 ── section ──────────────
 [ label ] [ field       ]
 [ label ] [ field       ]
                 [ Save ]
```

**T5 · Resource create form** — page header → sectioned form (fields left, helper/preview
right) → sticky save/cancel bar. Shares form DNA with T6; can reuse the same field kit.

**T7 · Content / landing** — light prose/hero layout. `/` = welcome hero; `support` =
help/contact content. Lowest structural overlap; treat as one flexible content template.

**T8 · Card grid** — responsive grid of product/file cards + a header. Reused by three
surfaces with only the **card CTA** changing: storefront `/:slug` (**Buy**), buyer
`account/library` (**Download**), buyer `account/wishlist` (**Remove / Buy**). The
storefront instance is optional, but library + wishlist are core buyer screens — so the
template itself is **Medium** priority.

**T9–T10 · Public store (optional)** — product detail + buy panel (T9) → centered success
state (T10, structurally close to T1's card). Only if the public storefront is in scope.

### Shared building blocks

Design these small pieces once; they recur across templates and become the component kit:

| Block | Appears in |
| ----------------------------- | ----------------------------- |
| Page header (title + actions) | T2, T3, T4, T5, T6 |
| Stat / KPI tile | T2, and T4 meta sidebar |
| Data table (+ status badge) | T3, and T4 related lists |
| Form field group | T1, T5, T6 |
| Card surface | every template |

### Buyer account (reuses existing templates)

The authenticated **buyer** surface (new `(account)` shell) adds **7 screens but zero new
page templates** — each is an instance of a seller template with a small delta. This is the
main reason to model it here: the AI design tool builds the buyer account almost entirely
from templates it has already designed.

| Buyer screen | Reuses | Delta from seller version |
| ------------------------------ | ---------------------------- | ------------------------------------ |
| `/account/library` | **T8 card grid** | Card CTA = **Download** |
| `/account/wishlist` | **T8 card grid** | Card CTA = **Remove / Buy** |
| `/account/orders` | **T3 list / data table** | Buyer's own orders only |
| `/account/orders/:id` | **T4 record detail** | Adds per-file **download links** + invoice |
| `/account/settings/*` (3 tabs) | **T6 settings tabbed form** | Tabs = Profile / Delivery / Notifications |

Net-new design work for the whole buyer account: **1 outer shell** (buyer chrome) + **1
settings sub-nav layout** + the T8 download/remove card CTA. Login/signup are the **shared
`(auth)` screens** — no buyer-specific auth to design.

---

## Sessions at a glance

| Session | Theme | Group(s) | Pages | Status |
| ------- | ----------------------------------- | ------------- | ----- | ------ |
| 1 | Foundation & dashboard shell | `(app)` | 2 | ✅ done |
| 2 | Authentication screens | `(auth)` | 4 | 🔜 |
| 3 | Catalog & commerce list pages | `(app)` | 4 | 🔜 |
| 4 | Detail & create routes (CRUD depth) | `(app)` | 4 | 🔜 |
| 5 | Settings sub-tree & support | `(app)` | 6 | 🔜 |
| 6 | Public storefront (optional) | `(store)` | 3 | 🔜 |
| 7 | Buyer account | `(account)` | 9 | 🔜 |

Total: **32 route pages** (20 seller core + 9 buyer account + 3 optional storefront) across
4 shared layouts — **29 with a distinct UI screen** (`/settings`, `/account`, and
`/account/settings` are redirects). See
[Pages grouped by layout](#pages-grouped-by-layout-design-lens) for the design view.

---

## Session 1 — Foundation & dashboard shell ✅

The dashboard chrome (sidebar + header + tooltip provider) and the first two pages.

| Route | Page file | Type | Status | Purpose |
| ----------- | ------------------------------- | ------ | ------ | ------------------------------------- |
| `/` | `app/(app)/page.tsx` | Server | ✅ | Welcome landing (candidate to redirect → `/dashboard`) |
| `/dashboard`| `app/(app)/dashboard/page.tsx` | Server | ✅ | KPI cards, recent orders, top products |

> Shared shell: `app/(app)/layout.tsx` — `SidebarProvider` + `AppSidebar` + `SiteHeader`.

---

## Session 2 — Authentication screens 🔜

New chrome-free `(auth)` group (centered card, no sidebar/header). **Moves `/login`** out of
the `(app)` shell where it currently sits inside dashboard chrome. These screens are
**shared by sellers and buyers** — the account role decides the post-auth redirect
(seller → `/dashboard`, buyer → `/account`), so no buyer-specific auth screens are needed.

| Route | Page file | Type | Status | Purpose |
| ----------------- | --------------------------------- | ------ | ------ | -------------------------------- |
| `/login` | `app/(auth)/login/page.tsx` | Client | 🔜 move | Sign in (built, relocate from `(app)`) |
| `/signup` | `app/(auth)/signup/page.tsx` | Client | 🔜 | Create account (`strings.signup` reserved) |
| `/forgot-password`| `app/(auth)/forgot-password/page.tsx` | Client | 🔜 | Request reset (login's "Forgot password?" links here) |
| `/reset-password` | `app/(auth)/reset-password/page.tsx` | Client | 🔜 | Token-based reset (`?token=…`) |

> New shared layout: `app/(auth)/layout.tsx` — minimal centered card, no app chrome.

---

## Session 3 — Catalog & commerce list pages 🔜

The list/index pages behind the sidebar + header nav. Building these **clears the dead nav
links** (`/products`, `/orders`, `/customers`, `/analytics`) that currently fail the typed-route
build. Needs the `table` + `badge` primitives.

| Route | Page file | Type | Status | Purpose |
| ------------ | -------------------------------- | ------ | ------ | ------------------------------- |
| `/products` | `app/(app)/products/page.tsx` | Server | 🔜 | Catalog list / table |
| `/orders` | `app/(app)/orders/page.tsx` | Server | 🔜 | Orders list |
| `/customers` | `app/(app)/customers/page.tsx` | Server | 🔜 | Customer list / segments |
| `/analytics` | `app/(app)/analytics/page.tsx` | Server | 🔜 | Revenue / traffic / conversion |

---

## Session 4 — Detail & create routes (CRUD depth) 🔜

Per-record detail pages and the product create form. Dynamic segments (`[id]`) resolve to
individual records.

| Route | Page file | Type | Status | Purpose |
| --------------- | -------------------------------------- | ------ | ------ | ------------------------------ |
| `/products/new` | `app/(app)/products/new/page.tsx` | Client | 🔜 | Create product form |
| `/products/:id` | `app/(app)/products/[id]/page.tsx` | Server | 🔜 | Product detail / edit |
| `/orders/:id` | `app/(app)/orders/[id]/page.tsx` | Server | 🔜 | Order detail, refund, fulfillment |
| `/customers/:id`| `app/(app)/customers/[id]/page.tsx` | Server | 🔜 | Customer profile, LTV, order history |

---

## Session 5 — Settings sub-tree & support 🔜

Settings gets its own sub-nav (tabs) layout; the index redirects to the first tab. Building
these clears the last two dead nav links (`/settings`, `/support`).

| Route | Page file | Type | Status | Purpose |
| ------------------------- | ------------------------------------------- | ------ | ------ | ------------------------- |
| `/settings` | `app/(app)/settings/page.tsx` | Server | 🔜 | Redirect → `/settings/profile` |
| `/settings/profile` | `app/(app)/settings/profile/page.tsx` | Client | 🔜 | Name, avatar, bio |
| `/settings/store` | `app/(app)/settings/store/page.tsx` | Client | 🔜 | Storefront config, domain |
| `/settings/billing` | `app/(app)/settings/billing/page.tsx` | Server | 🔜 | Payouts, plan, invoices |
| `/settings/notifications` | `app/(app)/settings/notifications/page.tsx` | Client | 🔜 | Email / app preferences |
| `/support` | `app/(app)/support/page.tsx` | Server | 🔜 | Help / contact |

> New shared layout: `app/(app)/settings/layout.tsx` — settings sub-nav tabs.

---

## Session 6 — Public storefront (optional) 🔜

Optional buyer-facing storefront in a new public `(store)` group with its own chrome. Only
in scope if the course covers the public shopping surface.

| Route | Page file | Type | Status | Purpose |
| ------------------- | --------------------------------------- | ------ | ------ | -------------------------- |
| `/:slug` | `app/(store)/[slug]/page.tsx` | Server | 🔜 | A creator's storefront |
| `/:slug/:product` | `app/(store)/[slug]/[product]/page.tsx` | Server | 🔜 | Product page / checkout |
| `/checkout/success` | `app/(store)/checkout/success/page.tsx` | Server | 🔜 | Post-purchase confirmation |

> New shared layout: `app/(store)/layout.tsx` — public store chrome.

---

## Session 7 — Buyer account 🔜

The authenticated **buyer** surface, in a new `(account)` group with light buyer chrome (top
nav, no seller sidebar). Since products are **digital files**, "shipping information" is just
the **delivery email(s)** where files/receipts are sent — modeled as the *Delivery* settings
tab, not a postal address. Every screen reuses an existing template (see the
[buyer-account callout](#buyer-account-reuses-existing-templates)).

| Route | Page file | Type | Status | Purpose |
| ---------------------------------- | -------------------------------------------------- | ------ | ------ | -------------------------------- |
| `/account` | `app/(account)/account/page.tsx` | Server | 🔜 | Redirect → `/account/library` |
| `/account/library` | `app/(account)/account/library/page.tsx` | Server | 🔜 | Downloads — re-access purchased files ★ |
| `/account/wishlist` | `app/(account)/account/wishlist/page.tsx` | Server | 🔜 | Saved products |
| `/account/orders` | `app/(account)/account/orders/page.tsx` | Server | 🔜 | Purchase history (list) |
| `/account/orders/:id` | `app/(account)/account/orders/[id]/page.tsx` | Server | 🔜 | Receipt / order detail + download links |
| `/account/settings` | `app/(account)/account/settings/page.tsx` | Server | 🔜 | Redirect → `/account/settings/profile` |
| `/account/settings/profile` | `app/(account)/account/settings/profile/page.tsx` | Client | 🔜 | Name, email, password |
| `/account/settings/delivery` | `app/(account)/account/settings/delivery/page.tsx` | Client | 🔜 | Delivery email(s) = "shipping info" |
| `/account/settings/notifications` | `app/(account)/account/settings/notifications/page.tsx` | Client | 🔜 | Email preferences |

> New shared layouts: `app/(account)/layout.tsx` — buyer chrome;
> `app/(account)/account/settings/layout.tsx` — buyer settings sub-nav tabs.
>
> **Routing:** the static `/account…` segments resolve **ahead of** the `(store)` group's
> dynamic `/:slug` (static beats dynamic in the App Router), so the two groups don't collide.

---

## Route-group cross-reference

| Group | URL prefix | Layout chrome | Sessions |
| ----------- | ---------- | --------------------------------- | -------- |
| `(app)` | *(none)* | Sidebar + header + tooltip | 1, 3, 4, 5 |
| `(auth)` | *(none)* | Minimal centered card (shared) | 2 |
| `(store)` | *(none)* | Public storefront chrome | 6 |
| `(account)` | `/account` | Buyer top nav (no seller sidebar) | 7 |
