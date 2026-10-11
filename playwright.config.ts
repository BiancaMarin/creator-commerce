import { existsSync } from "node:fs";

import { defineConfig, devices } from "@playwright/test";

// The specs need PG_CONNECTION_STRING to delete the rows they create (see
// e2e/support/db.ts). Same file the Next server reads, so both sides always
// point at the same database. Absent in CI, where the env is set directly.
if (existsSync(".env")) {
  process.loadEnvFile(".env");
}

const PORT = 3000;
const baseURL = `http://localhost:${PORT}`;
const useProdBuild = !!(process.env.CI || process.env.E2E_PROD);

/**
 * End-to-end tests against a real Next server.
 *
 * The server reads `.env`, which locally is the Neon *staging* branch — there
 * is no dedicated test database. So a spec that writes must delete exactly
 * what it wrote: signup.spec.ts creates `e2e-signup-…@example.com` users and
 * removes them afterwards. Checkout and anything touching Stripe stays out
 * until there is a database of its own.
 *
 * Port 3000 on purpose: Next 16 refuses a second `next dev` in the same
 * project ("Another next dev server is already running"), so a separate port
 * can't work. A `npm run dev` already open is reused instead; with none
 * running, Playwright starts one.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "list",
  // `next dev` compiles each route on its first visit; against a cold server,
  // four pages compiling at once overran the default 30s.
  timeout: useProdBuild ? 30_000 : 90_000,
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  // Chromium only: each extra browser is a few hundred MB of download.
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"], headless: false } }],
  webServer: {
    // The Next docs recommend testing the production build. Locally, `next dev`
    // starts in seconds; set E2E_PROD=1 (CI does) to build and serve instead —
    // with your dev server stopped, or it is reused and the flag does nothing.
    command: useProdBuild
      ? `npm run build && npx next start -p ${PORT}`
      : `npx next dev -p ${PORT}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
