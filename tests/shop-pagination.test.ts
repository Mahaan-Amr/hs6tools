import { test } from "node:test";
import assert from "node:assert/strict";
import { parseShopPage, shopPagePath } from "../src/lib/shop-pagination";

test("shop page numbers are bounded positive integers with clean canonical paths", () => {
  assert.equal(parseShopPage("2"), 2);
  assert.equal(shopPagePath(2), "/shop?page=2");
  assert.equal(shopPagePath(1), "/shop");
  for (const invalid of [undefined, "0", "-2", "1.5", "9999999999999", "01", ["2", "3"]]) {
    assert.equal(parseShopPage(invalid), 1);
  }
});
