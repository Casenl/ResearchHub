import { test, expect } from "../fixtures/test-fixtures";
import { hasDarkClass } from "../helpers/theme-helpers";

/**
 * Settings page tests — uses authenticated user state.
 */

test.describe("Settings Page", () => {
  test("page loads with heading and sections", async ({ settingsPage }) => {
    await settingsPage.goto();
    await settingsPage.expectLoaded();
    await expect(settingsPage.notificationsSection).toBeVisible();
  });

  test("theme buttons are visible", async ({ settingsPage }) => {
    await settingsPage.goto();
    await expect(settingsPage.lightButton).toBeVisible();
    await expect(settingsPage.darkButton).toBeVisible();
    await expect(settingsPage.systemButton).toBeVisible();
  });

  test("density buttons are visible", async ({ settingsPage }) => {
    await settingsPage.goto();
    await expect(settingsPage.defaultDensityButton).toBeVisible();
    await expect(settingsPage.compactDensityButton).toBeVisible();
  });

  test("clicking Light theme highlights the Light button", async ({ settingsPage }) => {
    await settingsPage.goto();
    await settingsPage.selectTheme("Light");
    await settingsPage.expectActiveTheme("Light");
  });

  test("clicking Dark theme highlights the Dark button", async ({ settingsPage }) => {
    await settingsPage.goto();
    await settingsPage.selectTheme("Dark");
    await settingsPage.expectActiveTheme("Dark");

    // Clean up
    await settingsPage.selectTheme("Light");
  });

  test("clicking System theme highlights the System button", async ({ settingsPage }) => {
    await settingsPage.goto();
    await settingsPage.selectTheme("System");
    await settingsPage.expectActiveTheme("System");

    // Clean up
    await settingsPage.selectTheme("Light");
  });

  test("Dark theme button applies dark class to html", async ({ settingsPage }) => {
    await settingsPage.goto();
    await settingsPage.selectTheme("Dark");
    await settingsPage.page.waitForTimeout(300);

    expect(await hasDarkClass(settingsPage.page)).toBe(true);

    // Clean up
    await settingsPage.selectTheme("Light");
  });

  test("density toggle switches to compact mode", async ({ settingsPage }) => {
    await settingsPage.goto();
    await settingsPage.selectDensity("Compact");
    await settingsPage.expectActiveDensity("Compact");

    // Check that compact class is applied
    const isCompact = await settingsPage.page.evaluate(() =>
      document.documentElement.classList.contains("compact")
    );
    expect(isCompact).toBe(true);

    // Clean up
    await settingsPage.selectDensity("Default");
  });

  test("density toggle switches back to default mode", async ({ settingsPage }) => {
    await settingsPage.goto();

    // First set compact
    await settingsPage.selectDensity("Compact");
    await settingsPage.page.waitForTimeout(200);

    // Then set default
    await settingsPage.selectDensity("Default");
    await settingsPage.expectActiveDensity("Default");

    const isCompact = await settingsPage.page.evaluate(() =>
      document.documentElement.classList.contains("compact")
    );
    expect(isCompact).toBe(false);
  });
});
