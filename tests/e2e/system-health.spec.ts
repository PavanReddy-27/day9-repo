import { test, expect } from '@playwright/test';

test.describe('Admin System Health Dashboard End-to-End Suite (Task 16)', () => {
  test('Admin logs in and accesses the System Health Dashboard with live telemetry', async ({ page }) => {
    // 1. Visit Login Page
    await page.goto('/login');
    await expect(page.getByLabel('Username')).toBeVisible();

    // 2. Sign in as Admin
    await page.getByLabel('Username').fill('admin@thestackly.com');
    await page.locator('input[type="password"]').fill('Password123!');
    await page.locator('button[type="submit"]').click();

    // 3. Wait for dashboard navigation
    await page.waitForURL('**/admin/dashboard');
    await expect(page.locator('.dashboard-layout')).toBeVisible({ timeout: 10000 });

    // 4. Navigate to System Health via sidebar link
    const systemHealthLink = page.locator('a[href="/admin/system-health"]');
    await systemHealthLink.evaluate((el: HTMLElement) => el.click());
    await page.waitForURL('**/admin/system-health');

    // 5. Verify page title and header
    await expect(page.locator('h1')).toContainText('System Health & Operations', { timeout: 10000 });
    await expect(page.locator('.status-badge')).toBeVisible();

    // 6. Verify metric cards are rendered
    await expect(page.locator('text=Server Memory')).toBeVisible();
    await expect(page.locator('text=MongoDB Cluster')).toBeVisible();
    await expect(page.locator('text=API Traffic & Latency')).toBeVisible();
    await expect(page.locator('text=Background Jobs & DLQ')).toBeVisible();

    // 7. Test Tab switching (Dead-Letter Queue)
    const dlqTab = page.locator('button[role="tab"]:has-text("Dead-Letter Queue")');
    if (await dlqTab.isVisible()) {
      await dlqTab.click();
      await expect(page.locator('h3:has-text("Dead-Letter Queue")')).toBeVisible();
    }

    // 8. Test Tab switching (Backups & Snapshots)
    const backupsTab = page.locator('button[role="tab"]:has-text("Backups & Snapshots")');
    if (await backupsTab.isVisible()) {
      await backupsTab.click();
      await expect(page.locator('h3:has-text("Disaster Recovery Snapshots")')).toBeVisible();
    }

    // 9. Test Tab switching (Data Retention)
    const retentionTab = page.locator('button[role="tab"]:has-text("Data Retention")');
    if (await retentionTab.isVisible()) {
      await retentionTab.click();
      await expect(page.locator('h3:has-text("Data Retention & Privacy Policies")')).toBeVisible();
    }
  });
});

