import type { Locator, Page } from "@playwright/test";
import { expect } from "@playwright/test";

export class ContextLibraryPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly uploadButton: Locator;
  readonly documentCards: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole("heading", { name: /Context Library/i });
    this.uploadButton = page.getByRole("link", { name: /upload|add|new/i });
    this.documentCards = page.locator("[class*='card'], [class*='grid'] > a, [class*='grid'] > div").filter({ has: page.locator("h3, h2") });
  }

  async goto(): Promise<void> {
    await this.page.goto("/context-library");
    await this.page.waitForLoadState("domcontentloaded");
  }

  async expectLoaded(): Promise<void> {
    await expect(this.heading).toBeVisible();
  }
}
