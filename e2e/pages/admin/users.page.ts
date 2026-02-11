import type { Locator, Page } from "@playwright/test";
import { expect } from "@playwright/test";

export class UsersPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly inviteButton: Locator;
  readonly usersTable: Locator;
  readonly inviteForm: Locator;
  readonly statsGrid: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole("heading", { name: "User Management" });
    this.inviteButton = page.getByRole("button", { name: "Invite User" });
    this.usersTable = page.locator("table");
    this.inviteForm = page.locator("form");
    this.statsGrid = page.locator("[class*='grid']").first();
  }

  async goto(): Promise<void> {
    await this.page.goto("/admin/users");
    await this.page.waitForLoadState("networkidle");
  }

  async expectLoaded(): Promise<void> {
    await expect(this.heading).toBeVisible();
    await expect(this.inviteButton).toBeVisible();
  }

  async clickInviteUser(): Promise<void> {
    await this.inviteButton.click();
  }

  async expectInviteFormVisible(): Promise<void> {
    await expect(this.inviteForm).toBeVisible();
  }

  async expectUsersTableVisible(): Promise<void> {
    await expect(this.usersTable).toBeVisible();
  }
}
