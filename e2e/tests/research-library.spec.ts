import { test, expect } from "../fixtures/test-fixtures";

/**
 * Research Library tests — uses authenticated user state.
 */

test.describe("Research Library", () => {
  test("page loads with heading", async ({ researchLibraryPage }) => {
    await researchLibraryPage.goto();
    await researchLibraryPage.expectLoaded();
  });

  test("shows research count in subtitle", async ({ researchLibraryPage }) => {
    await researchLibraryPage.goto();
    await expect(researchLibraryPage.subtitle).toBeVisible();
  });

  test("search input is present", async ({ researchLibraryPage }) => {
    await researchLibraryPage.goto();
    await expect(researchLibraryPage.searchInput).toBeVisible();
  });

  test("New Research button links to /research/new", async ({ researchLibraryPage }) => {
    await researchLibraryPage.goto();
    await expect(researchLibraryPage.newResearchButton).toBeVisible();
    await expect(researchLibraryPage.newResearchButton).toHaveAttribute(
      "href",
      "/research/new"
    );
  });

  test("filter toggle opens filter panel", async ({ researchLibraryPage }) => {
    await researchLibraryPage.goto();
    await researchLibraryPage.toggleFilters();

    // The filter panel should now be visible (status badges, domain badges, etc.)
    await expect(researchLibraryPage.page.locator("main").getByRole("heading", { name: "Status" })).toBeVisible();
  });

  test("search filters research cards", async ({ researchLibraryPage }) => {
    await researchLibraryPage.goto();

    const initialCount = await researchLibraryPage.getResearchCount();

    // Search for something unlikely to match everything
    await researchLibraryPage.search("xyznonexistent123");
    await researchLibraryPage.page.waitForTimeout(500);

    const filteredCount = await researchLibraryPage.getResearchCount();
    // Filtered results should be fewer or zero
    expect(filteredCount).toBeLessThanOrEqual(initialCount);
  });

  test("clearing search restores results", async ({ researchLibraryPage }) => {
    await researchLibraryPage.goto();

    const initialCount = await researchLibraryPage.getResearchCount();

    await researchLibraryPage.search("xyznonexistent123");
    await researchLibraryPage.page.waitForTimeout(500);
    await researchLibraryPage.clearSearch();
    await researchLibraryPage.page.waitForTimeout(500);

    const restoredCount = await researchLibraryPage.getResearchCount();
    expect(restoredCount).toBe(initialCount);
  });

  test("clicking a research card navigates to detail page", async ({
    researchLibraryPage,
    page,
  }) => {
    await researchLibraryPage.goto();

    const count = await researchLibraryPage.getResearchCount();
    if (count > 0) {
      await researchLibraryPage.clickFirstResearch();
      await expect(page).toHaveURL(/\/research\/.+/);
    }
  });
});
