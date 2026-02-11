import { test as setup, expect } from "@playwright/test";
import path from "path";

const USER_AUTH_FILE = path.join(__dirname, "../.auth/user.json");
const ADMIN_AUTH_FILE = path.join(__dirname, "../.auth/admin.json");

/**
 * Authenticate as a regular researcher user and save storageState.
 */
setup("authenticate as user", async ({ page }) => {
  const email = process.env.E2E_USER_EMAIL;
  const password = process.env.E2E_TEST_PASSWORD;

  if (!email || !password) {
    throw new Error(
      "Missing E2E_USER_EMAIL or E2E_TEST_PASSWORD in environment variables. " +
        "Add them to .env.local and ensure dotenv loads before Playwright."
    );
  }

  await page.goto("/login");
  await page.waitForLoadState("domcontentloaded");

  // Fill sign-in form
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();

  // Wait for redirect to dashboard
  await expect(page).toHaveURL("/", { timeout: 15_000 });
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible({
    timeout: 10_000,
  });

  await page.context().storageState({ path: USER_AUTH_FILE });
});

/**
 * Authenticate as an admin user and save storageState.
 */
setup("authenticate as admin", async ({ page }) => {
  const email = process.env.E2E_ADMIN_EMAIL;
  const password = process.env.E2E_TEST_PASSWORD;

  if (!email || !password) {
    throw new Error(
      "Missing E2E_ADMIN_EMAIL or E2E_TEST_PASSWORD in environment variables. " +
        "Add them to .env.local and ensure dotenv loads before Playwright."
    );
  }

  await page.goto("/login");
  await page.waitForLoadState("domcontentloaded");

  // Fill sign-in form
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();

  // Wait for redirect to dashboard
  await expect(page).toHaveURL("/", { timeout: 15_000 });
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible({
    timeout: 10_000,
  });

  await page.context().storageState({ path: ADMIN_AUTH_FILE });
});
