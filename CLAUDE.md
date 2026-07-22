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
  (app)/                          # Seller app. layout.tsx gates the whole group on a session
    layout.tsx                    # requireUser() + SidebarProvider + AppSidebar + TooltipProvider
    dashboard/page.tsx            # "/dashboard" → KPI cards, recent orders, Account tab
    dashboard/actions.ts          # Server Actions for the dashboard (updateHandle)
    products|orders|customers|analytics|wishlist|downloads/page.tsx   # placeholder screens
  (store)/                        # Public buyer-facing storefronts
    layout.tsx                    # bare flex shell only — no nav/footer (see StoreChrome)
    [handle]/layout.tsx           # resolves the creator from the DB, 404s if unknown
    [handle]/page.tsx             # "/:handle"             → creator profile + product grid
    [handle]/[id]/[slug]/page.tsx # "/:handle/:id/:slug"   → product detail + checkout
    checkout/success/page.tsx     # "/checkout/success?p=&s="
  api/auth/[...all]/route.ts      # Better Auth handler (GET/POST)
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
  utils.ts                # cn() class-merge helper, getInitials()
  auth-client.ts          # Better Auth React client (browser)
  schemas/                # ALL zod schemas — shared client + server (see "Forms & validation")
    auth.ts               # signupSchema, loginSchema
    handle.ts             # handleSchema + HANDLE_MIN/MAX_LENGTH
    product.ts            # productSchema
  store-data.ts           # PLACEHOLDER product data (not from the DB yet)
  server/                 # server-only modules (see "Server-only code")
    auth.ts               # Better Auth config (Drizzle adapter, handle generation hook)
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
- **Products are still placeholder data** in `lib/store-data.ts` — a `products` table
  exists (`schemas/product.ts`) and `dal/products.ts` is a stub returning `[]`. Storefront
  product grids are not live yet; the creator identity around them is.
- There is no `bio` column on `user`; the storefront shows `@handle` under the name rather
  than inventing copy. Adding one means a schema change + migration.

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
  hand-writing them. **Installed:** `avatar`, `badge`, `button`, `card`, `input`,
  `navigation-menu`, `separator`, `sheet`, `sidebar`, `skeleton`, `table`, `tabs`,
  `tooltip`. **Not installed:** `form`, `label`, `dropdown-menu` — compose with what exists
  plus semantic HTML (e.g. a plain `<label htmlFor>`).
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
- **Auth checks live in layouts**; read sessions through `lib/server/dal/session.ts`.
- **Server Actions take identity from the session**, never from client-supplied ids.
- **Queries live in `lib/server/dal/`**, wrapped in React `cache()`.
- **Zod schemas live in `lib/schemas/`** — never inline in a page, component or action.
