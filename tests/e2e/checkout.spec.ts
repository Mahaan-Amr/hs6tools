import { expect, test } from "@playwright/test";

test("Customer receives accessible address errors before checkout can advance", async ({ page }) => {
  await page.goto("/en/shop");
  await page.getByRole("button", { name: /add to cart/i }).first().click();

  await page.goto("/en/auth/login");
  await page.locator('input[type="email"]').fill(process.env.E2E_CUSTOMER_EMAIL || "user@hs6tools.com");
  await page.locator('input[type="password"]').fill(process.env.E2E_CUSTOMER_PASSWORD || "User123!");
  await page.locator('button[type="submit"]').click();
  await expect(page).toHaveURL(/\/en$/);

  await page.goto("/en/checkout");
  await page.getByRole("button", { name: /next step/i }).click();

  await expect(page.getByPlaceholder("Enter your first name")).toHaveAttribute("aria-invalid", "true");
  await expect(page.getByRole("alert").filter({ hasText: "Please complete all address fields" })).toHaveCount(7);
  await expect(page.getByRole("heading", { name: "Shipping Method", exact: true })).toHaveCount(0);
});

test("mobile cart keeps product details and named quantity controls usable", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/en/shop");
  await page.getByRole("button", { name: /add to cart/i }).first().click();
  await page.goto("/en/cart");

  const quantityControls = page.getByRole("button", { name: /update quantity/i });
  await expect(quantityControls).toHaveCount(2);

  const itemCard = page.locator("main").getByRole("heading", { level: 3 }).first().locator("../..");
  await expect(itemCard).toBeVisible();
  await expect(page.locator("html")).not.toHaveCSS("overflow-x", "scroll");
});
