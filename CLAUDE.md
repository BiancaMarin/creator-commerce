@AGENTS.md

# Creator Commerce

An admin/storefront dashboard for creators to sell digital products — track revenue,
manage orders and customers, and view analytics. Built on the Next.js App Router with a
Base UI–based shadcn component layer.

> **Read this first:** the `@AGENTS.md` directive above overrides your assumptions about
> Next.js. This project runs **Next.js 16**, which has breaking changes vs. older
> versions. Before writing framework code, consult the bundled docs at
> `node_modules/next/dist/docs/` and heed deprecation notices.

## Tech stack

| Area          | Choice                                                            |
| ------------- | ----------------------------------------------------------------- |
| Framework     | Next.js **16.2.10** (App Router, **Turbopack** build)             |
| UI runtime    | React **19.2.4** / React DOM 19.2.4                               |
| Language      | TypeScript 5 (`strict: true`, `moduleResolution: "bundler"`)      |
| Primitives    | **Base UI** (`@base-ui/react` ^1.6) via **shadcn** ^4.13          |
| Styling       | **Tailwind CSS v4** (CSS-first config, no `tailwind.config.*`)    |
| Icons         | **Phosphor** (`@phosphor-icons/react` ^2.1)                       |
| Forms         | **react-hook-form** ^7.81                                         |
| Validation    | **zod** ^4.4 + `@hookform/resolvers` ^5.4                         |
| Auth          | **Better Auth** ^1.7.0-rc (email + password, cookie sessions)     |
| Database      | **Neon Postgres** via **Drizzle ORM** ^1.0.0-rc + drizzle-kit     |
| File uploads  | **UploadThing** ^7.7 (`uploadthing` + `@uploadthing/react`)        |
| Payments      | **Stripe** ^22.6 — hosted Checkout Sessions + webhook fulfilment   |
| Class utils   | `clsx` + `tailwind-merge` (via `cn()`), `class-variance-authority` |

Drizzle and Better Auth are on **prereleases**: `npm install` needs `--legacy-peer-deps`,
and the imports in `lib/server/auth.ts` are pinned to specific entry points for reasons
documented in comments there — don't "simplify" them.

## Commands

```bash
npm run dev          # next dev (Turbopack)
npm run build        # next build — the verification gate (see below)
npm run lint         # eslint (eslint-config-next)
npm run db:generate  # drizzle-kit generate — write a migration from schema changes
npm run db:migrate   # drizzle-kit migrate — apply migrations to Neon
npm run db:studio    # drizzle-kit studio — interactive DB browser
```

There is no test runner configured. **`npm run build` is the verification gate**: it runs
TypeScript, regenerates typed-route definitions, and prerenders every page. Run it after
non-trivial changes.

`npm run lint` currently reports **3 pre-existing errors** (`hooks/use-mobile.ts` and other
untouched files). Don't treat those as regressions from your change; do keep the files you
touch clean.

### Verifying database-backed work

The build won't tell you whether a query returns what you expect. For ad-hoc SQL, write a
throwaway `.mjs` **in the project root** (not the system temp dir — `@neondatabase/serverless`
only resolves from inside the project) and delete it afterwards:

```js
import { neon } from "@neondatabase/serverless";
const sql = neon(process.env.PG_CONNECTION_STRING);
console.table(await sql`select name, handle from "user"`);  // "user" is a reserved word — quote it
```

```bash
node --env-file=.env ./q.tmp.mjs
```

## Folder structure

```
app/
  layout.tsx                      # Root layout: <html>/<body>, fonts (Geist, Geist Mono, Public Sans)
  globals.css                     # Tailwind v4 + theme tokens (see "Styling")
  (marketing)/page.tsx            # "/"                  → public landing page
  (auth)/                         # Chrome-free auth shell; redirects to /dashboard if signed in
    login/page.tsx                # "/login"
    signup/page.tsx               # "/signup"
    forgot-password/page.tsx      # "/forgot-password"  → request a reset link
    reset-password/page.tsx       # "/reset-password"   → set a new password from the link
  (app)/                          # Seller app. layout.tsx gates the whole group on a session
    layout.tsx                    # requireUser() + SidebarProvider + AppSidebar + TooltipProvider
    dashboard/page.tsx            # "/dashboard" → KPI cards, recent orders, Account tab
    dashboard/actions.ts          # Server Actions for the dashboard (updateHandle)
    orders/page.tsx               # "/orders"    → the seller's sales, from order_items
    downloads/page.tsx            # "/downloads" → the buyer's library; Stripe returns here
    products|customers|analytics|wishlist/page.tsx   # placeholder screens
  (store)/                        # Public buyer-facing storefronts
    layout.tsx                    # bare flex shell only — no nav/footer (see StoreChrome)
    [handle]/layout.tsx           # resolves the creator from the DB, 404s if unknown
    [handle]/page.tsx             # "/:handle"             → creator profile + product grid
    [handle]/[id]/[slug]/page.tsx # "/:handle/:id/:slug"   → product detail + checkout
    checkout/success/page.tsx     # legacy Stripe return URL — redirects to /downloads
  api/auth/[...all]/route.ts      # Better Auth handler (GET/POST)
  api/stripe/webhook/route.ts     # Stripe webhook — the ONLY place an order becomes paid
  api/uploadthing/core.ts         # UploadThing FileRouter (productImage, productFile)
  api/uploadthing/route.ts        # UploadThing handler (GET/POST)
components/
  ui/                     # shadcn primitives (Base UI wrappers) — treat as generated
  app-sidebar.tsx         # Seller left nav (client; usePathname for active state)
  nav-user.tsx            # Sidebar footer: avatar + sign out (client)
  dashboard/              # Dashboard-only pieces (handle-form.tsx)
  marketing/              # Landing page sections + LogoMark
  store/                  # Storefront chrome + product/checkout UI
constants/
  strings.ts              # Centralized user-facing copy (see "Copy & UI strings")
hooks/                    # e.g. use-mobile.ts
lib/
  utils.ts                # cn() class-merge helper, getInitials(), slugify()
  auth-client.ts          # Better Auth React client (browser)
  analytics/              # funnel event names + browser capture helpers (see "Analytics")
  schemas/                # ALL zod schemas — shared client + server (see "Forms & validation")
    auth.ts               # signupSchema, loginSchema, forgot/resetPasswordSchema
    handle.ts             # handleSchema + HANDLE_MIN/MAX_LENGTH
    product.ts            # productSchema
  store-data.ts           # PLACEHOLDER product data (not from the DB yet)
  server/                 # server-only modules (see "Server-only code")
    auth.ts               # Better Auth config (Drizzle adapter, handle generation hook)
    email.ts              # sendEmail() — Gmail SMTP, console fallback (see "Email")
    emails/               # one file per message (order-receipt.ts, password-reset.ts)
    origin.ts             # appOrigin() — absolute URLs, from BETTER_AUTH_URL
    analytics.ts          # captureServerEvent() — PostHog from the webhook
    handle.ts             # generateUniqueHandle(), isHandleTaken()
    db/index.ts           # Drizzle client (Neon HTTP)
    db/schemas/           # auth.ts (user/session/account/verification), product.ts
    dal/                  # data access: session.ts, creators.ts, products.ts
drizzle/                  # generated SQL migrations — never hand-edit
docs/designs/             # Claude Design handoff bundle + site map (planning reference)
```

Import alias: **`@/*` → project root** (e.g. `@/components/ui/button`, `@/lib/utils`,
`@/hooks/use-mobile`). Always use `@/…`, never long relative paths.

## Routing & layouts

- **App Router only.** Route groups (`(app)`, `(auth)`, `(store)`, `(marketing)`) don't
  appear in the URL; they exist to give each area its own layout and auth posture.
- **Typed routes are enabled** (`typedRoutes: true` in `next.config.ts`). Two things this
  actually catches, and one it can't:
  - ✅ An `href` whose type has widened to `string`. Declare nav arrays with `as const`,
    and inline route ternaries (or annotate them `as const`) rather than hoisting them
    into an untyped `const`.
  - ✅ A multi-segment path matching no route, e.g. `/foo/bar`.
  - ❌ **A single-segment path is always valid** — `/anything` matches the `/[handle]`
    storefront route. So `<Link href="/settings">` compiles and 404s at runtime. The
    compiler cannot save you here; check that top-level routes exist.
- When you need a link to a route that doesn't exist yet, point at an existing one
  (`/dashboard`) and leave a `// TODO`.
- Redirect from a page with `redirect()` from `next/navigation` (server-side).

## Server vs. Client Components

- **Server Components are the default.** Only add `"use client"` when a file needs
  interactivity or client APIs: `useState`, `usePathname`, `useForm`, event handlers, etc.
- Client Components can be rendered inside Server Components — that's expected and cheap.
  Most `components/ui/*` primitives are `"use client"` because Base UI is a client layer;
  importing them into a Server page is fine.
- The reverse is not true: a Server Component can't be imported into a Client Component.
  Pass server data down as props (see `AppSidebar`, `StoreChrome`, `HandleForm`).
- **Base UI `Tabs` only mounts the active panel.** Content in a non-default `TabsContent`
  (e.g. the dashboard Account tab) is absent from the SSR HTML and mounts on click —
  expected, but don't go hunting for it in view-source.

## Authentication

Auth **is implemented** with **Better Auth** (email + password) on Drizzle/Neon.

- Config: `lib/server/auth.ts`. Handler: `app/api/auth/[...all]/route.ts`.
  Browser client: `lib/auth-client.ts` (`authClient.signUp` / `signIn` / `signOut`).
- Schema: `lib/server/db/schemas/auth.ts` — `user`, `session`, `account`, `verification`.
  Object keys must match Better Auth's camelCase field names; the adapter resolves columns
  by key, not by column name.
- **Read the session through `lib/server/dal/session.ts`**, never by calling Better Auth
  directly in a page: `getSession()` (nullable), `requireSession()` and `requireUser()`
  (redirect to `/login`).
- **Route protection lives in layouts, not pages.** `(app)/layout.tsx` calls `requireUser()`
  once for the whole seller app; `(auth)/layout.tsx` bounces signed-in users to
  `/dashboard`. A new page under `(app)` is protected automatically — don't re-check.
- **Server Actions must derive identity from the session**, never from their arguments.
  See `updateHandle` in `app/(app)/dashboard/actions.ts`.
- Google / GitHub buttons are visual placeholders (disabled, no OAuth wired).
- `handle` is declared as an additionalField with `required: false` so Better Auth's
  pre-hook validation doesn't reject signups — the column is still NOT NULL, and the
  `user.create.before` hook fills it. Consequence: **`user.handle` is typed
  `string | null | undefined`** on the session user even though it's always present.

### Password reset

Reset is **Better Auth's own flow**, wired to this app's mailer. Nothing about it is
hand-rolled — no custom token table, no custom expiry.

- **Declaring `sendResetPassword` is what enables the feature.** Without that function in
  `emailAndPassword`, `/request-password-reset` refuses with `RESET_PASSWORD_DISABLED`.
  The config and `lib/server/emails/password-reset.ts` are one feature, not two.
- **Email the `url` Better Auth hands you; never rebuild it from `token`.** That URL points
  at Better Auth's *callback* (`/api/auth/reset-password/:token`), which validates the token
  and only then redirects to `/reset-password?token=…`, or `?error=INVALID_TOKEN` when it's
  spent. Linking straight to the form would swap a clean error page for a form that fails
  on submit.
- **Both password pages answer the same way for every failure.** Missing token, expired
  token, already-used token: one message, because the reader's next step is identical.
- **`/forgot-password` never reveals whether an account exists**, and its submit handler
  deliberately ignores the response. Better Auth returns the same body either way and even
  does dummy token work to keep the timing alike; branching on the result here would undo
  that and turn the form into a way to enumerate registered addresses.
- **`resetPasswordTokenExpiresIn` is set explicitly** to the hour the UI copy promises,
  even though it matches the current default. A default that changed later would make the
  app lie to its users.
- **`revokeSessionsOnPasswordReset: true`.** A reset is what someone does when they think
  they've lost control of the account, so leaving other sessions alive defeats the point.
- Verified end to end: token issued, callback redirect carrying the token, password
  updated, replay of the same token refused with `INVALID_TOKEN`, sign-in with the new
  password.

### Storefront handles

Every user owns a public storefront at `/:handle`.

- Generated at signup from the email local part by `generateUniqueHandle()`
  (`lib/server/handle.ts`), with a random suffix on collision.
- Users rename theirs from the dashboard **Account** tab (`HandleForm` → `updateHandle`).
  Renaming is not aliased: the old URL 404s immediately.
- **Lookups are case-insensitive** (`getCreatorByHandle` lowercases both sides), so
  `/Test` and `/test` are the same store. Uniqueness checks must therefore be
  case-insensitive too — use `isHandleTaken()`, don't write a new `eq()` comparison.
- Validation rules live in **one** place, `lib/schemas/handle.ts`, imported by both the
  client form and the server action. Change them there, not in either caller.

## Data layer

- **Drizzle ORM over Neon HTTP.** The client is the default export of `lib/server/db`.
- **Schema changes:** edit `lib/server/db/schemas/*`, then `npm run db:generate` and
  `npm run db:migrate`. Never hand-edit files in `drizzle/`.
- **Queries belong in `lib/server/dal/`**, not inline in pages. Wrap read functions in
  React `cache()` so a layout, its page and `generateMetadata` share one query per request
  (see `getCreatorByHandle`).
- **Products are live.** Both the seller catalog and the storefront read real rows through
  `dal/products.ts`. `lib/store-data.ts` is now only presentation helpers (`formatPrice`,
  `visualsFor`) — not a data source.
- **Products are soft-deleted, never dropped.** `deleted_at` NULL means live. Two rules
  follow, and both are easy to break silently:
  - **Every read must filter `deleted_at IS NULL`** — use the shared `isLive` predicate in
    `dal/products.ts`. A missing filter resurrects deleted products on a public storefront.
  - **Slug uniqueness is a *partial* unique index** on `(user_id, slug) WHERE deleted_at IS
    NULL`, so deleting a product releases its URL. `isSlugTaken()` mirrors that WHERE
    exactly; if the two drift apart, `uniqueSlug()` starts proposing slugs the database
    rejects.
- There is no `bio` column on `user`; the storefront shows `@handle` under the name rather
  than inventing copy. Adding one means a schema change + migration.

### Product search (`/explore`)

Platform-wide search lives in `searchProducts()` (`dal/products.ts`) and matches with
`ILIKE '%term%'` on `name` and `description`. Three things about it are load-bearing:

- **The indexes are GIN + `gin_trgm_ops`, not B-tree.** A leading wildcard makes a B-tree
  useless — it can only seek on a known prefix — so trigram indexes are the only kind that
  serve this. `pg_trgm` is enabled by a **custom migration**
  (`drizzle-kit generate --custom`), which is the sanctioned way to write SQL Drizzle can't
  express; the "never hand-edit `drizzle/`" rule is about *generated* files. That migration
  must stay ordered before the index one — `gin_trgm_ops` doesn't exist until the extension
  is installed.
- **`MIN_SEARCH_LENGTH` (3) is a storage constraint, not just UX.** Trigram indexes key on
  three-character sequences, so a shorter pattern has no complete trigram to seek on and
  GIN reads the whole index instead of narrowing (measured: estimated cost 304 vs 8.5).
  Below the floor `searchProducts` drops the predicate entirely and the page browses.
- **User input is escaped with `escapeLike()` before it reaches `ilike()`.** Drizzle
  parameterizes the *value*, so there's no injection risk — but `%`, `_` and `\` keep their
  pattern meaning inside it. Verified: `t%t` matches 7 rows unescaped, 0 escaped.

Results are date-ordered, not ranked — a term in a product's name sorts no higher than one
buried in a description. Ranking would want `similarity()` or a `tsvector`.

**The type filter** narrows on the `tag` column — what the product form labels "Type".
Because that's free text typed per product, not a fixed vocabulary:

- **Match and group on `lower(tag)`, never `tag`.** The catalog already holds "Test" and
  "test" as spellings of one type; comparing exactly splits them into two filters that
  each find half the products. `products_tag_lower_idx` is a **functional** index on the
  expression for the same reason — one on the bare column would go unused.
- `listProductTypes()` picks each group's label with `mode()`, tie-broken alphabetically,
  so the chip text is stable between requests.
- **`listProductTypes()` and `searchProducts()` must carry identical row-visibility
  predicates** — today just `isLive`. Add one to either and a chip's count stops matching
  what clicking it returns. An earlier version excluded the viewer's own products from
  both; that was dropped because it also hid a creator's own types from their filter,
  which reads as a broken filter to the person best placed to notice.
- The facet list deliberately ignores the active search term and price bounds. Facets that
  vanished as you typed would make the filter shift under the cursor.
- `/explore` reads **no session** — the `(app)` layout gates it and nothing on the page is
  viewer-scoped, so re-reading the session there would be the redundant check the auth
  section warns against.
- `type` is a `z.string()`, not a `z.enum()` — an unknown value matches nothing, which is
  the honest answer for a type nobody sells.

**The price filter** is `?min=`/`?max=`, each independently optional (a max alone reads as
"under $25"), inclusive at both ends, backed by `products_price_idx`.

- **Cast the bound: `price >= $1::numeric`.** `price` is `numeric` and the bound arrives
  from the URL as a string, so without the cast Postgres compares them as *text* — where
  `129.00 <= '25'` is true. Verified: the text comparison pulls a $129 product into "under
  $25". The same reasoning as `productSchema` keeping price a string end to end.
- An inverted range (min above max) returns nothing rather than being silently swapped —
  both numbers are visible in the inputs, so the cause is on screen.

With three filter dimensions the result/empty copy is **deliberately generic**
(`browsingFiltered`, `noResultsFiltered`) rather than naming which filters are active.
Enumerating the combinations is a matrix that rots, and the controls sit directly above
the message. The search term is the one exception — it still gets echoed back, because
it's what the reader most needs confirmed.

## Payments (Stripe)

Checkout is **Stripe-hosted**: the buyer leaves for Stripe's own page, pays, and is
returned to `/downloads`. This app never sees a card number.

The flow, and the order the steps must happen in:

1. `checkoutCart()` / `checkoutProduct()` (`lib/actions/cart.ts`) check the session, read
   prices **from the database**, and call `startCheckout()` (`lib/server/checkout.ts`).
2. `startCheckout` writes a `pending` order **first**, then creates the Checkout Session
   carrying `orderId` in its metadata, then stores `stripe_session_id` on the order. The
   order must exist before the session, or a payment can complete against an order that
   isn't there yet.
3. The action returns a **URL**; the client navigates with `window.location.href`, not
   `router.push` — Stripe is another origin.
4. `app/api/stripe/webhook/route.ts` verifies the signature and calls `markOrderPaid()`.

**Rules that are load-bearing:**

- **The webhook is the only thing that may mark an order `paid`.** Never fulfil on the
  success URL: the buyer can close the tab the moment the card clears, and that URL is a
  plain GET anyone can type. `markOrderPaid` / `markOrderFailed` are the only writers of
  `status`, and both live in `dal/orders.ts`.
- **Idempotence is a WHERE clause, not a check-then-write.** Both writers require
  `status = 'pending'`, so Stripe's redelivery (which *will* happen) updates zero rows
  instead of re-stamping `paid_at` or double-counting revenue. A late
  `checkout.session.expired` therefore can't revoke a paid download either.
- **Verify the signature against the raw body.** `await request.text()`, never
  `request.json()` — parsing and re-serializing invalidates the signature. Use
  `constructEventAsync`; the sync form needs Node crypto.
- **Money is integer cents in `orders`/`order_items`**, matching Stripe, while
  `products.price` stays `numeric`. `lib/server/money.ts` is the only conversion point.
- **Prices are never accepted from the client** — the same reasoning that keeps the cart
  cookie holding nothing but ids.
- **`order_items` snapshots name and price, and carries `seller_id`.** A cart can span
  storefronts, so one order can owe money to several creators; the seller's Orders page
  filters on `order_items.seller_id`, and there is no seller column on `orders` to get
  wrong. Joining `products` for a name would let a rename rewrite order history.
- **The buyer pays the list price.** The 2% platform fee is the creator's, out of their
  payout — adding it to the buyer's total would disagree with what Stripe charges (the sum
  of the line items). It is **not** yet deducted anywhere; that needs Stripe Connect.
- **A product is sold once per buyer.** A digital product is delivered, not
  consumed, so a second copy gives the buyer nothing — `hasPurchasedProduct`
  (single) and `listPurchasedProductIds` (batched) gate `addToCart`,
  `checkoutProduct` and `checkoutCart`. **`checkoutCart` is the check that
  counts**: the cart is open to anonymous visitors, so a cart filled while
  signed out and paid for after signing in reaches checkout never having been
  tested. Like the own-products rule beside it, it refuses the whole cart
  rather than dropping the owned lines — charging for less than the cart
  displayed is the worse failure, and each offending row is marked.
  - The UI mirrors it in three places (storefront grid, product page, cart) but
    never enforces it. Note the two badges mean different things: "Your
    product" is the seller, "Owned" is the buyer.
  - **`hasPurchasedProduct` counts `paid` only**, so two checkouts for the same
    product opened within the 30-minute TTL can both pay. Counting `pending`
    too would lock a product behind an abandoned checkout for half an hour,
    which is the worse trade. The clean fix is a refund, and refunds aren't
    wired — see below. One buyer/product pair in the database was bought twice
    before this rule existed; it is left alone, since deleting paid order rows
    would falsify financial history.
- **There is no `purchases` table, and nothing should recreate one.** An earlier
  model wrote one row per buyer/product straight at checkout; it can't express a
  cart spanning several storefronts, so `orders` + `order_items` replaced it.
  The dead table outlived the code by a month because it had been created
  outside the migration system — absent from every snapshot in `drizzle/meta`,
  which is what drizzle-kit diffs against, so `generate` reported "No schema
  changes" while it sat in the database. Dropped by a **custom** migration
  (`20260907160853_drop_orphaned_purchases`), the only way that kind of drift
  reaches an environment it wasn't pushed to. `PurchaseRow` and
  `listPurchasesForBuyer` in `dal/orders.ts` are unrelated: they're a *view* of
  the two live tables, not a table.
- **The buyer's receipt email is sent from the `promoted` branch of
  `fulfillCheckoutSession`** — the one place that runs exactly once per paid order. See
  "Email" for why nothing may be sent outside it.
- The cart is cleared **after** payment, by `clearPurchasedFromCart()` from
  `ClearPurchasedCart` on /downloads — the webhook has no access to the buyer's cookies,
  and a page render can't write one.
- **An abandoned checkout is a `pending` row nobody will ever finish**, and
  `expireStalePendingOrders` is the only thing that clears it. It runs from two
  places: the scheduled sweep (`app/api/cron/expire-orders`, scheduled by
  `vercel.json` every 15 minutes) and an opportunistic seller-scoped sweep on
  /orders that exists so expiry works in development. **Every candidate is asked
  about at Stripe before it is touched** — age alone is equally the signature of
  a late webhook, and a deleted paid order cannot be healed by one.
  - The cron schedule needs a Vercel **Pro** plan; Hobby caps cron invocations
    at once a day, which is far longer than `CHECKOUT_TTL_MINUTES`. On Hobby the
    opportunistic sweep is the only real mechanism and pending rows linger until
    a seller opens /orders.
  - `npm run reconcile:orders` (`scripts/reconcile-orders.ts`) is the read-only
    view of all this: it classifies every pending order against Stripe, and
    separately scans Stripe for **paid sessions with no paid order** — the one
    failure neither the webhook nor the sweep can see, because both start from a
    row and that case is the row being missing. It exits non-zero when it finds
    any. It deliberately writes nothing: the delete/fulfil logic, with its
    `status = 'pending'` catches, must keep exactly one implementation.

**Local webhooks** need the Stripe CLI, or nothing is ever fulfilled:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Put the `whsec_…` it prints in `STRIPE_WEBHOOK_SECRET`. A deployed endpoint has a
*different* secret (Stripe dashboard); the wrong one 400s every delivery.

**Still missing:** delivery. The product file is now really stored (see "The product
file" below), but nothing serves it: /downloads names the file and says the download is
coming. That needs a signed-URL route — `UTApi.getSignedURL(fileKey)` — gated on
`hasPurchasedProduct()`, and ideally the `productFile` route switched to
`acl: "private"` at the same time, since an UploadThing file is publicly addressable by
default. Refunds aren't wired either (the `refunded` status is unused).

## Email (nodemailer + Gmail)

Outbound mail goes through **one function**, `sendEmail()` in `lib/server/email.ts`.
Callers describe *what* to send and never *how*, so replacing Gmail with a real sending
service later touches that file only.

- **Two transports, chosen from the environment.** `GMAIL_USER` + `GMAIL_APP_PASSWORD`
  both set → SMTP through Gmail; anything else → the **console transport**, which prints
  the full envelope and body to the terminal and sends nothing. `EMAIL_TRANSPORT=console`
  forces the fallback even with credentials present, for working against production-shaped
  config without mailing real people.
- **The fallback is the development default, not a stub.** A developer with no credentials
  gets a working app whose emails land in the terminal, so copy and merge fields can be
  checked before any account exists. Nothing about a missing credential may block the
  signup or checkout that triggered the email.
- **`sendEmail` never throws.** Every caller sits on a path where mail is the least
  important thing happening — an order was just paid, an account was just created — and a
  mail server having a bad minute must not fail the write that earned the email. A refused
  send is logged and returns `{ sent: false }`.
- **That swallowing is why `verifyEmailTransport()` exists.** A wrong app password would
  otherwise be invisible until real messages quietly stopped arriving; `verify()` opens and
  closes an SMTP connection and gives a straight answer.
- **The credential is a Google *app password*, not the account password.** Google refuses
  plain passwords over SMTP. Generate a 16-character one under Account → Security →
  2-Step Verification → App passwords (2-Step Verification must be on).
- **`EMAIL_FROM` sets the display name, not the sender.** Gmail rewrites the address to the
  authenticated account unless it's a verified alias — don't expect it to change who the
  mail appears to come from.
- **The transporter is a module-level singleton.** A transporter per send would mean a
  fresh TLS handshake and Gmail login for every message; module scope survives across
  requests in a warm server and is simply rebuilt on a cold start.
- `text` is required and `html` optional. A plain-text part is what every client renders
  and what keeps a message out of the spam folder an HTML-only body invites.

**Testing it:** `app/api/dev/test-email/route.ts` sends one throwaway message.

```bash
curl "localhost:3000/api/dev/test-email?to=you@example.com"
```

It **404s in production** rather than 403ing: an endpoint that mails an arbitrary address
on an unauthenticated GET is an open relay for whoever finds it, and the safest deployed
version of it is one that doesn't appear to exist.

### What sends mail

**One thing today: the buyer's order receipt**, composed in
`lib/server/emails/order-receipt.ts`. Email bodies live under `lib/server/emails/`, one
file per message, and their copy lives in `strings.email.*` with the rest of the
user-facing text — an email is read by a person exactly like a page is.

- **It is sent from the `promoted` branch of `fulfillCheckoutSession`, and nowhere else.**
  That branch is the only point in the app that runs exactly once per paid order, because
  the webhook and the return-URL reconciliation both funnel through `markOrderPaid` and its
  `status = 'pending'` predicate lets only one of them win. Move the call outside it and
  Stripe's ordinary event redelivery mails the buyer the same receipt again.
- **It goes to `orders.email`**, the address recorded at checkout, not the account address —
  the buyer can change the recipient on Stripe's own page and the receipt should follow.
- **The send is awaited, not fired and forgotten.** A serverless runtime can freeze the
  process the moment the handler returns, which would cut off an in-flight SMTP
  conversation. The cost is a webhook as slow as one SMTP round trip.
- **It reads through `getOrderBySession()`, the un-scoped lookup.** The webhook is a request
  from Stripe and has no session to scope by. That function must not gain a caller whose
  argument comes from a request the buyer controls — the buyer-scoped
  `getOrderForBuyerBySession` exists for those.
- **This is not the charge receipt.** Stripe sends that one if enabled in the dashboard.
  This is the delivery notice, and its job is the link to the library.
- **The HTML part escapes product names and styles inline.** Names are seller-controlled
  free text and this is the one place in the app where such a string is concatenated into
  markup instead of rendered by React. Mail clients strip `<style>` blocks and load no
  external stylesheet, so the app's Tailwind tokens cannot reach here.

Also wired: the password reset link, from Better Auth's `sendResetPassword` hook — see
"Password reset" under Authentication.

Not wired: a seller "you made a sale" notice, and welcome mail. The seller one needs a new
query, since the order lines aren't grouped by `seller_id` at the moment fulfilment runs.

## Analytics (PostHog)

**One funnel, five events, declared in `lib/analytics/events.ts`** — the shared vocabulary
both the browser and the server import. An event name is the join between a client capture
and a server one, and a typo in either half doesn't fail a build; it produces a funnel step
that is silently always zero.

```
storefront_viewed → product_viewed → product_added_to_cart → checkout_started → purchase_completed
```

- **`purchase_completed` is captured on the server**, in the same `promoted` branch of
  `fulfillCheckoutSession` as the receipt email, and for the same reason: the buyer can
  close the tab the moment the card clears. A browser-side purchase event measures who
  waited for a redirect, not who paid.
- **The distinct id is the user id on both sides.** `analyticsDistinctId()` exists so there
  is one place that decides that. The browser identifies with it while browsing; the
  webhook captures step 5 with the `buyerId` Stripe echoes back in session metadata. Break
  this and every funnel drops to zero at the last step while raw event counts look fine.
- **`captureImmediate`, not `capture`, on the server.** The queued form flushes later,
  which on a serverless host means never — the process is frozen when the handler returns.
  The only caller is the webhook, so the wrong one would work locally and lose every
  purchase in production.
- **Identity is attached by pages, not by the provider.** `TrackEvent` takes a `userId`
  from pages that already read the session for their own reasons, so no page gains a query
  or a fetch. Reading the session in the root provider would add one to every route in the
  app to serve a funnel spanning four of them.
- **`TrackEvent` fires once, guarded by a ref.** Strict mode invokes effects twice, which
  would double the view steps while leaving the later ones alone — a conversion rate wrong
  by half, visible only in development.
- **Autocapture is off, and dead clicks are turned off separately.** Every funnel step is
  captured explicitly at the moment the thing happened; a stream of unanalysed clicks would
  only make the five events that matter harder to find. `capture_dead_clicks` defaults to
  `undefined`, which means "ask the project's remote config" — so `autocapture: false`
  does **not** stop `$dead_click`, and the same is true of heatmaps and rageclicks. Each
  has to be named to be silenced.
- **Pageviews are on, as `capture_pageview: "history_change"`.** PostHog's Web Analytics
  (Visitors, sessions, bounce rate) is built entirely from `$pageview` and is empty without
  it, however many funnel events arrive. Plain `true` fires once per full page load, and
  the App Router navigates client-side — a visitor going from storefront to product would
  count once. `$pageleave` follows automatically, which is what gives a session a duration
  rather than leaving every visit open-ended.
- **No key means console logging, not breakage.** Same posture as the mail transport: the
  funnel can be walked and checked before a PostHog project exists. Nothing user-facing may
  depend on a capture having happened — ad blockers make a failed capture the normal case,
  which is also why both helpers swallow their errors.
- `NEXT_PUBLIC_POSTHOG_KEY` is reused server-side rather than adding a second variable. A
  project API key is write-only and already ships in the browser bundle, so a private copy
  would protect nothing and would let the two halves of one funnel point at different
  projects.
- `checkout_started` carries `source` (`product_page` or `cart`), since two routes reach it.

## File uploads (UploadThing)

Both a product's cover images and the product file itself upload straight from
the browser to UploadThing — the bytes never pass through this server.

- Endpoints live in `app/api/uploadthing/core.ts`; the handler is `route.ts`
  beside it. Add a route there, not a new API path.
- **The `.middleware()` is the only authorization point.** Since the upload
  bypasses this server, nothing downstream can reject it. Read the session with
  `getSession()` — not `requireUser()`, whose redirect surfaces to the uploader
  as an opaque failure — and throw
  `new UploadThingError({ code: "FORBIDDEN", … })`. Without an explicit `code`
  the error defaults to a **500**, which the client can't tell from an outage.
- **Store `file.ufsUrl`.** `file.url` and `file.appUrl` are deprecated in v7 and
  are removed in v9.
- **`products.image_urls` is `varchar(512)[] NOT NULL DEFAULT '{}'`** — an array,
  and never NULL. No images is `[]`, so reads never branch on NULL before
  indexing and `imageUrls[0]` is just `undefined`. **Order is meaningful: the
  first entry is the cover** everywhere it's rendered.
- The per-product cap is `MAX_PRODUCT_IMAGES` in `lib/schemas/product.ts`. The
  endpoint's `maxFileCount` only caps one *batch* — the zod `.max()` checked in
  the server action is the real ceiling.
- Uploads write into a *form value*, never a row: nothing is persisted until the
  creator submits, so an abandoned form doesn't mutate the catalog. Removing an
  image only drops it from the array — the file stays on UploadThing. Reaping
  those leftovers is a **separate, manual** job: `npm run cleanup:orphans`
  (`scripts/cleanup-orphans.ts`) diffs `UTApi.listFiles()` against every key the
  DB still names and deletes the difference. It is a dry run unless passed
  `-- --delete`. Two rules in it are load-bearing and easy to "fix" wrongly: it
  reads `products` **without** the `deleted_at is null` filter, because a
  soft-deleted product's file is still served to buyers who paid for it, and it
  spares anything uploaded in the last 24h (`--grace-hours`), because a creator
  with a half-filled form is holding uploads that are unreferenced only until
  they hit Save.
- Client code uses `useUploadThing` from `lib/uploadthing.ts`, whose
  `UploadRouter` import **must stay `import type`** — a value import would drag
  `lib/server/*` into the browser bundle. The prebuilt `UploadButton` /
  `UploadDropzone` are deliberately unused: they ship their own stylesheet and
  `ut-*` class API, which fights the token-based Tailwind v4 setup here, and
  `UploadDropzone` would replace the whole control instead of slotting into it.
  **Drag-and-drop is native** — `onDragEnter`/`Over`/`Leave`/`Drop` on the field
  in `components/dashboard/product-image-field.tsx`. Two non-obvious bits:
  `onDragOver` must call `preventDefault()` or the browser refuses the drop and
  navigates to the file, and enters must be counted against leaves or the
  highlight flickers as the cursor crosses child elements.
- `next.config.ts` pins `images.remotePatterns` to this app's own UploadThing
  subdomain and `/f/**`, so the optimizer can't be aimed at another tenant.

### The product file

The digital product itself goes through the **`productFile`** route, kept
separate from `productImage` because almost none of the rules match: any file
type, exactly one, ~25× the size cap. Sharing an endpoint would apply the
loosest of each rule to both.

- **100 MB is enforced twice, and by neither of the obvious places.**
  UploadThing types `maxFileSize` as a *power of two* plus a unit, so `"100MB"`
  doesn't compile and `"64MB"` would reject files the requirement allows. The
  route declares `"128MB"` as UploadThing's own backstop; the real limit is
  `MAX_PRODUCT_FILE_BYTES` in `lib/schemas/product.ts`, checked in the field
  (so nobody watches 400 MB upload before it's refused) and again in the
  route's `.middleware()`, which receives the declared `files` before any bytes
  move and is the copy the browser can't skip. Change all three together.
- **Three columns, and no URL:** `file_key`, `file_name`, `file_size`. The
  public `https://<appId>.ufs.sh/f/<key>` address is derivable from the key and
  deliberately not stored, so no component can render an ungated download link
  by reaching for a convenient column. Delivery mints a signed URL from the key
  per request.
- **The columns are nullable but `productSchema` requires a file.** Products
  created before this feature have none, and a NOT NULL column would have
  needed a lie to backfill them. Every save from now on attaches one —
  including editing an old product, which is the intended nudge.
- **`file` is the one field whose zod input and output types differ.** In it's
  going in it's `ProductFile | null` (a form starts empty); coming out the
  refine rules null away, so
  the server action gets a guaranteed file. That's why `ProductForm` is
  `useForm<ProductInput, unknown, ProductValues>` and why the field components
  take `Control<ProductInput>`.
- Picking a second file **replaces** the first — the product is a single
  download — and a multi-file drop is rejected rather than silently taking one.
  Removing a file only detaches it; the upload stays on UploadThing, like a
  removed image.
- An UploadThing file is **publicly addressable by default**. Nothing links it
  today, but the delivery work should set `acl: "private"` on this route
  (needs the app's dashboard to allow private files) so the signed URL is the
  only way in, not just the polite one.

### Rendering images

**Never import `next/image` directly.** Every image goes through the wrapper at
`components/image.tsx` (`import { Image } from "@/components/image"`), so the
implementation is swappable from one file. It's a pass-through over `next/image`
for now, with one addition:

- **A size hint is mandatory** — the props are a union of `fill` or
  `width` + `height` *together*. `next/image` leaves all three optional (a
  static import supplies them, `fill` makes them moot), which lets a remote
  `src` compile with no reserved space and reflow the page when it decodes.
  Every image here is remote, so the union closes that hole. Passing `fill`
  alongside dimensions is also rejected — pick one.
- `width`/`height` are the **intrinsic** pixel size, used only for the aspect
  ratio the browser reserves; CSS still sets the rendered size. So
  `width={36} height={36}` next to `className="size-9"` is correct, not a
  contradiction.
- Pass `sizes` whenever the rendered box isn't viewport-wide, or the browser
  fetches a variant far larger than it paints. It also switches Next from a
  1x/2x `srcset` to a full width-based one.
- Remote hosts must be listed in `images.remotePatterns` (see above).

**LCP images:** use `loading="eager"` + `fetchPriority="high"`, not `preload` —
the Next 16 docs say not to combine `preload` with either, and `priority` is
deprecated in favour of `preload`. `ProductCover` exposes this as `eager`, and
**at most one image per page should set it**, or the priority signal stops
discriminating. Today the only caller is `ProductGallery`, which marks slide 0
— the detail page's LCP element — and leaves the rest lazy.

Product cover art doesn't call `Image` at the page level: it goes through
`ProductCover`, which falls back to a seeded gradient when the product has no
image. `AvatarImage` (Base UI) is exempt — it renders a raw `<img>` for
arbitrary remote avatars that `remotePatterns` doesn't cover.

### Server-only code

Anything under `lib/server/` starts with `import "server-only"` and must never reach a
client bundle. If a Client Component needs something from there, either pass it as a prop
from a Server Component, or extract the shared part to a neutral module — that's exactly
why `lib/schemas/` sits outside `lib/server/`.

## UI components (shadcn — Base UI variant)

This is **not** the Radix-based shadcn. Config lives in `components.json`
(`style: "base-luma"`, `iconLibrary: "phosphor"`). Key API differences:

- **Polymorphism uses the `render` prop**, not `asChild`. To render a `Button` as a link:
  ```tsx
  <Button nativeButton={false} render={<Link href="/dashboard" />}>Go</Button>
  ```
  `nativeButton={false}` is required when the underlying element is not a `<button>`.
- Add new primitives with the **shadcn CLI** (`npx shadcn@latest add <name>`) rather than
  hand-writing them. **Installed:** `alert-dialog`, `avatar`, `badge`, `button`,
  `card`, `carousel`, `input`, `navigation-menu`, `separator`, `sheet`, `sidebar`,
  `skeleton`, `table`, `tabs`, `textarea`, `tooltip`. **Not installed:** `form`,
  `label`, `dropdown-menu` — compose with what exists plus semantic HTML (e.g. a
  plain `<label htmlFor>`).
- **The CLI's own `npm install` will fail here.** It doesn't pass
  `--legacy-peer-deps`, which this project's prereleases require, so install a
  new primitive's dependencies first (`npm install <dep> --legacy-peer-deps`),
  then run `npx shadcn@latest add <name> --yes`. Don't pass `--overwrite` unless
  you mean it — without it the CLI skips primitives you already have.
- `carousel` is Embla-based (`embla-carousel-react`). Its generated file trips
  the `react-hooks/set-state-in-effect` lint rule on line 98, the same rule
  `hooks/use-mobile.ts` trips — it comes from the registry, not from this repo.
- Treat `components/ui/*` as generated — prefer `className` overrides and composition over
  editing them.

### Icons (Phosphor)

- Use the **`Icon`-suffixed** exports: `HouseIcon`, `ReceiptIcon`, `TrendUpIcon`, etc.
- **Server Components must import from `@phosphor-icons/react/dist/ssr`**
  (the default `@phosphor-icons/react` entry is client-only).
- Client Components import from `@phosphor-icons/react`.

## Styling approach

- **Tailwind v4, CSS-first.** All config is in `app/globals.css` via `@import "tailwindcss"`
  and an `@theme inline { … }` block. There is **no `tailwind.config.js`** — do not create
  one; add design tokens in `globals.css`.
- **Design tokens are semantic** and defined as **oklch** CSS variables (mauve neutrals,
  teal-ish `--primary`). Style with token utilities — `bg-card`, `text-muted-foreground`,
  `border`, `bg-primary`, `text-destructive` — **not** raw palette colors, so light/dark
  stay consistent.
- **Dark mode** is class-based: `@custom-variant dark (&:is(.dark *))`. Provide `dark:`
  variants where a token isn't already theme-aware.
- **Rounded, soft aesthetic:** the radius scale goes up to `rounded-4xl`; cards/inputs use
  large radii and subtle rings (`ring-foreground/5`). Match that when adding surfaces.
- `--font-heading` maps to Public Sans; use `font-heading` for headings/titles.
- **Always merge classes with `cn()`** from `@/lib/utils` (clsx + tailwind-merge).

## Copy & UI strings

User-facing text is centralized in **`constants/strings.ts`** — a single `strings` object,
**grouped by domain** (`common`, `login`, `signup`, `dashboard`, `account`, `store`,
`marketing`, `validation`, `errors`) and exported `as const`. Import it as
`@/constants/strings` and reference copy through it (`{strings.login.title}`) instead of
hardcoding literals in JSX.

- Add new copy under the relevant group; reuse `common` / `validation` / `errors` for
  shared text rather than duplicating strings.
- Placeholders are `{name}`-style and filled with `.replace("{name}", value)`.
- Prefer wiring **zod messages** to `strings.validation.*` (e.g. `invalidEmail`,
  `handleFormat`) so validation copy stays in one place.

## Forms & validation strategy

Standard stack is **react-hook-form + zod**, wired directly (no shadcn `Form` wrapper,
since that primitive isn't installed). Pattern — see `app/(auth)/signup/page.tsx` and
`components/dashboard/handle-form.tsx`:

1. Define a **zod schema as the single source of truth**, in **`lib/schemas/`** — one file
   per domain (`auth.ts`, `handle.ts`, `product.ts`), exporting the schema *and* its
   `z.infer` type. Never declare a schema inline in a page, component or action: client
   and server both import it from there, which is the only way they can't drift.
   - The folder sits outside `lib/server/` on purpose so Client Components can import it.
     Nothing in it may pull from `lib/server/` — keep it free of DB and auth imports.
   - Use zod v4 **top-level format helpers** (`z.email()`, `z.url()`, …). The method forms
     (`z.string().email()`) are **deprecated** in v4.
   - Wire messages to `strings.validation.*`, don't inline literals.
2. `useForm({ resolver: zodResolver(schema), defaultValues })`.
3. Register fields with `{...register("field")}` (drop manual `name`/`required`).
4. Surface errors under the field **and** set `aria-invalid={!!errors.field}` on the
   `Input` — the `Input` primitive already renders a destructive ring from `aria-invalid`.
5. Put `noValidate` on the `<form>` so zod owns validation (not the browser), and gate the
   submit button on `formState.isSubmitting`.
6. For server round-trips, have the action return a **result object**
   (`{ ok: true, … } | { ok: false, error }`) and feed failures back with
   `setError("field", { message })`. Don't throw for expected outcomes like a taken handle.

## Project-specific rules (quick reference)

- **Obey `@AGENTS.md`:** read `node_modules/next/dist/docs/` before writing framework code.
- **Verify with `npm run build`** — and for DB work, actually query the database.
- **Typed routes won't catch a dead single-segment link** (`/[handle]` swallows it) — check
  top-level routes exist yourself; use `as const` for nav arrays and route ternaries.
- **Server pages:** import Phosphor icons from `.../dist/ssr`.
- **No `tailwind.config.*`** — theme lives in `app/globals.css`.
- **Style with semantic tokens + `cn()`**, not raw colors or string concatenation.
- **Add shadcn primitives via the CLI**; don't hand-roll or heavily edit `components/ui/*`.
- **Base UI API:** `render` prop (+ `nativeButton={false}`) for polymorphism, not `asChild`.
- **User-facing copy lives in `constants/strings.ts`** — reference it, don't hardcode text.
- **Images render through `@/components/image`**, never `next/image` directly.
- **Auth checks live in layouts**; read sessions through `lib/server/dal/session.ts`.
- **Server Actions take identity from the session**, never from client-supplied ids.
- **Queries live in `lib/server/dal/`**, wrapped in React `cache()`.
- **Funnel events come from `ANALYTICS_EVENTS`** in `lib/analytics/events.ts` — never a
  literal string, and `purchase_completed` is captured server-side only.
- **Zod schemas live in `lib/schemas/`** — never inline in a page, component or action.
- **Email goes through `sendEmail()`** in `lib/server/email.ts` — never a transporter of
  your own; it falls back to the terminal when Gmail credentials are absent.
