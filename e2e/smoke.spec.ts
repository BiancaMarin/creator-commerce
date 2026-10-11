import { strings } from "@/constants/strings";

import { expect, test } from "./support/test";

// Read-only on purpose — see playwright.config.ts.

test("landing page renders", async ({ page }) => {
  const response = await page.goto("/");

  expect(response?.status()).toBe(200);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});

test("login page renders its form", async ({ page }) => {
  await page.goto("/login");

  await expect(
    page.getByRole("heading", { name: strings.login.title }),
  ).toBeVisible();
  await expect(page.locator('input[type="email"]')).toBeVisible();
  await expect(page.locator('input[type="password"]')).toBeVisible();
});

test("the seller app sends a signed-out visitor to /login", async ({ page }) => {
  await page.goto("/dashboard");

  await expect(page).toHaveURL(/\/login$/);
});

test("an unknown storefront handle is a 404", async ({ page }) => {
  // Valid handle syntax, but far too random to belong to anyone.
  const response = await page.goto("/e2e-no-such-store-7f3c9a");

  expect(response?.status()).toBe(404);
});
