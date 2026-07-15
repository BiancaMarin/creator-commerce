# Auth — UI kit

The chrome-free `(auth)` screen: a centered card that toggles between **Sign in** and **Sign up**. Recreates `app/(app)/login/page.tsx`.

- Logo mark → title/subtitle → email + password fields → primary button → OAuth (Google / GitHub) → footer link.
- **Interactive:** password show/hide toggle, live email validation (destructive ring + message), and the footer link flips login ⇄ signup (signup adds a Name field).

Built on DS `Card, Input, Button, Separator`. Open `index.html`.
