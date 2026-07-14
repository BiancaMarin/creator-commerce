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
| Class utils   | `clsx` + `tailwind-merge` (via `cn()`), `class-variance-authority` |

## Commands

```bash
npm run dev     # next dev (Turbopack)
npm run build   # next build — run this to typecheck + validate routes before finishing
npm run lint    # eslint (eslint-config-next)
```

There is no test runner configured. **`npm run build` is the verification gate**: it runs
TypeScript, regenerates typed-route definitions, and prerenders every page. Run it after
non-trivial changes.

## Folder structure

```
app/
  layout.tsx              # Root layout: <html>/<body>, fonts (Geist, Geist Mono, Public Sans)
  globals.css             # Tailwind v4 + theme tokens (see "Styling")
  (app)/                  # Route group — shares the dashboard shell (sidebar + header)
    layout.tsx            # SidebarProvider + AppSidebar + SiteHeader + TooltipProvider
    page.tsx              # "/"          → welcome landing
    dashboard/page.tsx    # "/dashboard" → KPI cards, recent orders, top products
    login/page.tsx        # "/login"     → auth form (react-hook-form + zod)
components/
  ui/                     # shadcn primitives (Base UI wrappers) — treat as generated
  app-sidebar.tsx         # Left nav (client; uses usePathname for active state)
  site-header.tsx         # Top bar with NavigationMenu (client)
constants/
  strings.ts              # Centralized user-facing copy (see "Copy & UI strings")
hooks/                    # e.g. use-mobile.ts
lib/
  utils.ts                # cn() class-merge helper
```

Import alias: **`@/*` → project root** (e.g. `@/components/ui/button`, `@/lib/utils`,
`@/hooks/use-mobile`). Always use `@/…`, never long relative paths.

## Routing & layouts

- **App Router only.** `(app)` is a *route group*: it does not appear in the URL, but its
  `layout.tsx` wraps every page in the sidebar + header shell. Pages that should live
  inside the app chrome go under `app/(app)/`.
- **Typed routes are enabled** (Next 16 default). A `<Link href="...">` must point to a
  route that actually exists, or `next build`/`tsc` fails. Do not link to routes you
  haven't created — use an existing route as a placeholder and leave a `// TODO`.
- Redirect from a page with `redirect()` from `next/navigation` (server-side).
- The `/login` route currently sits **inside** the `(app)` shell, so it inherits the
  sidebar/header. If a chrome-free auth screen is wanted, move it to its own route group
  (e.g. `app/(auth)/login/`) with a minimal layout.

## Server vs. Client Components

- **Server Components are the default.** Only add `"use client"` when a file needs
  interactivity or client APIs: `useState`, `usePathname`, `useForm`, event handlers, etc.
- `dashboard/page.tsx` is a **Server Component** (static data, exports `metadata`).
- `login/page.tsx`, `app-sidebar.tsx`, `site-header.tsx` are **Client Components**.
- Client Components can be rendered inside Server Components — that's expected and cheap.
  Most `components/ui/*` primitives are `"use client"` because Base UI is a client layer;
  importing them into a Server page is fine.

## UI components (shadcn — Base UI variant)

This is **not** the Radix-based shadcn. Config lives in `components.json`
(`style: "base-luma"`, `iconLibrary: "phosphor"`). Key API differences:

- **Polymorphism uses the `render` prop**, not `asChild`. To render a `Button` as a link:
  ```tsx
  <Button nativeButton={false} render={<Link href="/dashboard" />}>Go</Button>
  ```
  `nativeButton={false}` is required when the underlying element is not a `<button>`.
- Add new primitives with the **shadcn CLI** (`npx shadcn@latest add <name>`) rather than
  hand-writing them. **Not currently installed:** `form`, `label`, `badge`, `table`,
  `avatar`, `dropdown-menu`. Compose with what exists (`Card`, `Button`, `Input`,
  `Separator`, `Skeleton`, `Sidebar`, `Sheet`, `NavigationMenu`, `Tooltip`) plus semantic
  HTML (e.g. a plain `<label htmlFor>` since there's no `Label` primitive).
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
**grouped by domain** (`common`, `login`, `signup`, `validation`, `errors`) and exported
`as const`. Import it as `@/constants/strings` and reference copy through it
(`{strings.login.title}`) instead of hardcoding literals in JSX.

- Add new copy under the relevant group; reuse `common` / `validation` / `errors` for
  shared text rather than duplicating strings.
- Prefer wiring **zod messages** to `strings.validation.*` (e.g. `invalidEmail`,
  `passwordMin`) so validation copy stays in one place.

## Forms & validation strategy

Standard stack is **react-hook-form + zod**, wired directly (no shadcn `Form` wrapper,
since that primitive isn't installed). Pattern — see `app/(app)/login/page.tsx`:

1. Define a **zod schema as the single source of truth**; derive the type with `z.infer`.
   - Use zod v4 **top-level format helpers** (`z.email()`, `z.url()`, …). The method forms
     (`z.string().email()`) are **deprecated** in v4.
2. `useForm({ resolver: zodResolver(schema), defaultValues })`.
3. Register fields with `{...register("field")}` (drop manual `name`/`required`).
4. Surface errors under the field **and** set `aria-invalid={!!errors.field}` on the
   `Input` — the `Input` primitive already renders a destructive ring from `aria-invalid`.
5. Put `noValidate` on the `<form>` so zod owns validation (not the browser), and gate the
   submit button on `formState.isSubmitting`.

## Authentication approach

Auth is **not yet implemented** — the UI exists, the backend does not:

- `login/page.tsx` collects and validates `email` / `password`, but `onSubmit` is a
  `// TODO` (currently logs values). No auth/session library is installed.
- The **Google / GitHub** buttons are visual placeholders (no OAuth wired).
- "Forgot password?" and "Sign up" links point to `/login` as placeholders (no such routes
  exist yet, and typed routes forbid dead links).

When implementing auth, document the chosen library/session strategy here and replace the
`onSubmit` TODO. Prefer server-side auth (Server Action or route handler) over exposing
secrets to the client.

## Project-specific rules (quick reference)

- **Obey `@AGENTS.md`:** read `node_modules/next/dist/docs/` before writing framework code.
- **Verify with `npm run build`** before declaring work done.
- **Never add a `<Link>` to a non-existent route** (typed routes will fail the build).
- **Server pages:** import Phosphor icons from `.../dist/ssr`.
- **No `tailwind.config.*`** — theme lives in `app/globals.css`.
- **Style with semantic tokens + `cn()`**, not raw colors or string concatenation.
- **Add shadcn primitives via the CLI**; don't hand-roll or heavily edit `components/ui/*`.
- **Base UI API:** `render` prop (+ `nativeButton={false}`) for polymorphism, not `asChild`.
- **User-facing copy lives in `constants/strings.ts`** — reference it, don't hardcode text.
