import { fileURLToPath } from "node:url";

import react from "@vitejs/plugin-react";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    // Vite 8 reads the `@/*` alias from tsconfig.json itself; the
    // vite-tsconfig-paths plugin the Next docs mention is no longer needed.
    tsconfigPaths: true,
    alias: {
      // `server-only` throws unless resolved under the `react-server` condition,
      // which only Next's server bundler sets. Without this, nothing under
      // lib/server/ could be imported by a test at all.
      "server-only": fileURLToPath(
        new URL("./test/server-only.ts", import.meta.url),
      ),
    },
  },
  test: {
    // Split by extension: `.ts` is logic and runs in Node, `.tsx` renders a
    // component and runs in a real Chromium. `extends: true` gives both the
    // plugins and aliases above.
    projects: [
      {
        extends: true,
        test: {
          name: "unit",
          environment: "node",
          include: ["**/*.test.ts"],
          // e2e/ belongs to Playwright, whose `test` is not Vitest's.
          exclude: ["node_modules/**", ".next/**", "e2e/**"],
        },
      },
      {
        extends: true,
        test: {
          name: "browser",
          include: ["**/*.test.tsx"],
          exclude: ["node_modules/**", ".next/**", "e2e/**"],
          setupFiles: ["./test/browser-setup.ts"],
          browser: {
            enabled: true,
            // Same Chromium that `npx playwright install chromium` fetched for
            // the e2e suite — no second browser download.
            provider: playwright(),
            headless: true,
            instances: [{ browser: "chromium" }],
          },
        },
      },
    ],
  },
});
