# Creator Commerce — Design System

A design system for **Creator Commerce**, a multi-user SaaS where creators sell digital
products: each creator gets a public storefront, publishes digital products, takes payments
through Stripe, and delivers protected downloads to buyers. The product is a Next.js 16 app
with a **shadcn (Base UI "base-luma" variant) + Tailwind v4** component layer.

This system captures that product's real visual foundations (tokens copied verbatim from the
codebase), its component primitives, and click-through recreations of its core surfaces.

## Sources

Everything here is grounded in one repository — explore it to build more faithfully:

- **GitHub:** https://github.com/BiancaMarin/creator-commerce (branch `main`)
  - `app/globals.css` — the source of every color / radius token (oklch).
  - `app/layout.tsx` — fonts (Public Sans, Geist, Geist Mono via `next/font/google`).
  - `components/ui/*` — the shadcn Base UI primitives (button, card, input, separator, skeleton, tooltip, sidebar, sheet, navigation-menu).
  - `app/(app)/dashboard/page.tsx`, `login/page.tsx`, `page.tsx` — the built screens recreated in the UI kits.
  - `docs/designs/site-tree.md` — the full map of 29 screens across 10 page templates and 4 shells.
  - `CLAUDE.md`, `constants/strings.ts` — engineering conventions and canonical copy.

Reading the repo directly will let an agent recreate additional templates (record detail,
settings tabs, analytics) beyond the kits shipped here.

---

## Content fundamentals

How Creator Commerce writes copy (from `constants/strings.ts` and the built screens):

- **Voice — second person, warm, direct.** The app talks to the seller as *you* / *your*:
  "Here's how **your** storefront is performing this month." Never first person, never corporate "we".
- **Sentence case everywhere.** Headings, buttons, nav, card titles: "New product", "Recent
  orders", "View analytics", "Top products" — only the first word and proper nouns
  (Stripe, Google, GitHub) are capitalized. Never Title Case or ALL-CAPS.
- **Short, action-first labels.** Buttons are verbs or verb phrases: "Sign in", "Export",
  "New product", "View all", "Buy now", "Download files". No "Click here", no trailing punctuation.
- **Titles are nouns; subtitles are one plain sentence.** e.g. Title "Dashboard" →
  subtitle "Here's how your storefront is performing this month." Title "Products" →
  "Manage your catalog of digital products."
- **Contractions are welcome** ("Here's", "Don't have an account?") — it reads human, not stiff.
- **Helper & validation text is calm and specific:** "Please enter a valid email address.",
  "Password must contain at least 8 characters.", "Invalid email or password." Errors state
  the fix, not blame.
- **Money & counts** are shown as compact numerals with the currency glyph: `$48,120`,
  `1,204`, `3.2%`, `+12.4%`. Rendered in the mono font for tabular alignment.
- **No emoji, no exclamation-mark hype.** Tone is confident and quiet — a professional tool
  for people running a business. Marketing lines stay grounded: "The storefront built for
  creators. Track revenue, manage orders, and grow your audience — all in one place."

---

## Visual foundations

- **Color.** oklch throughout. Neutrals are subtly **mauve-tinted** (shadcn `baseColor: mauve`)
  rather than pure gray. The single brand hue is a **muted teal** `--primary`
  (`oklch(0.52 0.105 223)`). Data-viz uses a separate **lime → deep-green** ramp
  (`--chart-1…5`). Status colors: emerald (success/paid), amber (warning/pending), red
  (destructive/failed). Backgrounds are flat white (light) / near-black mauve (dark) — **no
  gradients in the product UI** (gradients appear only as placeholder product covers in the
  storefront kit). Max one or two surface tones per screen: `--background` and `--card`.
- **Type.** Two families: **Public Sans** for everything (UI, body, and headings via
  `--font-heading`) and **Geist Mono** for numerals, prices, IDs and code. Headings are
  `font-weight: 600` with `letter-spacing: -0.02em` (tracking-tight); body is 14px regular.
  No serif, no display face.
- **Spacing.** Tailwind's 0.25rem base step. Cards pad `24px` (`--card-spacing`), dense KPI
  tiles pad `16px`. Page content sits in a `24px` padded scroll area.
- **Corner radii — soft and generous.** Base `--radius` is `0.45rem`, scaled up to
  `--radius-4xl` (~18.7px) used on **cards and buttons**; inputs use `--radius-3xl` (~15.8px);
  badges/avatars/pills are fully round. This large-radius softness is the most recognizable
  trait of the brand.
- **Borders & elevation.** Hairline `1px` borders in `--border`. Cards combine a soft
  `shadow-md` **with a hairline ring** (`ring-foreground/5`) — never a hard border. Inputs
  have no border at rest (transparent border over a translucent fill).
- **Fills & transparency.** Inputs use a translucent fill (`input/50`); status badges and
  soft buttons use `color-mix(... transparent ...)` tints of their semantic color. The
  sticky header uses `background/80` + `backdrop-filter: blur` (the one place blur appears).
- **Hover / press.** Hover = a shift toward muted or a transparency change (primary buttons
  fade to 80% opacity; ghost/outline pick up a `--muted` background). **Press = the button
  translates down 1px** (`active:translate-y-px`) — a tactile signature, no scale/shrink.
  Focus = a 3px ring in `--ring/30` plus a solid ring-colored border.
- **Motion.** Restrained. `transition: all .15s ease` on interactive elements; the sidebar
  width eases at `.18s`; skeletons pulse opacity on a 2s loop. No bounces, no springy
  overshoot, no entrance animations.
- **Layout.** Seller app = fixed left sidebar (collapses to a 60px icon rail with tooltips) +
  sticky top header + scrolling content. Public store = sticky top nav + centered
  max-width content + footer. Cards are the universal container.
- **Imagery.** The product ships no photography; digital-product covers are represented by
  flat brand-gradient tiles with a Phosphor glyph. Keep any real imagery warm and clean to
  match the teal/lime palette.

---

## Iconography

- **Phosphor Icons** is the product's icon system (`@phosphor-icons/react`, regular weight).
  It is the only icon set — no other libraries, no custom SVG icon drawing, **no emoji**, no
  unicode-glyph icons.
- In this design system the icons are loaded from the **Phosphor web CDN**
  (`@phosphor-icons/web`) and used as `<i class="ph ph-{name}">` in the HTML cards and UI
  kits — the visual equivalent of the React `{Name}Icon` exports.
- Common glyphs seen in the product: `ph-house`, `ph-package`, `ph-receipt`, `ph-users`,
  `ph-chart-line`, `ph-gear`, `ph-storefront`, `ph-currency-dollar`, `ph-trend-up` /
  `ph-trend-down`, `ph-plus`, `ph-export`, `ph-arrow-up-right`, `ph-eye` / `ph-eye-slash`,
  `ph-google-logo`, `ph-github-logo`, `ph-lifebuoy`.
- Icons render at 1rem inside buttons and ~1.05rem in nav. Keep the regular weight for
  consistency; use a muted foreground color for decorative/inline icons.
- **The source repo ships no logo**, so an original mark was designed for this system: a
  **nested-“C” monogram** (Creator · Commerce) in `assets/logo-mark.svg` (currentColor) and
  `assets/logo-tile.svg` (white on a teal rounded tile). Use the tile lockup in chrome
  (sidebar, auth, storefront nav) and the bare mark where color is inherited. See the
  **Brand › Logo** specimen card for variants and favicon sizing.

---

## Fonts

Public Sans, Geist Mono (and Geist) are the product's real fonts, loaded here via the
**Google Fonts CDN** in `tokens/fonts.css` rather than bundled binaries. These are the exact
families the product uses — not substitutes. If you'd prefer self-hosted binaries, ask and
they can be added as `@font-face` files.

---

## Components

Reusable primitives, mirroring the source's `components/ui/*`. Import from
`window.CreatorCommerceDesignSystem_8efbba` in card/kit HTML.

- **Button** (`components/buttons/`) — default / outline / secondary / ghost / destructive / link; sizes xs–lg + icon.
- **Input** (`components/inputs/`) — soft-filled text field with `aria-invalid` error ring.
- **Card** (+ `CardHeader/Title/Description/Action/Content/Footer`) (`components/surfaces/`) — the base surface.
- **Badge** (`components/surfaces/`) — status pill (success / warning / destructive / neutral / primary / outline).
- **Avatar** (`components/surfaces/`) — round image or initials fallback.
- **Separator** (`components/feedback/`) — hairline divider.
- **Skeleton** (`components/feedback/`) — loading placeholder.
- **Tooltip** (`components/feedback/`) — dark hover/focus hint bubble.

**Intentional additions** (not installed as shadcn primitives in the source, but used inline
there and factored out because the site-tree's list/detail templates reuse them):
**Badge** (status pills) and **Avatar** (initials circles).

---

## UI kits

Interactive recreations of the product's core surfaces (in `ui_kits/`):

- **Seller App** (`ui_kits/seller-app/`) — collapsible sidebar + header shell with Dashboard
  (KPIs, recent orders, top products), Products table, Orders table, Customers table.
- **Auth** (`ui_kits/auth/`) — centered sign-in / sign-up card with password toggle, live
  validation, and OAuth buttons.
- **Storefront** (`ui_kits/storefront/`) — public creator store: product grid → product page
  → Stripe-style checkout success.
- **Marketing** (`ui_kits/marketing/`) — public landing page: hero + product preview, features,
  how-it-works, pricing (monthly/yearly toggle), CTA, footer.

Not yet built (available to add — see `docs/designs/site-tree.md` in the repo for the full
map): record-detail (T4), settings tabbed forms (T6), analytics dashboard variant, buyer
account library/wishlist/orders.

---

## Root manifest / index

- `styles.css` — global entry; `@import`s every token + font file (link this one file).
- `tokens/` — `colors.css`, `typography.css`, `spacing.css`, `radius.css`, `shadows.css`, `fonts.css`.
- `components/` — `buttons/`, `inputs/`, `surfaces/`, `feedback/` (each: `.jsx` + `.d.ts` + `.prompt.md` + a `@dsCard` HTML).
- `guidelines/` — foundation specimen cards (Colors, Type, Spacing, Brand).
- `assets/` — `logo-mark.svg`, `logo-tile.svg` (nested-“C” monogram).
- `ui_kits/` — `seller-app/`, `auth/`, `storefront/` (each with its own README).
- `thumbnail.html` — homepage tile.
- `SKILL.md` — Agent Skills entry point.

---

## Caveats

- **The brand logo is an original mark** designed for this system (a nested-“C” monogram),
  not from the source repo — swap it if you have an official one.
- **Fonts via Google Fonts CDN**, not self-hosted binaries (they are the correct families).
- The seller app covers 4 of the site-tree's 10 templates; the rest are documented but unbuilt.
