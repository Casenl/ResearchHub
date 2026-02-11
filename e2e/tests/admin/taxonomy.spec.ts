import { test, expect } from "../../fixtures/test-fixtures";

/**
 * Taxonomy management tests — uses ADMIN auth state (chromium-admin project).
 */

test.describe("Taxonomy Management", () => {
  test("page loads with heading", async ({ taxonomyPage }) => {
    await taxonomyPage.goto();
    await taxonomyPage.expectLoaded();
  });

  test("Markets tab is active by default", async ({ taxonomyPage }) => {
    await taxonomyPage.goto();
    await taxonomyPage.expectTabActive("Markets");
  });

  test("switching to Domains tab works", async ({ taxonomyPage }) => {
    await taxonomyPage.goto();
    await taxonomyPage.clickTab("Domains");
    await taxonomyPage.expectTabActive("Domains");
    await taxonomyPage.expectTabContentVisible();
  });

  test("switching to Sectors tab works", async ({ taxonomyPage }) => {
    await taxonomyPage.goto();
    await taxonomyPage.clickTab("Sectors");
    await taxonomyPage.expectTabActive("Sectors");
    await taxonomyPage.expectTabContentVisible();
  });

  test("switching to Tags tab works", async ({ taxonomyPage }) => {
    await taxonomyPage.goto();
    await taxonomyPage.clickTab("Tags");
    await taxonomyPage.expectTabActive("Tags");
    await taxonomyPage.expectTabContentVisible();
  });

  test("cycling through all tabs works", async ({ taxonomyPage }) => {
    await taxonomyPage.goto();

    for (const tab of ["Domains", "Sectors", "Tags", "Markets"] as const) {
      await taxonomyPage.clickTab(tab);
      await taxonomyPage.expectTabActive(tab);
      await taxonomyPage.expectTabContentVisible();
    }
  });

  test("Markets tab has content", async ({ taxonomyPage }) => {
    await taxonomyPage.goto();
    await taxonomyPage.expectTabActive("Markets");

    // The tab panel should have content (e.g., Add button, table, etc.)
    const panel = taxonomyPage.activePanel();
    await expect(panel).not.toBeEmpty();
  });

  test("each tab has an Add button", async ({ taxonomyPage }) => {
    await taxonomyPage.goto();

    for (const tab of ["Markets", "Domains", "Sectors", "Tags"] as const) {
      await taxonomyPage.clickTab(tab);
      const addBtn = taxonomyPage.addButton();
      await expect(addBtn).toBeVisible();
    }
  });
});
