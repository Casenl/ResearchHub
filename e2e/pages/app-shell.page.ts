import type { Locator, Page } from "@playwright/test";
import { expect } from "@playwright/test";

export class AppShellPage {
  readonly page: Page;
  readonly sidebar: Locator;
  readonly header: Locator;
  readonly breadcrumbs: Locator;
  readonly userRoleBadge: Locator;
  readonly collapseButton: Locator;
  readonly signOutButton: Locator;
  readonly settingsLink: Locator;
  readonly userInfo: Locator;

  constructor(page: Page) {
    this.page = page;
    this.sidebar = page.locator("aside");
    this.header = page.locator("header");
    this.breadcrumbs = page.locator("header .text-muted-foreground").first();
    this.userRoleBadge = page.locator("header span.uppercase");
    this.collapseButton = page.getByRole("button", { name: /Expand sidebar|Collapse sidebar/ });
    this.signOutButton = page.getByRole("button", { name: "Sign out" }).or(
      page.locator("button").filter({ has: page.locator("svg.lucide-log-out") })
    );
    this.settingsLink = page.getByRole("link", { name: "Settings" });
    this.userInfo = page.locator("aside .rounded-full").first();
  }

  async expectLoaded(): Promise<void> {
    await expect(this.sidebar).toBeVisible();
    await expect(this.header).toBeVisible();
  }

  /** Get a sidebar navigation link by label text. */
  sidebarLink(label: string): Locator {
    return this.sidebar.getByRole("link", { name: label });
  }

  async navigateTo(label: string): Promise<void> {
    await this.sidebarLink(label).click();
    await this.page.waitForLoadState("domcontentloaded");
  }

  async expectActiveLink(label: string): Promise<void> {
    const link = this.sidebarLink(label);
    await expect(link).toHaveClass(/text-primary/);
  }

  async expectBreadcrumbContains(text: string): Promise<void> {
    await expect(this.breadcrumbs).toContainText(text);
  }

  async collapseSidebar(): Promise<void> {
    const isCollapsed = await this.sidebar.evaluate(
      (el) => el.classList.contains("w-16")
    );
    if (!isCollapsed) {
      await this.collapseButton.click();
    }
  }

  async expandSidebar(): Promise<void> {
    const isCollapsed = await this.sidebar.evaluate(
      (el) => el.classList.contains("w-16")
    );
    if (isCollapsed) {
      await this.collapseButton.click();
    }
  }

  async expectSidebarCollapsed(): Promise<void> {
    await expect(this.sidebar).toHaveClass(/w-16/);
  }

  async expectSidebarExpanded(): Promise<void> {
    await expect(this.sidebar).toHaveClass(/w-64/);
  }

  async signOut(): Promise<void> {
    await this.signOutButton.click();
  }

  /** Check that admin-only sections are NOT visible. */
  async expectNoAdminSections(): Promise<void> {
    await expect(this.sidebarLink("Taxonomy")).not.toBeVisible();
    await expect(this.sidebarLink("Users")).not.toBeVisible();
    await expect(this.sidebarLink("API Keys")).not.toBeVisible();
  }

  /** Check that admin-only sections ARE visible. */
  async expectAdminSectionsVisible(): Promise<void> {
    await expect(this.sidebarLink("Taxonomy")).toBeVisible();
    await expect(this.sidebarLink("Users")).toBeVisible();
  }

  async expectUserEmail(email: string): Promise<void> {
    await expect(this.sidebar.getByText(email)).toBeVisible();
  }
}
