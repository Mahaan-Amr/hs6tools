import { expect, test } from "@playwright/test";

test("third-party trust asset failure keeps a stable footer fallback", async ({ page }) => {
  test.setTimeout(90_000);
  let sealRequests = 0;
  await page.route("https://trustseal.enamad.ir/**", async (route) => {
    if (route.request().resourceType() === "image") sealRequests += 1;
    await route.abort();
  });

  await page.goto("/en", { waitUntil: "domcontentloaded" });
  const seal = page.getByRole("link", { name: "E-Namad trust seal" });
  await seal.scrollIntoViewIfNeeded();
  await expect.poll(() => sealRequests).toBe(1);

  const fallback = page.getByTestId("trust-seal-fallback");
  await expect(fallback).toBeVisible();
  await expect(fallback).toHaveText("E-Namad verification unavailable");

  const box = await fallback.boundingBox();
  expect(box?.width).toBe(120);
  expect(box?.height).toBe(60);
});

for (const locale of ["fa", "ar", "en"]) {
  test(`${locale} public content remains visible without broken layout`, async ({ page }) => {
    test.setTimeout(90_000);
    await page.goto(`/${locale}`, { waitUntil: "domcontentloaded" });
    await expect(page.locator("main").first()).toBeVisible();
    const overflows = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
    expect(overflows).toBe(false);
  });
}

for (const [locale, expectedText] of Object.entries({
  fa: /دیسک الماسه با کیفیت بالا/,
  ar: /قرص ماسي عالي الجودة/,
  en: /High-quality diamond disc/,
})) {
  test(`${locale} Catalog Product rich content renders after sanitization`, async ({ page }) => {
    const response = await page.goto(`/${locale}/products/diamond-disc-115mm`, {
      waitUntil: "domcontentloaded",
    });

    expect(response?.status()).toBe(200);
    const content = page.getByTestId("product-rich-content");
    await expect(content).toBeVisible();
    await expect(content).toContainText(expectedText);
    await expect(content.locator("script, iframe, object, [onerror], [onclick]")).toHaveCount(0);

    const box = await content.boundingBox();
    expect(box?.height).toBeGreaterThan(0);
  });
}
