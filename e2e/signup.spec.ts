import type { Page } from "@playwright/test";

import { strings } from "@/constants/strings";

import {
  deleteUsersByEmail,
  e2eEmail,
  findUserByEmail,
  sweepStaleE2eUsers,
} from "./support/db";
import { expect, test } from "./support/test";

// Writes to the database — every address created here is deleted in afterAll.
// Unique per test, so the specs run safely in parallel workers.
const created: string[] = [];

function newEmail() {
  const email = e2eEmail();
  created.push(email);
  return email;
}

const PASSWORD = "e2e-password-123";

// A signup hashes the password (deliberately slow) and then renders the
// dashboard; with several workers hitting `next dev` at once that overran
// the default 5s. Only the redirect gets the longer wait.
const SIGNUP_REDIRECT = { timeout: 30_000 };

async function fillSignup(
  page: Page,
  values: { name: string; email: string; password: string },
) {
  await page.getByLabel(strings.signup.name).fill(values.name);
  await page.getByLabel(strings.signup.email).fill(values.email);
  // Exact: the show/hide toggle's aria-label also contains "password".
  await page
    .getByLabel(strings.signup.password, { exact: true })
    .fill(values.password);
  await page.getByRole("button", { name: strings.signup.submit }).click();
}

test.beforeAll(async () => {
  await sweepStaleE2eUsers();
});

test.afterAll(async () => {
  await deleteUsersByEmail(created);
});

test.describe("signup", () => {
  // One after another in a single worker. Each signup is CPU-heavy on the
  // server (password hashing), and running them side by side against
  // `next dev` turned a 2s request into timeouts.
  test.describe.configure({ mode: "default" });

  test.beforeEach(async ({ page }) => {
    await page.goto("/signup");
  });

  test("creates an account, signs in and opens a storefront", async ({
    page,
  }) => {
    const email = newEmail();

    await fillSignup(page, { name: "Ada Lovelace", email, password: PASSWORD });

    // Lands signed in on the dashboard, greeted by first name.
    await expect(page).toHaveURL(/\/dashboard$/, SIGNUP_REDIRECT);
    await expect(
      page.getByRole("heading", {
        name: strings.dashboard.greeting.replace("{name}", "Ada"),
      }),
    ).toBeVisible();

    // The session survives a full reload — it's a real cookie, not client state.
    await page.reload();
    await expect(page).toHaveURL(/\/dashboard$/);

    // The user.create.before hook derived the handle from the email…
    const user = await findUserByEmail(email);
    expect(user?.name).toBe("Ada Lovelace");
    expect(user?.handle).toBe(email.split("@")[0]);

    // …and that handle is now a live public storefront.
    const storefront = await page.goto(`/${user!.handle}`);
    expect(storefront?.status()).toBe(200);
  });

  test("refuses an email that's already registered", async ({
    page,
    request,
    baseURL,
  }) => {
    const email = newEmail();

    // The existing account is setup, not the behaviour under test, so it goes
    // straight to Better Auth's endpoint. `request` keeps its own cookies, so
    // this session doesn't follow `page` — the (auth) layout would redirect a
    // signed-in visitor away from /signup. Origin is required: Better Auth
    // refuses cross-site POSTs without it.
    const existing = await request.post("/api/auth/sign-up/email", {
      headers: { origin: baseURL! },
      data: { name: "First", email, password: PASSWORD },
    });
    expect(existing.ok()).toBe(true);

    await fillSignup(page, { name: "Second", email, password: PASSWORD });

    // By text, not bare getByRole("alert"): Next's route announcer is also
    // role="alert", so that locator matches two elements.
    await expect(
      page.getByRole("alert").filter({ hasText: strings.errors.emailTaken }),
    ).toBeVisible();
    await expect(page).toHaveURL(/\/signup$/);
  });

  test("validates the form before anything is sent", async ({ page }) => {
    let signupRequests = 0;
    page.on("request", (request) => {
      if (request.url().includes("/api/auth/sign-up")) {
        signupRequests++;
      }
    });

    await fillSignup(page, { name: " ", email: "not-an-email", password: "short" });

    await expect(page.getByText(strings.validation.required)).toBeVisible();
    await expect(page.getByText(strings.validation.invalidEmail)).toBeVisible();
    await expect(page.getByText(strings.validation.passwordMin)).toBeVisible();
    await expect(page.getByLabel(strings.signup.email)).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    expect(signupRequests).toBe(0);
  });
});
