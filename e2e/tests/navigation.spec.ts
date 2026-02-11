import { test, expect } from "../fixtures/test-fixtures";

/**
 * Navigation tests — uses authenticated user state.
 * Validates sidebar links, breadcrumbs, collapse, and sign-out.
 */

test.describe("Sidebar Navigation", () => {
  test("all primary navigation links are present", async ({ appShell, page }) => {
    await page.goto("/");
    await appShell.expectLoaded();

    await expect(appShell.sidebarLink("Dashboard")).toBeVisible();
    await expect(appShell.sidebarLink("Research Library")).toBeVisible();
    await expect(appShell.sidebarLink("New Research")).toBeVisible();
    await expect(appShell.sidebarLink("Context Library")).toBeVisible();
  });

  test("Dashboard link navigates to /", async ({ appShell, page }) => {
    await page.goto("/research");
    await appShell.navigateTo("Dashboard");
    await expect(page).toHaveURL("/");
  });

  test("Research Library link navigates to /research", async ({ appShell, page }) => {
    await page.goto("/");
    await appShell.navigateTo("Research Library");
    await expect(page).toHaveURL("/research");
  });

  test("New Research link navigates to /research/new", async ({ appShell, page }) => {
    await page.goto("/");
    await appShell.navigateTo("New Research");
    await expect(page).toHaveURL("/research/new");
  });

  test("Context Library link navigates to /context-library", async ({ appShell, page }) => {
    await page.goto("/");
    await appShell.navigateTo("Context Library");
    await expect(page).toHaveURL("/context-library");
  });

  test("active link is highlighted on current route", async ({ appShell, page }) => {
    await page.goto("/");
    await appShell.expectActiveLink("Dashboard");

    await appShell.navigateTo("Research Library");
    await appShell.expectActiveLink("Research Library");
  });

  test("Settings link navigates to /settings", async ({ appShell, page }) => {
    await page.goto("/");
    await appShell.settingsLink.click();
    await expect(page).toHaveURL("/settings");
  });
});

test.describe("Breadcrumbs", () => {
  test("shows Home on dashboard", async ({ appShell, page }) => {
    await page.goto("/");
    await appShell.expectBreadcrumbContains("Home");
  });

  test("shows path segments on nested routes", async ({ appShell, page }) => {
    await page.goto("/research");
    await appShell.expectBreadcrumbContains("research");
  });
});

test.describe("Sidebar Collapse", () => {
  test("collapses and expands sidebar", async ({ appShell, page }) => {
    await page.goto("/");
    await appShell.expectLoaded();

    // Start expanded
    await appShell.expectSidebarExpanded();

    // Collapse
    await appShell.collapseSidebar();
    await appShell.expectSidebarCollapsed();

    // Expand
    await appShell.expandSidebar();
    await appShell.expectSidebarExpanded();
  });

  test("hides link labels when collapsed", async ({ appShell, page }) => {
    await page.goto("/");
    await appShell.collapseSidebar();

    // Text labels should be hidden; icons should still be visible
    await expect(appShell.sidebar.getByText("Dashboard")).not.toBeVisible();
  });
});

test.describe("Sign Out", () => {
  test("sign out button redirects to login", async ({ appShell, page }) => {
    await page.goto("/");
    await appShell.expectLoaded();
    await appShell.signOut();

    // Should redirect to login page
    await expect(page).toHaveURL("/login", { timeout: 10_000 });
  });
});
