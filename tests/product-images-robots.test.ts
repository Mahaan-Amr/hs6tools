import { test } from "node:test";
import assert from "node:assert/strict";
import robots from "../src/app/robots";

test("product images can be crawled while the general API stays disallowed", () => {
  const rules = robots().rules;
  assert.ok(rules && !Array.isArray(rules));
  assert.ok(Array.isArray(rules.allow) && rules.allow.includes("/api/uploads/products/"));
  assert.ok(Array.isArray(rules.disallow) && rules.disallow.includes("/api/"));
});
