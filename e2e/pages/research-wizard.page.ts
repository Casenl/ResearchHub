import type { Locator, Page } from "@playwright/test";
import { expect } from "@playwright/test";

export class ResearchWizardPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly nextButton: Locator;
  readonly prevButton: Locator;
  readonly submitButton: Locator;
  readonly stepIndicators: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole("heading", { level: 1 });
    this.nextButton = page.getByRole("button", { name: /next|continue/i });
    this.prevButton = page.getByRole("button", { name: /back|previous/i });
    this.submitButton = page.getByRole("button", { name: /create|submit/i });
    this.stepIndicators = page.locator("[class*='step']");
  }

  async goto(): Promise<void> {
    await this.page.goto("/research/new");
    await this.page.waitForLoadState("networkidle");
  }

  async expectLoaded(): Promise<void> {
    await expect(this.heading).toBeVisible();
  }
}
