import type { Locator, Page } from "@playwright/test";
import { expect } from "@playwright/test";

export class LoginPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly displayNameInput: Locator;
  readonly submitButton: Locator;
  readonly googleButton: Locator;
  readonly toggleModeButton: Locator;
  readonly passwordToggle: Locator;
  readonly errorBanner: Locator;
  readonly brandingPanel: Locator;
  readonly mobileLogo: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole("heading", { name: /Sign in|Create account/ });
    this.emailInput = page.getByLabel("Email");
    this.passwordInput = page.getByLabel("Password");
    this.displayNameInput = page.getByLabel("Full name");
    this.submitButton = page.locator("button[type='submit']");
    this.googleButton = page.getByRole("button", { name: "Continue with Google" });
    this.toggleModeButton = page.getByRole("button", { name: /Create one|Sign in/ }).last();
    this.passwordToggle = page.locator("button[tabindex='-1']");
    this.errorBanner = page.locator("[class*='bg-destructive']");
    this.brandingPanel = page.locator(".lg\\:flex.lg\\:w-1\\/2");
    this.mobileLogo = page.locator(".lg\\:hidden");
  }

  async goto(): Promise<void> {
    await this.page.goto("/login");
    await this.page.waitForLoadState("domcontentloaded");
  }

  async expectLoaded(): Promise<void> {
    await expect(this.heading).toBeVisible();
    await expect(this.emailInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
  }

  async expectSignInMode(): Promise<void> {
    await expect(this.heading).toHaveText("Sign in");
    await expect(this.submitButton).toHaveText("Sign in");
  }

  async expectSignUpMode(): Promise<void> {
    await expect(this.heading).toHaveText("Create account");
    await expect(this.submitButton).toHaveText("Create account");
    await expect(this.displayNameInput).toBeVisible();
  }

  async switchToSignUp(): Promise<void> {
    await this.page.getByRole("button", { name: "Create one" }).click();
  }

  async switchToSignIn(): Promise<void> {
    await this.page.getByRole("button", { name: "Sign in" }).last().click();
  }

  async fillEmail(email: string): Promise<void> {
    await this.emailInput.fill(email);
  }

  async fillPassword(password: string): Promise<void> {
    await this.passwordInput.fill(password);
  }

  async fillDisplayName(name: string): Promise<void> {
    await this.displayNameInput.fill(name);
  }

  async submit(): Promise<void> {
    await this.submitButton.click();
  }

  async togglePasswordVisibility(): Promise<void> {
    await this.passwordToggle.click();
  }

  async expectPasswordVisible(): Promise<void> {
    await expect(this.passwordInput).toHaveAttribute("type", "text");
  }

  async expectPasswordHidden(): Promise<void> {
    await expect(this.passwordInput).toHaveAttribute("type", "password");
  }

  async expectError(text: string | RegExp): Promise<void> {
    await expect(this.errorBanner).toBeVisible();
    await expect(this.errorBanner).toContainText(text);
  }

  async expectNoError(): Promise<void> {
    await expect(this.errorBanner).not.toBeVisible();
  }
}
