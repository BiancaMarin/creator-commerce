# Storefront — UI kit

The public buyer-facing `(store)` surface: a creator's storefront with public chrome (top nav + footer), a **product card grid** (T8), a **product page** with buy panel (T9), and a **checkout success** confirmation (T10).

- **Interactive flow:** browse grid → click a card (or **Buy**) → product page → **Buy now** → **checkout** (email + Stripe-style card form with live-computed platform fee & total + order summary) → **Pay** → success screen with download. **Back** steps return through the flow.
- Digital-product covers use the lime/teal data-viz gradients with a Phosphor glyph (placeholders — swap for real cover art).

Built on DS `Card, Button, Badge, Separator, Avatar`. Open `index.html`.
