import type { Locator, Page } from "@playwright/test";
import { expect } from "@playwright/test";

export class ResearchLibraryPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly subtitle: Locator;
  readonly searchInput: Locator;
  readonly filterToggle: Locator;
  readonly clearFiltersButton: Locator;
  readonly newResearchButton: Locator;
  readonly researchCards: Locator;
  readonly emptyState: Locator;
  readonly filterPanel: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole("heading", { name: "Research Library" });
    this.subtitle = page.locator("text=/\\d+ of \\d+ research items/");
    this.searchInput = page.getByPlaceholder(/search/i);
    this.filterToggle = page.getByRole("button", { name: /filter/i });
    this.clearFiltersButton = page.getByRole("button", { name: /clear/i });
    this.newResearchButton = page.getByRole("link", { name: "New Research" });
    this.researchCards = page.locator("[class*='grid'] > a, [class*='grid'] > div").filter({ has: page.locator("h3") });
    this.emptyState = page.getByText(/no research found|no results/i);
    this.filterPanel = page.locator("[class*='filter']");
  }

  async goto(): Promise<void> {
    await this.page.goto("/research");
    await this.page.waitForLoadState("domcontentloaded");
  }

  async expectLoaded(): Promise<void> {
    await expect(this.heading).toBeVisible();
  }

  async search(query: string): Promise<void> {
    await this.searchInput.fill(query);
  }

  async clearSearch(): Promise<void> {
    await this.searchInput.clear();
  }

  async toggleFilters(): Promise<void> {
    await this.filterToggle.click();
  }

  async getResearchCount(): Promise<number> {
    return this.researchCards.count();
  }

  async clickFirstResearch(): Promise<void> {
    await this.researchCards.first().click();
  }

  async expectResearchCount(count: number): Promise<void> {
    await expect(this.researchCards).toHaveCount(count);
  }

  async expectEmptyState(): Promise<void> {
    await expect(this.emptyState).toBeVisible();
  }
}
