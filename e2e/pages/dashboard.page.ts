import type { Locator, Page } from "@playwright/test";
import { expect } from "@playwright/test";

export class DashboardPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly subtitle: Locator;
  readonly newResearchButton: Locator;
  readonly browseContextButton: Locator;
  readonly recentResearchSection: Locator;
  readonly statsSection: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole("heading", { name: "Dashboard" });
    this.subtitle = page.getByText("ITQ Market Intelligence Portal overview");
    this.newResearchButton = page.getByRole("link", { name: "Start New Research" });
    this.browseContextButton = page.getByRole("link", { name: "Browse Context Library" });
    this.recentResearchSection = page.getByText("Recent Research");
    this.statsSection = page.locator("[class*='grid']").first();
  }

  async goto(): Promise<void> {
    await this.page.goto("/");
    await this.page.waitForLoadState("domcontentloaded");
  }

  async expectLoaded(): Promise<void> {
    await expect(this.heading).toBeVisible();
    await expect(this.subtitle).toBeVisible();
  }

  async expectStatsVisible(): Promise<void> {
    await expect(this.statsSection).toBeVisible();
  }

  async expectRecentResearchVisible(): Promise<void> {
    await expect(this.recentResearchSection).toBeVisible();
  }

  async clickNewResearch(): Promise<void> {
    await this.newResearchButton.click();
  }

  async clickBrowseContext(): Promise<void> {
    await this.browseContextButton.click();
  }
}
