import type { Locator, Page } from "@playwright/test";
import { expect } from "@playwright/test";

export class ResearchDetailPage {
  readonly page: Page;
  readonly title: Locator;
  readonly statusBadge: Locator;
  readonly tabs: Locator;
  readonly backLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.title = page.getByRole("heading", { level: 1 });
    this.statusBadge = page.locator("[class*='badge']").first();
    this.tabs = page.locator("[role='tablist']");
    this.backLink = page.getByRole("link", { name: /back|research library/i });
  }

  async goto(id: string): Promise<void> {
    await this.page.goto(`/research/${id}`);
    await this.page.waitForLoadState("networkidle");
  }

  async expectLoaded(): Promise<void> {
    await expect(this.title).toBeVisible();
  }

  async clickTab(name: string): Promise<void> {
    await this.page.getByRole("tab", { name }).click();
  }

  async expectTabActive(name: string): Promise<void> {
    const tab = this.page.getByRole("tab", { name });
    await expect(tab).toHaveAttribute("data-state", "active");
  }
}
