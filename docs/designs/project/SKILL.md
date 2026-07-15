---
name: creator-commerce-design
description: Use this skill to generate well-branded interfaces and assets for Creator Commerce (a SaaS where creators sell digital products — storefronts, seller dashboard, Stripe checkout), either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping.
user-invocable: true
---

Read the README.md file within this skill, and explore the other available files.
If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out and create static HTML files for the user to view. If working on production code, you can copy assets and read the rules here to become an expert in designing with this brand.
If the user invokes this skill without any other guidance, ask them what they want to build or design, ask some questions, and act as an expert designer who outputs HTML artifacts _or_ production code, depending on the need.

## Quick reference

- **Tokens:** `styles.css` imports everything in `tokens/` — link it, then style with the CSS variables (`var(--primary)`, `var(--muted-foreground)`, `var(--radius-4xl)`, `var(--font-sans)` / `var(--font-mono)`). Never hardcode hex.
- **Fonts:** Public Sans (UI + headings, weight 600 + `letter-spacing:-.02em` for titles), Geist Mono (numerals/prices/IDs). Loaded via Google Fonts in `tokens/fonts.css`.
- **Color:** muted teal `--primary`; mauve-tinted neutrals; lime→green chart ramp; emerald/amber/red status. Flat backgrounds, no gradients in UI.
- **Shape:** big soft radii (cards & buttons = `--radius-4xl`, inputs = `--radius-3xl`, pills = full). Cards = soft shadow + hairline ring, never a hard border. Buttons press down 1px on click.
- **Icons:** Phosphor only (`<i class="ph ph-name">` via `@phosphor-icons/web` CDN; React `{Name}Icon` in code). No emoji, no custom icon SVGs.
- **Copy:** sentence case, second person, short verb-first buttons, mono numerals, no emoji.

## Using components
Load the bundle and read components off the namespace:
```html
<link rel="stylesheet" href="styles.css">
<script src="_ds_bundle.js"></script>
<script>const { Button, Card, Badge, Input, Avatar } = window.CreatorCommerceDesignSystem_8efbba;</script>
```
See `components/*/*.prompt.md` for per-component usage and `ui_kits/` for full-screen examples (seller dashboard, auth, storefront).
