import assert from "node:assert/strict";
import { test } from "node:test";
import { NextRequest } from "next/server";
import { middleware } from "../src/middleware";

test("production locale redirects use the public origin behind the reverse proxy", () => {
  const request = new NextRequest("http://localhost:3004/?from=test", { headers: { host: "hs6tools.com", "x-forwarded-proto": "https" } });
  assert.equal(middleware(request).headers.get("location"), "https://hs6tools.com/fa?from=test");
});

test("www redirect uses the public canonical origin", () => {
  const request = new NextRequest("http://localhost:3004/fa?from=test", { headers: { host: "www.hs6tools.com", "x-forwarded-proto": "https" } });
  assert.equal(middleware(request).headers.get("location"), "https://hs6tools.com/fa?from=test");
});
