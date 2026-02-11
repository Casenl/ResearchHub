import { test, expect } from "../fixtures/test-fixtures";
import {
  LIGHT_THEME,
  DARK_THEME,
  expectThemeColors,
  hasDarkClass,
  setThemeViaStorage,
} from "../helpers/theme-helpers";

/**
 * Theme consistency tests — validates light/dark/system mode CSS variables
 * and persistence across navigation and page reloads.
 */

test.describe("Theme", () => {
  test("light mode applies correct CSS variables", async ({ settingsPage }) => {
    await settingsPage.goto();
    await settingsPage.selectTheme("Light");

    // Wait for theme to apply
    await settingsPage.page.waitForTimeout(300);

    const isDark = await hasDarkClass(settingsPage.page);
    expect(isDark).toBe(false);

    await expectThemeColors(settingsPage.page, LIGHT_THEME);
  });

  test("dark mode applies correct CSS variables", async ({ settingsPage }) => {
    await settingsPage.goto();
    await settingsPage.selectTheme("Dark");

    await settingsPage.page.waitForTimeout(300);

    const isDark = await hasDarkClass(settingsPage.page);
    expect(isDark).toBe(true);

    await expectThemeColors(settingsPage.page, DARK_THEME);
  });

  test("theme persists after navigation", async ({ settingsPage, appShell }) => {
    await settingsPage.goto();
    await settingsPage.selectTheme("Dark");
    await settingsPage.page.waitForTimeout(300);

    // Navigate away
    await appShell.navigateTo("Dashboard");
    await settingsPage.page.waitForTimeout(500);

    // Dark class should still be present
    const isDark = await hasDarkClass(settingsPage.page);
    expect(isDark).toBe(true);
  });

  test("theme persists after page reload", async ({ settingsPage }) => {
    await settingsPage.goto();
    await settingsPage.selectTheme("Dark");
    await settingsPage.page.waitForTimeout(300);

    // Reload
    await settingsPage.page.reload();
    await settingsPage.page.waitForLoadState("domcontentloaded");

    // Theme should still be dark
    const isDark = await hasDarkClass(settingsPage.page);
    expect(isDark).toBe(true);
  });

  test("system mode follows prefers-color-scheme", async ({ settingsPage }) => {
    // Emulate dark color scheme
    await settingsPage.page.emulateMedia({ colorScheme: "dark" });
    await settingsPage.goto();
    await settingsPage.selectTheme("System");
    await settingsPage.page.waitForTimeout(300);

    let isDark = await hasDarkClass(settingsPage.page);
    expect(isDark).toBe(true);

    // Switch to light color scheme
    await settingsPage.page.emulateMedia({ colorScheme: "light" });
    await settingsPage.page.waitForTimeout(500);

    isDark = await hasDarkClass(settingsPage.page);
    expect(isDark).toBe(false);
  });

  test("switching from dark to light removes dark class", async ({ settingsPage }) => {
    await settingsPage.goto();

    await settingsPage.selectTheme("Dark");
    await settingsPage.page.waitForTimeout(300);
    expect(await hasDarkClass(settingsPage.page)).toBe(true);

    await settingsPage.selectTheme("Light");
    await settingsPage.page.waitForTimeout(300);
    expect(await hasDarkClass(settingsPage.page)).toBe(false);
  });

  test("login page respects theme from localStorage", async ({ page }) => {
    // Set dark theme in localStorage before navigating to login
    await page.goto("/settings");
    await page.waitForLoadState("domcontentloaded");
    await setThemeViaStorage(page, "dark");

    // Now navigate to a page that will show the theme
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    const isDark = await hasDarkClass(page);
    expect(isDark).toBe(true);

    // Clean up: reset to light
    await setThemeViaStorage(page, "light");
  });
});

test.describe("Theme - Dark Mode Color Audit", () => {
  test("no hardcoded bg-white elements in dark mode", async ({ page }) => {
    await page.goto("/settings");
    await page.waitForLoadState("domcontentloaded");
    await setThemeViaStorage(page, "dark");

    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    // Check that the page background isn't white in dark mode
    const bgColor = await page.evaluate(() => {
      return getComputedStyle(document.body).backgroundColor;
    });

    // In dark mode, body background should NOT be white
    expect(bgColor).not.toBe("rgb(255, 255, 255)");

    // Clean up
    await setThemeViaStorage(page, "light");
  });
});
