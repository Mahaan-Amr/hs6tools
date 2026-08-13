import { expect, test } from "@playwright/test";

test("each locale declares its language and reading direction", async ({ page }) => {
  await page.goto("/en/shop");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.locator("html")).toHaveAttribute("dir", "ltr");

  await page.goto("/ar/shop");
  await expect(page.locator("html")).toHaveAttribute("lang", "ar");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
});

test("public layout hydrates without a React mismatch", async ({ page }) => {
  const hydrationErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error" && message.text().includes("hydrated")) {
      hydrationErrors.push(message.text());
    }
  });

  await page.goto("/en/blog");
  await page.waitForTimeout(500);

  expect(hydrationErrors).toEqual([]);
});

test("English Catalog Products keep their localized names in the cart", async ({ page }) => {
  await page.goto("/en/shop");
  await expect(page.getByRole("heading", { name: "115mm Diamond Disc" })).toBeVisible();
  await page.getByRole("button", { name: /add to cart/i }).first().click();
  await page.goto("/en/cart");
  await expect(page.getByRole("heading", { name: "150mm Digital Caliper" })).toBeVisible();
});

test("header icon actions expose accessible names", async ({ page }) => {
  await page.goto("/en/shop");

  const unnamedCount = await page.locator("header button, header a").evaluateAll((elements) =>
    elements.filter((element) =>
      element.querySelector("svg") &&
      !(element.getAttribute("aria-label") || element.getAttribute("title") || element.textContent?.trim())
    ).length
  );

  expect(unnamedCount).toBe(0);
});
