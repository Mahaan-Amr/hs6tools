import { expect, test } from "@playwright/test";
import { adminCredentials, customerCredentials } from "./credentials";

async function login(page: import("@playwright/test").Page, email: string, password: string) {
  await page.goto("/en/auth/login");
  await page.locator('input[type="email"]').fill(email);
  await page.locator('input[type="password"]').fill(password);
  await page.locator('button[type="submit"]').click();
  await expect(page).toHaveURL(/\/en\/(admin)?$/);
}

test("Customer cannot enter the Admin product workspace", async ({ page }) => {
  test.setTimeout(60_000);
  await page.goto("/fa/auth/login");
  await page
    .getByLabel("ایمیل", { exact: true })
    .fill(customerCredentials.email);
  await page
    .getByLabel("رمز عبور", { exact: true })
    .fill(customerCredentials.password);
  await page.getByRole("button", { name: "ورود", exact: true }).click();
  await expect(page).toHaveURL(/\/fa$/);

  await page
    .goto("/fa/admin/products", { waitUntil: "domcontentloaded" })
    .catch(() => undefined);
  await expect(page).toHaveURL(/\/fa$/);
  await expect(
    page.getByRole("heading", { name: "مدیریت محصولات" }),
  ).toHaveCount(0);
});

test("Visitor cannot mutate Catalog Products", async ({ request }) => {
  const create = await request.post("/api/products", { data: {} });
  const update = await request.put("/api/products/qa-does-not-exist", {
    data: {},
  });
  const remove = await request.delete("/api/products/qa-does-not-exist");

  expect(create.status()).toBe(401);
  expect(update.status()).toBe(401);
  expect(remove.status()).toBe(401);
});

test("Visitor cannot mutate Product Categories", async ({ request }) => {
  const create = await request.post("/api/categories", { data: {} });
  const update = await request.put("/api/categories/qa-does-not-exist", {
    data: {},
  });
  const remove = await request.delete("/api/categories/qa-does-not-exist");

  expect(create.status()).toBe(401);
  expect(update.status()).toBe(401);
  expect(remove.status()).toBe(401);
});

test("Admin cannot escalate privileges and a demoted session loses staff authority", async ({
  browser,
  page,
}, testInfo) => {
  test.setTimeout(120_000);
  const suffix = `${Date.now()}-${testInfo.workerIndex}`;
  const password = "RoleBoundary123!";
  const adminEmail = `e2e-admin-${suffix}@example.test`;
  const customerEmail = `e2e-customer-${suffix}@example.test`;
  const attemptedStaffEmail = `e2e-escalation-${suffix}@example.test`;
  let temporaryAdminId: string | undefined;
  let temporaryCustomerId: string | undefined;

  await login(page, adminCredentials.email, adminCredentials.password);

  try {
    const createAdmin = await page.request.post("/api/users", {
      data: {
        email: adminEmail,
        firstName: "Temporary",
        lastName: "Admin",
        password,
        role: "ADMIN",
      },
    });
    expect(createAdmin.status()).toBe(201);
    temporaryAdminId = (await createAdmin.json()).data.id;

    const createCustomer = await page.request.post("/api/users", {
      data: {
        email: customerEmail,
        firstName: "Temporary",
        lastName: "Customer",
        password,
        role: "CUSTOMER",
      },
    });
    expect(createCustomer.status()).toBe(201);
    temporaryCustomerId = (await createCustomer.json()).data.id;

    const adminContext = await browser.newContext({
      baseURL: testInfo.project.use.baseURL as string,
    });
    const adminPage = await adminContext.newPage();

    try {
      await login(adminPage, adminEmail, password);

      const createStaff = await adminPage.request.post("/api/users", {
        data: {
          email: attemptedStaffEmail,
          firstName: "Privilege",
          lastName: "Escalation",
          password,
          role: "ADMIN",
        },
      });
      expect(createStaff.status()).toBe(403);

      const promoteCustomer = await adminPage.request.put(
        `/api/users/${temporaryCustomerId}`,
        { data: { role: "ADMIN" } },
      );
      expect(promoteCustomer.status()).toBe(403);

      const demoteAdmin = await page.request.put(
        `/api/users/${temporaryAdminId}`,
        { data: { role: "CUSTOMER" } },
      );
      expect(demoteAdmin.status()).toBe(200);

      const staleStaffRequest = await adminPage.request.post("/api/products", {
        data: {},
      });
      expect(staleStaffRequest.status()).toBe(403);

      await adminPage.goto("/en/admin/products");
      await expect(adminPage).toHaveURL(/\/en$/);

      const restoreAdmin = await page.request.put(
        `/api/users/${temporaryAdminId}`,
        { data: { role: "ADMIN" } },
      );
      expect(restoreAdmin.status()).toBe(200);

      const disableAdmin = await page.request.put(
        `/api/users/${temporaryAdminId}`,
        { data: { isActive: false } },
      );
      expect(disableAdmin.status()).toBe(200);

      const disabledStaffRequest = await adminPage.request.post(
        "/api/products",
        { data: {} },
      );
      expect(disabledStaffRequest.status()).toBe(403);

      const restoreDisabledAdmin = await page.request.put(
        `/api/users/${temporaryAdminId}`,
        { data: { isActive: true } },
      );
      expect(restoreDisabledAdmin.status()).toBe(200);

      const softDeleteAdmin = await page.request.delete(
        `/api/users/${temporaryAdminId}`,
      );
      expect(softDeleteAdmin.status()).toBe(200);

      const deletedStaffRequest = await adminPage.request.post(
        "/api/products",
        { data: {} },
      );
      expect(deletedStaffRequest.status()).toBe(403);
    } finally {
      await adminContext.close();
    }
  } finally {
    for (const id of [temporaryCustomerId, temporaryAdminId]) {
      if (id) await page.request.delete(`/api/users/${id}`);
    }
  }
});

test("Super Admin dashboard does not present fabricated operational metrics", async ({
  page,
}) => {
  await page.goto("/en/auth/login");
  await page.locator('input[type="email"]').fill(adminCredentials.email);
  await page.locator('input[type="password"]').fill(adminCredentials.password);
  await page.locator('button[type="submit"]').click();
  await expect(page).toHaveURL(/\/en\/admin$/);

  await expect(page.getByText("Quick Stats", { exact: true })).toHaveCount(0);
  await expect(page.getByText("SEO Score", { exact: true })).toHaveCount(0);
  await expect(page.getByText("1.2s", { exact: true })).toHaveCount(0);

  await page.setViewportSize({ width: 390, height: 844 });
  await expect
    .poll(() =>
      page.evaluate(() => ({
        clientWidth: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
      })),
    )
    .toEqual({ clientWidth: 390, scrollWidth: 390 });
});
