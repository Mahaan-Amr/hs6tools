import assert from "node:assert/strict";
import { test } from "node:test";
import {
  isThirdPartyImageSource,
  normalizePublicImageSource,
} from "../src/lib/image-source";

test("protocol-relative legacy images are normalized to direct HTTPS requests", () => {
  assert.equal(
    normalizePublicImageSource("//cdn.example.com/catalog/product.webp"),
    "https://cdn.example.com/catalog/product.webp",
  );
  assert.equal(isThirdPartyImageSource("//cdn.example.com/catalog/product.webp"), true);
  assert.equal(isThirdPartyImageSource("/uploads/products/product.webp"), false);
});
