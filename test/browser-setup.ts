// Runs before every browser-mode test file — see the "browser" project in
// vitest.config.mts.

// Registers `page.render` and its types.
import "vitest-browser-react";

// The real stylesheet: Tailwind, the theme tokens, fonts. Components render
// as they do in the app, so `toBeVisible()` and screenshots mean something.
import "@/app/globals.css";
