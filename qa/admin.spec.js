import { test, expect } from "@playwright/test";

test("admin shell loads without exposing backend secrets", async ({ page }) => {
  await page.goto("/admin/");
  await expect(page.locator("h1")).toHaveText("Administración");
  await expect(page.locator("#login-form")).toBeVisible();
  await expect(page.locator("#dashboard-view")).toBeHidden();
  const config = await page.evaluate(() => window.OGP_BACKEND_CONFIG);
  expect(config.supabaseUrl).toBe("");
  expect(config.supabasePublishableKey).toBe("");
});
