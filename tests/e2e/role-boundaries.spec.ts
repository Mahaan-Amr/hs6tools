import { expect, test } from "@playwright/test";

test("Customer cannot enter the Admin product workspace", async ({ page }) => {
  await page.goto("/fa/auth/login");
  await page.getByLabel("ایمیل", { exact: true }).fill("user@hs6tools.com");
  await page.getByLabel("رمز عبور", { exact: true }).fill("User123!");
  await page.getByRole("button", { name: "ورود", exact: true }).click();
  await expect(page).toHaveURL(/\/fa$/);

  await page.goto("/fa/admin/products");
  await expect(page).toHaveURL(/\/fa$/);
  await expect(page.getByRole("heading", { name: "مدیریت محصولات" })).toHaveCount(0);
});

test("Visitor cannot mutate Catalog Products", async ({ request }) => {
  const create = await request.post("/api/products", { data: {} });
  const update = await request.put("/api/products/qa-does-not-exist", { data: {} });
  const remove = await request.delete("/api/products/qa-does-not-exist");

  expect(create.status()).toBe(401);
  expect(update.status()).toBe(401);
  expect(remove.status()).toBe(401);
});

test("Visitor cannot mutate Product Categories", async ({ request }) => {
  const create = await request.post("/api/categories", { data: {} });
  const update = await request.put("/api/categories/qa-does-not-exist", { data: {} });
  const remove = await request.delete("/api/categories/qa-does-not-exist");

  expect(create.status()).toBe(401);
  expect(update.status()).toBe(401);
  expect(remove.status()).toBe(401);
});

test("Super Admin dashboard does not present fabricated operational metrics", async ({ page }) => {
  await page.goto("/en/auth/login");
  await page.locator('input[type="email"]').fill("admin@hs6tools.com");
  await page.locator('input[type="password"]').fill("Admin123!");
  await page.locator('button[type="submit"]').click();
  await expect(page).toHaveURL(/\/en\/admin$/);

  await expect(page.getByText("Quick Stats", { exact: true })).toHaveCount(0);
  await expect(page.getByText("SEO Score", { exact: true })).toHaveCount(0);
  await expect(page.getByText("1.2s", { exact: true })).toHaveCount(0);

  await page.setViewportSize({ width: 390, height: 844 });
  await expect.poll(() => page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }))).toEqual({ clientWidth: 390, scrollWidth: 390 });
});
