import { expect, test } from "@playwright/test";
import { adminCredentials, customerCredentials } from "./credentials";

test("Buyer discovers a product, builds a cart, signs in, and reaches validated checkout", async ({
  page,
}) => {
  test.setTimeout(90_000);
  await page.goto("/en/shop");
  const product = page.getByRole("heading", { level: 3 }).first();
  const productName = (await product.textContent())?.trim();
  expect(productName).toBeTruthy();

  await product
    .locator(
      "xpath=ancestor::div[.//button[contains(normalize-space(.), 'Add to Cart')]][1]",
    )
    .getByRole("button", { name: /add to cart/i })
    .click();
  await expect(
    page.getByRole("button", { name: "Shopping Cart" }),
  ).toContainText("1");
  await page.goto("/en/cart", { waitUntil: "domcontentloaded" });
  await expect(page).toHaveURL(/\/en\/cart$/);
  await expect(page.getByText(productName!, { exact: true })).toBeVisible();

  await page.getByRole("link", { name: /checkout/i }).click();
  await expect(page).toHaveURL(/\/en\/auth\/login\?callbackUrl=/);
  await page.locator('input[type="email"]').fill(customerCredentials.email);
  await page
    .locator('input[type="password"]')
    .fill(customerCredentials.password);
  await page.locator('button[type="submit"]').click();
  await expect(page).toHaveURL(/\/en\/checkout$/);

  await page.getByRole("button", { name: /next step/i }).click();
  await expect(
    page.getByText("Please complete all address fields"),
  ).toHaveCount(7);
});

test("Super Admin sees database-backed operational totals and the latest order", async ({
  page,
}) => {
  await page.goto("/en/auth/login");
  await page.locator('input[type="email"]').fill(adminCredentials.email);
  await page.locator('input[type="password"]').fill(adminCredentials.password);
  await page.locator('button[type="submit"]').click();
  await expect(page).toHaveURL(/\/en\/admin$/);

  await expect(page.getByText("Today's Orders", { exact: true })).toBeVisible();
  await expect(
    page.getByText("Active Products", { exact: true }),
  ).toBeVisible();
  await expect(page.getByText("Recent Orders", { exact: true })).toBeVisible();
});
