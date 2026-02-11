import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";

/**
 * Theme-related helper utilities for Playwright tests.
 *
 * Uses CSS custom properties defined in globals.css to validate
 * that light/dark themes apply correctly.
 */

/** Expected CSS variable values for light mode. */
export const LIGHT_THEME = {
  background: "#ffffff",
  foreground: "#0a0a0a",
  primary: "#1d4ed8",
  muted: "#f5f5f5",
  mutedForeground: "#737373",
  border: "#e5e5e5",
} as const;

/** Expected CSS variable values for dark mode. */
export const DARK_THEME = {
  background: "#0c0c0e",
  foreground: "#e5e5e5",
  primary: "#3b82f6",
  muted: "#1a1a1f",
  mutedForeground: "#a3a3a3",
  border: "#2a2a30",
} as const;

/**
 * Read a CSS custom property value from :root / <html>.
 */
export async function getCssVariable(
  page: Page,
  variable: string
): Promise<string> {
  return page.evaluate((v) => {
    return getComputedStyle(document.documentElement)
      .getPropertyValue(v)
      .trim();
  }, variable);
}

/**
 * Normalize hex colors to 6-digit lowercase form.
 * e.g. "#fff" → "#ffffff", "#FFF" → "#ffffff"
 */
function normalizeHex(hex: string): string {
  const h = hex.trim().toLowerCase();
  if (/^#[0-9a-f]{3}$/.test(h)) {
    return `#${h[1]}${h[1]}${h[2]}${h[2]}${h[3]}${h[3]}`;
  }
  return h;
}

/**
 * Assert the current theme matches the expected color values.
 */
export async function expectThemeColors(
  page: Page,
  expected: typeof LIGHT_THEME | typeof DARK_THEME
): Promise<void> {
  const bg = await getCssVariable(page, "--color-background");
  const fg = await getCssVariable(page, "--color-foreground");
  const primary = await getCssVariable(page, "--color-primary");

  expect(normalizeHex(bg)).toBe(normalizeHex(expected.background));
  expect(normalizeHex(fg)).toBe(normalizeHex(expected.foreground));
  expect(normalizeHex(primary)).toBe(normalizeHex(expected.primary));
}

/**
 * Check whether the <html> element has the "dark" class.
 */
export async function hasDarkClass(page: Page): Promise<boolean> {
  return page.evaluate(() =>
    document.documentElement.classList.contains("dark")
  );
}

/**
 * Set theme via localStorage and reload.
 */
export async function setThemeViaStorage(
  page: Page,
  theme: "light" | "dark" | "system"
): Promise<void> {
  await page.evaluate((t) => localStorage.setItem("itq-theme", t), theme);
  await page.reload();
  await page.waitForLoadState("domcontentloaded");
}
