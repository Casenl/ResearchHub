import type { Locator, Page } from "@playwright/test";
import { expect } from "@playwright/test";

export class SettingsPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly appearanceSection: Locator;
  readonly notificationsSection: Locator;
  readonly lightButton: Locator;
  readonly darkButton: Locator;
  readonly systemButton: Locator;
  readonly defaultDensityButton: Locator;
  readonly compactDensityButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole("heading", { name: "Settings" });
    this.appearanceSection = page.getByText("Appearance").first();
    this.notificationsSection = page.getByText("Notifications").first();
    this.lightButton = page.getByRole("button", { name: "Light" });
    this.darkButton = page.getByRole("button", { name: "Dark" });
    this.systemButton = page.getByRole("button", { name: "System" });
    this.defaultDensityButton = page.getByRole("button", { name: "Default" });
    this.compactDensityButton = page.getByRole("button", { name: "Compact" });
  }

  async goto(): Promise<void> {
    await this.page.goto("/settings");
    await this.page.waitForLoadState("networkidle");
  }

  async expectLoaded(): Promise<void> {
    await expect(this.heading).toBeVisible();
    await expect(this.appearanceSection).toBeVisible();
  }

  async selectTheme(theme: "Light" | "Dark" | "System"): Promise<void> {
    const btn =
      theme === "Light"
        ? this.lightButton
        : theme === "Dark"
          ? this.darkButton
          : this.systemButton;
    await btn.click();
  }

  async expectActiveTheme(theme: "Light" | "Dark" | "System"): Promise<void> {
    const btn =
      theme === "Light"
        ? this.lightButton
        : theme === "Dark"
          ? this.darkButton
          : this.systemButton;
    await expect(btn).toHaveClass(/border-primary/);
  }

  async selectDensity(density: "Default" | "Compact"): Promise<void> {
    const btn =
      density === "Default"
        ? this.defaultDensityButton
        : this.compactDensityButton;
    await btn.click();
  }

  async expectActiveDensity(density: "Default" | "Compact"): Promise<void> {
    const btn =
      density === "Default"
        ? this.defaultDensityButton
        : this.compactDensityButton;
    await expect(btn).toHaveClass(/border-primary/);
  }
}
