import assert from "node:assert/strict";
import { test } from "node:test";
import { sanitizeArticleHtml } from "../src/lib/sanitize-article-html";

test("article HTML removes executable markup and unsafe URLs", () => {
  const sanitized = sanitizeArticleHtml(
    '<p onclick="alert(1)">Safe</p><script>alert(2)</script><a href="javascript:alert(3)">link</a>',
  );

  assert.equal(sanitized.includes("script"), false);
  assert.equal(sanitized.includes("onclick"), false);
  assert.equal(sanitized.includes("javascript:"), false);
  assert.match(sanitized, /<p>Safe<\/p>/);
});
