import { test } from "node:test";
import assert from "node:assert/strict";
import { buildProductStructuredData, serializeJsonLd } from "../src/lib/product-structured-data";

const product = {
  id: "cmoueudwo0020ggu9kpllb1kg", slug: "دیسک-قطر-100-با-4-الماس", name: "دیسک قطر 100 با 4 الماس", sku: "dsik02", price: 89800000,
  isInStock: true, stockQuantity: 4, variants: [], shortDescription: "برش چوب", images: [{ url: "/api/uploads/products/test.png" }],
};

test("the selected product offers the displayed price in rials and an absolute image", () => {
  const data = buildProductStructuredData(product, "fa");
  assert.equal(data?.offers.price, 89800000);
  assert.equal(data?.sku, "dsik02");
  assert.equal(data?.offers.priceCurrency, "IRR");
  assert.equal(data?.offers.availability, "https://schema.org/InStock");
  assert.equal(data?.image[0], "https://hs6tools.com/api/uploads/products/test.png");
  assert.equal(data?.offers.url, `https://hs6tools.com/fa/products/${encodeURIComponent(product.slug)}`);
});

test("includes a verified brand only when one exists", () => {
  assert.equal(buildProductStructuredData(product, "fa")?.brand, undefined);
  assert.deepEqual(buildProductStructuredData({ ...product, brand: " Example " }, "fa")?.brand, { "@type": "Brand", name: "Example" });
  assert.equal(buildProductStructuredData({ ...product, brand: " " }, "fa")?.brand, undefined);
});

test("only the two selected products are included and unavailable products stay unavailable", () => {
  assert.equal(buildProductStructuredData({ ...product, id: "other" }, "fa"), null);
  const data = buildProductStructuredData({ ...product, id: "cmp3v8gsp005yggu92ypowv63", isInStock: false, stockQuantity: 0 }, "fa");
  assert.equal(data?.offers.availability, "https://schema.org/OutOfStock");
});

test("ambiguous variant, stock or price data is not published as an offer", () => {
  assert.equal(buildProductStructuredData({ ...product, variants: [{ id: "v" }] }, "fa"), null);
  assert.equal(buildProductStructuredData({ ...product, stockQuantity: 0 }, "fa"), null);
  assert.equal(buildProductStructuredData({ ...product, price: 123 }, "fa"), null);
});

test("JSON-LD cannot terminate its script element", () => {
  const json = serializeJsonLd({ name: "</script><script>alert(1)</script>" });
  assert.equal(json.includes("</script>"), false);
  assert.equal(JSON.parse(json).name, "</script><script>alert(1)</script>");
});
