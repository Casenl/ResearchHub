import { test, expect } from "../../fixtures/test-fixtures";

/**
 * Admin access control tests — uses regular USER auth state (chromium project).
 * Verifies that non-admin users cannot see or access admin sections.
 */

test.describe("Admin Access Control (non-admin user)", () => {
  test("admin nav sections are hidden for non-admin users", async ({ appShell, page }) => {
    await page.goto("/");
    await appShell.expectLoaded();
    await appShell.expectNoAdminSections();
  });

  test("Configuration section title is not visible", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // The "Configuration" section header should not be visible
    await expect(page.locator("aside").getByText("Configuration")).not.toBeVisible();
  });

  test("Governance section title is not visible", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await expect(page.locator("aside").getByText("Governance")).not.toBeVisible();
  });

  test("Oversight section title is not visible", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await expect(page.locator("aside").getByText("Oversight")).not.toBeVisible();
  });

  test("direct navigation to /admin/taxonomy shows access denied or redirects", async ({ page }) => {
    await page.goto("/admin/taxonomy");
    await page.waitForLoadState("networkidle");

    // Should either redirect away, show an access denied message,
    // or the admin-only content simply won't render
    const isOnAdminPage = page.url().includes("/admin/taxonomy");

    if (isOnAdminPage) {
      // If on the page, the taxonomy content should not be accessible
      // (ProtectedRoute or role check should prevent rendering)
      const heading = page.getByRole("heading", { name: "Taxonomy Management" });
      const accessDenied = page.getByText(/access denied|not authorized|forbidden/i);

      // Either the heading is missing or an access denied message is shown
      const headingVisible = await heading.isVisible().catch(() => false);
      const accessDeniedVisible = await accessDenied.isVisible().catch(() => false);

      // At least one condition should hold — either no admin content or access denied
      expect(headingVisible === false || accessDeniedVisible === true).toBe(true);
    }
    // If redirected, the test passes since the user can't access admin pages
  });

  test("direct navigation to /admin/users shows access denied or redirects", async ({ page }) => {
    await page.goto("/admin/users");
    await page.waitForLoadState("networkidle");

    const isOnAdminPage = page.url().includes("/admin/users");

    if (isOnAdminPage) {
      const heading = page.getByRole("heading", { name: "User Management" });
      const accessDenied = page.getByText(/access denied|not authorized|forbidden/i);

      const headingVisible = await heading.isVisible().catch(() => false);
      const accessDeniedVisible = await accessDenied.isVisible().catch(() => false);

      expect(headingVisible === false || accessDeniedVisible === true).toBe(true);
    }
  });
});
