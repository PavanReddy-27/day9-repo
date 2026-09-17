import { expect, test } from "@playwright/test";

type RoleAccount = {
  role: "Admin" | "HR" | "Manager" | "Employee";
  email: string;
  dashboard: string;
};

const roleAccounts: RoleAccount[] = [
  {
    role: "Admin",
    email: "admin@thestackly.com",
    dashboard: "/admin/dashboard",
  },
  {
    role: "HR",
    email: "hr@thestackly.com",
    dashboard: "/hr/dashboard",
  },
  {
    role: "Manager",
    email: "manager@thestackly.com",
    dashboard: "/manager/dashboard",
  },
  {
    role: "Employee",
    email: "employee@thestackly.com",
    dashboard: "/employee/dashboard",
  },
];

for (const account of roleAccounts) {
  test(`${account.role} can sign in and reaches its dashboard`, async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Username").fill(account.email);
    await page.locator('input[type="password"]').fill("Password123!");
    await page.locator('button[type="submit"]').click();

    await page.waitForURL(`**${account.dashboard}`);
    await expect(page.locator(".dashboard-layout")).toBeVisible();
    await expect(page.locator("header.header")).toBeVisible();
  });
}

test("an unauthenticated user cannot open a protected dashboard", async ({ page }) => {
  await page.goto("/admin/dashboard");
  await expect(page).toHaveURL(/\/login$/);
});
