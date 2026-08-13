import { expect, test } from "@playwright/test";

test("Catalog Products remain visible when JavaScript is unavailable", async ({
  browser,
}) => {
  test.setTimeout(60_000);
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();

  const response = await page.goto("/fa/categories/diamond-discs", {
    waitUntil: "domcontentloaded",
  });

  expect(response?.status()).toBe(200);
  const productsHeading = page.getByRole("heading", {
    level: 2,
    name: /محصول/,
  });
  const firstProduct = page.getByRole("heading", { level: 3 }).first();

  await expect(productsHeading).toBeVisible();
  await expect(firstProduct).toBeVisible();

  for (const element of [productsHeading, firstProduct]) {
    const effectiveOpacity = await element.evaluate((node) => {
      let opacity = 1;
      let current: Element | null = node;

      while (current) {
        opacity *= Number.parseFloat(
          window.getComputedStyle(current).opacity || "1",
        );
        current = current.parentElement;
      }

      return opacity;
    });

    expect(effectiveOpacity).toBe(1);
  }

  await context.close();
});

test("Catalog Products are not hidden behind scroll-reveal animation", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 400 });
  await page.addInitScript(() => {
    class UnavailableIntersectionObserver {
      disconnect() {}
      observe() {}
      takeRecords() {
        return [];
      }
      unobserve() {}
    }

    Object.defineProperty(window, "IntersectionObserver", {
      configurable: true,
      value: UnavailableIntersectionObserver,
    });
  });

  const response = await page.goto("/fa/categories/diamond-discs");

  expect(response?.status()).toBe(200);
  const firstProduct = page.getByRole("heading", { level: 3 }).first();
  await expect(firstProduct).toBeVisible();
  await expect(
    firstProduct.locator("xpath=ancestor::*[@data-scroll-reveal]"),
  ).toHaveCount(0);
});

test("public pages expose route-specific canonical and language metadata", async ({
  page,
}) => {
  await page.goto("/fa/shop");

  await expect(page).toHaveTitle(/فروشگاه ابزارهای صنعتی.*HS6Tools/);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://hs6tools.com/fa/shop",
  );
  await expect(
    page.locator('link[rel="alternate"][hreflang="en"]'),
  ).toHaveAttribute("href", "https://hs6tools.com/en/shop");

  await page.goto("/fa/categories/diamond-discs");

  await expect(page).toHaveTitle(/دیسک.*الماسه.*HS6Tools/);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://hs6tools.com/fa/categories/diamond-discs",
  );
  await expect(
    page.locator('link[rel="alternate"][hreflang="ar"]'),
  ).toHaveAttribute("href", "https://hs6tools.com/ar/categories/diamond-discs");
});

test("search crawlers receive robots and sitemap documents", async ({
  request,
}) => {
  const robots = await request.get("/robots.txt");
  expect(robots.status()).toBe(200);
  expect(await robots.text()).toContain(
    "Sitemap: https://hs6tools.com/sitemap.xml",
  );

  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.status()).toBe(200);
  expect(sitemap.headers()["content-type"]).toContain("application/xml");
  expect(await sitemap.text()).toContain("https://hs6tools.com/fa/shop");
});

test("each indexable storefront route identifies itself to search engines", async ({
  page,
}) => {
  test.setTimeout(90_000);
  const routes = [
    "/categories",
    "/education",
    "/about",
    "/contact",
    "/blog",
    "/faq",
    "/products/diamond-disc-115mm",
  ];

  for (const route of routes) {
    await page.goto(`/fa${route}`);

    expect(await page.title()).not.toBe("HS6Tools");
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      `https://hs6tools.com/fa${route}`,
    );
    await expect(
      page.locator('link[rel="alternate"][hreflang="en"]'),
    ).toHaveAttribute("href", `https://hs6tools.com/en${route}`);
  }
});

test("footer policy destinations are complete public pages", async ({
  page,
}) => {
  for (const route of ["/privacy", "/terms"]) {
    const response = await page.goto(`/fa${route}`);

    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    expect(await page.title()).not.toBe("HS6Tools");
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      `https://hs6tools.com/fa${route}`,
    );
  }
});

test("the public blog renders published articles without calling its own HTTP API", async ({
  page,
}) => {
  await page.goto("/fa/blog");

  await expect(
    page.getByRole("heading", {
      level: 3,
      name: "راهنمای انتخاب دیسک الماسه مناسب",
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { level: 3, name: "تکنیک‌های پیشرفته نجاری" }),
  ).toBeVisible();
});

test("article cards replace failed images with a visual fallback", async ({
  page,
}) => {
  await page.route("**/_next/image?**", (route) => route.abort());
  await page.goto("/fa/blog");

  await expect(
    page.getByRole("heading", {
      level: 3,
      name: "راهنمای انتخاب دیسک الماسه مناسب",
    }),
  ).toBeVisible();
  await expect(
    page.locator('img[alt="راهنمای انتخاب دیسک الماسه مناسب"]'),
  ).toHaveCount(0);
});

test("homepage slides replace failed campaign images with a branded fallback", async ({
  page,
}) => {
  await page.route("**/_next/image?**", (route) => route.abort());
  await page.goto("/fa");

  const slideTitle = "ورود مستقیم به دسته دیسک الماسه";
  await expect(
    page.getByRole("heading", { level: 3, name: slideTitle }),
  ).toBeAttached();
  await expect(page.locator(`img[alt="${slideTitle}"]`)).toHaveCount(0);
});

test("published article links resolve to indexable article pages", async ({
  page,
}) => {
  const route = "/blog/diamond-disc-selection-guide";
  const response = await page.goto(`/fa${route}`);

  expect(response?.status()).toBe(200);
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "راهنمای انتخاب دیسک الماسه مناسب",
    }),
  ).toBeVisible();
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    `https://hs6tools.com/fa${route}`,
  );
});
