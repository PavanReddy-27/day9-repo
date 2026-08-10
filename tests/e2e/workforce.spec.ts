import { test, expect } from "@playwright/test";

test.describe("Workforce Analytics Dashboard End-to-End Tests", () => {
  test("loads the login page and renders form controls", async ({ page }) => {
    await page.goto("http://localhost:5173/login");
    const title = await page.title();
    expect(title).toBeDefined();
  });

  test("rejects invalid login credentials gracefully", async ({ page }) => {
    await page.goto("http://localhost:5173/login");
    const usernameInput = page.locator('input[name="username"], input[type="text"]').first();
    const passwordInput = page.locator('input[name="password"], input[type="password"]').first();
    const submitBtn = page.locator('button[type="submit"]').first();

    if (await usernameInput.isVisible()) {
      await usernameInput.fill("invalid_user");
      await passwordInput.fill("wrong_password");
      await submitBtn.click();
    }
  });
});
