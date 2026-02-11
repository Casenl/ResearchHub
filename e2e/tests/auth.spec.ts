import { test, expect } from "../fixtures/test-fixtures";

/**
 * Authentication tests — runs WITHOUT saved auth state (chromium-noauth project).
 */

test.describe("Login Page", () => {
  test("renders the login page correctly", async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.expectLoaded();
    await loginPage.expectSignInMode();
    await expect(loginPage.googleButton).toBeVisible();
  });

  test("starts in sign-in mode by default", async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.expectSignInMode();
  });

  test("toggles between sign-in and sign-up modes", async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.expectSignInMode();

    await loginPage.switchToSignUp();
    await loginPage.expectSignUpMode();

    await loginPage.switchToSignIn();
    await loginPage.expectSignInMode();
  });

  test("shows display name field only in sign-up mode", async ({ loginPage }) => {
    await loginPage.goto();

    // Sign-in mode: no display name field
    await expect(loginPage.displayNameInput).not.toBeVisible();

    // Switch to sign-up mode: display name field appears
    await loginPage.switchToSignUp();
    await expect(loginPage.displayNameInput).toBeVisible();
  });

  test("toggles password visibility", async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.fillPassword("test123");

    // Initially hidden
    await loginPage.expectPasswordHidden();

    // Toggle to visible
    await loginPage.togglePasswordVisibility();
    await loginPage.expectPasswordVisible();

    // Toggle back to hidden
    await loginPage.togglePasswordVisibility();
    await loginPage.expectPasswordHidden();
  });

  test("requires email and password fields", async ({ loginPage }) => {
    await loginPage.goto();

    // HTML5 validation should prevent submission of empty form
    await expect(loginPage.emailInput).toHaveAttribute("required", "");
    await expect(loginPage.passwordInput).toHaveAttribute("required", "");
  });

  test("password has minLength of 6", async ({ loginPage }) => {
    await loginPage.goto();
    await expect(loginPage.passwordInput).toHaveAttribute("minlength", "6");
  });

  test("clears error when switching modes", async ({ loginPage }) => {
    await loginPage.goto();

    // Trigger an error by submitting invalid credentials
    await loginPage.fillEmail("invalid@test.com");
    await loginPage.fillPassword("wrongpw");
    await loginPage.submit();

    // Wait for error (Firebase will return an error)
    await loginPage.page.waitForTimeout(2000);

    // Switch mode should clear the error
    await loginPage.switchToSignUp();
    await loginPage.expectNoError();
  });

  test("shows Google sign-in button", async ({ loginPage }) => {
    await loginPage.goto();
    await expect(loginPage.googleButton).toBeVisible();
    await expect(loginPage.googleButton).toContainText("Continue with Google");
  });

  test("shows branding panel on desktop viewport", async ({ loginPage }) => {
    await loginPage.page.setViewportSize({ width: 1280, height: 720 });
    await loginPage.goto();
    await expect(loginPage.brandingPanel).toBeVisible();
    await expect(loginPage.page.getByText("Structured market research")).toBeVisible();
  });

  test("shows mobile logo on small viewport", async ({ loginPage }) => {
    await loginPage.page.setViewportSize({ width: 375, height: 812 });
    await loginPage.goto();
    await expect(loginPage.mobileLogo).toBeVisible();
    await expect(loginPage.brandingPanel).not.toBeVisible();
  });
});
