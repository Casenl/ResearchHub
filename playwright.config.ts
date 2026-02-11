import { defineConfig, devices } from "@playwright/test";
import path from "path";
import fs from "fs";

// Load .env.local so E2E_* variables are available to setup and tests.
const envPath = path.join(__dirname, ".env.local");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf-8").split("\n")) {
    const match = line.match(/^\s*([\w]+)\s*=\s*(.*)$/);
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[2].trim().replace(/^["']|["']$/g, "");
    }
  }
}

/**
 * Playwright configuration for the ITQ Market Intelligence Portal.
 *
 * Auth strategy:
 *   - "setup" project authenticates a researcher and admin user
 *   - Authenticated tests reuse saved storageState from e2e/.auth/
 *
 * Run:
 *   npm run test:e2e           — headless, Chromium only
 *   npm run test:e2e:ui        — interactive UI mode
 *   npm run test:e2e:headed    — visible browser
 */
export default defineConfig({
  testDir: "./e2e/tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ["list"],
    ["html", { open: "never" }],
    ["json", { outputFile: "playwright-report/results.json" }],
    ["junit", { outputFile: "playwright-report/results.xml" }],
    ["./e2e/reporters/clipboard-report.ts"],
  ],
  timeout: 30_000,
  expect: { timeout: 10_000 },

  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },

  projects: [
    // --- Auth setup (runs first) ---
    {
      name: "setup",
      testDir: "./e2e/fixtures",
      testMatch: /auth\.setup\.ts/,
    },

    // --- Chromium (user auth state — all non-admin tests + admin-access) ---
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        storageState: path.join(__dirname, "e2e/.auth/user.json"),
      },
      dependencies: ["setup"],
      testIgnore: [/admin\/(?!admin-access).+\.spec\.ts/, /auth\.spec\.ts/],
    },

    // --- Admin tests (admin auth state — taxonomy, users, etc.) ---
    {
      name: "chromium-admin",
      use: {
        ...devices["Desktop Chrome"],
        storageState: path.join(__dirname, "e2e/.auth/admin.json"),
      },
      dependencies: ["setup"],
      testMatch: /admin\/(?!admin-access).+\.spec\.ts/,
    },

    // --- Unauthenticated tests (login page — no saved auth state) ---
    {
      name: "chromium-noauth",
      use: { ...devices["Desktop Chrome"] },
      testMatch: /auth\.spec\.ts/,
    },
  ],

  /* The kill-port script (e2e/kill-port.js) frees port 3000 before Playwright runs,
   * so the webServer can always start a fresh Next.js dev instance. */
  webServer: {
    command: "npx next dev",
    url: process.env.E2E_BASE_URL ?? "http://localhost:3000",
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
