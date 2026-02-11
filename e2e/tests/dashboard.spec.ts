import { test, expect } from "../fixtures/test-fixtures";

/**
 * Dashboard page tests — uses authenticated user state.
 */

test.describe("Dashboard", () => {
  test("page loads with heading and subtitle", async ({ dashboardPage }) => {
    await dashboardPage.goto();
    await dashboardPage.expectLoaded();
  });

  test("stats cards section is visible", async ({ dashboardPage }) => {
    await dashboardPage.goto();
    await dashboardPage.expectStatsVisible();
  });

  test("recent research section is visible", async ({ dashboardPage }) => {
    await dashboardPage.goto();
    await dashboardPage.expectRecentResearchVisible();
  });

  test("Start New Research button navigates to /research/new", async ({
    dashboardPage,
    page,
  }) => {
    await dashboardPage.goto();
    await dashboardPage.clickNewResearch();
    await expect(page).toHaveURL("/research/new");
  });

  test("Browse Context Library button navigates to /research", async ({
    dashboardPage,
    page,
  }) => {
    await dashboardPage.goto();
    await dashboardPage.clickBrowseContext();
    await expect(page).toHaveURL("/research");
  });

  test("View all link in recent research navigates to /research", async ({
    dashboardPage,
    page,
  }) => {
    await dashboardPage.goto();
    const viewAll = page.getByRole("link", { name: "View all" });
    if (await viewAll.isVisible()) {
      await viewAll.click();
      await expect(page).toHaveURL("/research");
    }
  });
});
