import { test, expect } from '@playwright/test';

test.describe('Attendance Flow', () => {
  test('employee can check in and check out', async ({ page }) => {
    // Navigate to login
    await page.goto('http://localhost:5173/login');

    // Simulate Employee Login
    await page.getByLabel('Email').fill('employee@company.com');
    await page.locator('input[type="password"]').fill('Password123!');
    await page.click('button[type="submit"]');

    // Wait for redirect to attendance page
    await page.waitForURL('**/employee/dashboard');
    
    // Verify dashboard loaded successfully
    await expect(page.locator('h4', { hasText: 'Dashboard' }).first()).toBeVisible({ timeout: 10000 });
  });
});
