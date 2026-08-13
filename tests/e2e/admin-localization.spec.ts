import { expect, Page, test } from "@playwright/test";

async function loginAsAdmin(page: Page, locale: "en" | "ar") {
  await page.goto(`/${locale}/auth/login`);
  await page
    .locator('input[type="email"]')
    .fill(process.env.E2E_ADMIN_EMAIL || "admin@hs6tools.com");
  await page
    .locator('input[type="password"]')
    .fill(process.env.E2E_ADMIN_PASSWORD || "Admin123!");
  await page.locator('button[type="submit"]').click();
  await expect(page).toHaveURL(new RegExp(`/${locale}/admin$`));
}

test("English Admin routes localize legacy interface labels and statuses", async ({
  page,
}) => {
  test.setTimeout(90_000);
  await loginAsAdmin(page, "en");

  const cases = [
    {
      route: "/en/admin/products",
      visible: "Product Management",
      hidden: "مدیریت محصولات",
      kind: "text",
    },
    {
      route: "/en/admin/orders",
      visible: "All statuses",
      hidden: "همه وضعیت‌ها",
      kind: "option",
    },
    {
      route: "/en/admin/settings",
      visible: "General settings",
      hidden: "تنظیمات عمومی",
      kind: "text",
    },
    {
      route: "/en/admin/support",
      visible: "Support Center",
      hidden: "مرکز پشتیبانی",
      kind: "text",
    },
    {
      route: "/en/admin/categories",
      visible: "Category Management",
      hidden: "مدیریت دسته‌بندی‌ها",
      kind: "text",
    },
    {
      route: "/en/admin/users",
      visible: "Total users",
      hidden: "کل کاربران",
      kind: "text",
    },
  ];

  for (const item of cases) {
    await page.goto(item.route);
    if (item.kind === "option") {
      await expect(
        page.locator("option", { hasText: item.visible }).first(),
      ).toHaveText(item.visible);
    } else {
      await expect(
        page.getByText(item.visible, { exact: true }).first(),
      ).toBeVisible();
    }
    await expect(page.getByText(item.hidden, { exact: true })).toHaveCount(0);
  }
});

test("Arabic Admin routes localize legacy interface labels", async ({
  page,
}) => {
  await loginAsAdmin(page, "ar");
  await page.goto("/ar/admin/support");

  await expect(
    page.getByText("مركز الدعم", { exact: true }).first(),
  ).toBeVisible();
  await expect(page.getByText("مرکز پشتیبانی", { exact: true })).toHaveCount(0);
});
