import { strict as assert } from "node:assert";
import { test } from "node:test";
import { productImageAlt } from "../src/lib/product-image-alt";

test("uses the product name for missing or filename image descriptions", () => {
  for (const value of [undefined, null, "", "  ", "IMG_1666.PNG", "picture.webp"]) {
    assert.equal(productImageAlt(value, "دیسک الماسه"), "دیسک الماسه");
  }
});

test("preserves a meaningful image description", () => {
  assert.equal(productImageAlt(" نمای نزدیک دیسک ", "دیسک الماسه"), "نمای نزدیک دیسک");
});
