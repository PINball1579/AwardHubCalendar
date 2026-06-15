import { test, expect } from "@playwright/test";

test("shows the sign-in gate when not authenticated", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("button", { name: /sign in with microsoft/i })).toBeVisible();
});
