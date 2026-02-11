import { test as base } from "@playwright/test";
import { LoginPage } from "../pages/login.page";
import { DashboardPage } from "../pages/dashboard.page";
import { ResearchLibraryPage } from "../pages/research-library.page";
import { ResearchDetailPage } from "../pages/research-detail.page";
import { ResearchWizardPage } from "../pages/research-wizard.page";
import { ContextLibraryPage } from "../pages/context-library.page";
import { SettingsPage } from "../pages/settings.page";
import { AppShellPage } from "../pages/app-shell.page";
import { TaxonomyPage } from "../pages/admin/taxonomy.page";
import { UsersPage } from "../pages/admin/users.page";

/**
 * Extended test function that provides Page Object Model fixtures.
 *
 * Usage in tests:
 *   import { test, expect } from "../fixtures/test-fixtures";
 *
 *   test("example", async ({ dashboardPage }) => {
 *     await dashboardPage.goto();
 *     await dashboardPage.expectLoaded();
 *   });
 */

interface PageFixtures {
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
  researchLibraryPage: ResearchLibraryPage;
  researchDetailPage: ResearchDetailPage;
  researchWizardPage: ResearchWizardPage;
  contextLibraryPage: ContextLibraryPage;
  settingsPage: SettingsPage;
  appShell: AppShellPage;
  taxonomyPage: TaxonomyPage;
  usersPage: UsersPage;
}

export const test = base.extend<PageFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },
  researchLibraryPage: async ({ page }, use) => {
    await use(new ResearchLibraryPage(page));
  },
  researchDetailPage: async ({ page }, use) => {
    await use(new ResearchDetailPage(page));
  },
  researchWizardPage: async ({ page }, use) => {
    await use(new ResearchWizardPage(page));
  },
  contextLibraryPage: async ({ page }, use) => {
    await use(new ContextLibraryPage(page));
  },
  settingsPage: async ({ page }, use) => {
    await use(new SettingsPage(page));
  },
  appShell: async ({ page }, use) => {
    await use(new AppShellPage(page));
  },
  taxonomyPage: async ({ page }, use) => {
    await use(new TaxonomyPage(page));
  },
  usersPage: async ({ page }, use) => {
    await use(new UsersPage(page));
  },
});

export { expect } from "@playwright/test";
