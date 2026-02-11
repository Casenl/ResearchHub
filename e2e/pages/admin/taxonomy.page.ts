import type { Locator, Page } from "@playwright/test";
import { expect } from "@playwright/test";

export class TaxonomyPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly tabList: Locator;
  readonly marketsTab: Locator;
  readonly domainsTab: Locator;
  readonly sectorsTab: Locator;
  readonly tagsTab: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole("heading", { name: "Taxonomy Management" });
    this.tabList = page.locator("[class*='border-b']").filter({ has: page.locator("[data-state]") });
    this.marketsTab = page.getByRole("tab", { name: "Markets" });
    this.domainsTab = page.getByRole("tab", { name: "Domains" });
    this.sectorsTab = page.getByRole("tab", { name: "Sectors" });
    this.tagsTab = page.getByRole("tab", { name: "Tags" });
  }

  async goto(): Promise<void> {
    await this.page.goto("/admin/taxonomy");
    await this.page.waitForLoadState("networkidle");
  }

  async expectLoaded(): Promise<void> {
    await expect(this.heading).toBeVisible();
    await expect(this.marketsTab).toBeVisible();
  }

  async clickTab(name: "Markets" | "Domains" | "Sectors" | "Tags"): Promise<void> {
    const tab =
      name === "Markets"
        ? this.marketsTab
        : name === "Domains"
          ? this.domainsTab
          : name === "Sectors"
            ? this.sectorsTab
            : this.tagsTab;
    await tab.click();
  }

  async expectTabActive(name: "Markets" | "Domains" | "Sectors" | "Tags"): Promise<void> {
    const tab =
      name === "Markets"
        ? this.marketsTab
        : name === "Domains"
          ? this.domainsTab
          : name === "Sectors"
            ? this.sectorsTab
            : this.tagsTab;
    await expect(tab).toHaveAttribute("data-state", "active");
  }

  /** Get the currently visible tab content panel. */
  activePanel(): Locator {
    return this.page.locator("[data-state='active'][role='tabpanel']");
  }

  async expectTabContentVisible(): Promise<void> {
    await expect(this.activePanel()).toBeVisible();
  }

  /** Look for an "Add" button within the active panel. */
  addButton(): Locator {
    return this.activePanel().getByRole("button", { name: /add/i });
  }
}
