import assert from "node:assert/strict";
import { test } from "node:test";
import { sanitizeRichContent } from "../src/lib/rich-content";

test("rich content removes stored and encoded executable payloads", () => {
  const sanitized = sanitizeRichContent(
    '<p onclick="alert(1)">Safe</p><script>alert(2)</script><a href="&#x6a;avascript:alert(3)">link</a><img src=x onerror=alert(4)>',
  );

  assert.equal(sanitized.includes("script"), false);
  assert.equal(sanitized.includes("onclick"), false);
  assert.equal(sanitized.includes("javascript:"), false);
  assert.equal(sanitized.includes("onerror"), false);
  assert.equal(sanitized.includes("<img"), false);
  assert.match(sanitized, /<p>Safe<\/p>/);
});

test("rich content rejects embeds and repairs malformed markup", () => {
  const sanitized = sanitizeRichContent(
    '<p>Start<iframe src="https://evil.example"></iframe><object data="data:text/html,x"></object><strong>Finish',
  );

  assert.equal(sanitized.includes("iframe"), false);
  assert.equal(sanitized.includes("object"), false);
  assert.equal(sanitized, "<p>Start<strong>Finish</strong></p>");
});

test("rich content preserves supported multilingual authoring markup", () => {
  const sanitized = sanitizeRichContent(
    '<h2>ابزارهای ایمن</h2><p>ابزار آمن <strong>Safe tools</strong></p><ul><li>برش</li><li>قطع</li></ul><a href="https://hs6tools.com/fa" target="_blank">HS6Tools</a>',
  );

  assert.match(sanitized, /ابزارهای ایمن/);
  assert.match(sanitized, /ابزار آمن/);
  assert.match(sanitized, /<strong>Safe tools<\/strong>/);
  assert.match(sanitized, /<ul><li>برش<\/li><li>قطع<\/li><\/ul>/);
  assert.match(sanitized, /href="https:\/\/hs6tools\.com\/fa"/);
  assert.match(sanitized, /rel="noopener noreferrer"/);
});

test("rich content keeps safe contact links and strips unsafe protocols", () => {
  const sanitized = sanitizeRichContent(
    '<a href="mailto:sales@hs6tools.com">Email</a><a href="tel:+982100000000">Call</a><a href="data:text/html;base64,eA==">Data</a>',
  );

  assert.match(sanitized, /href="mailto:sales@hs6tools\.com"/);
  assert.match(sanitized, /href="tel:\+982100000000"/);
  assert.equal(sanitized.includes("data:"), false);
});
