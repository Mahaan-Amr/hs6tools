import { test } from "node:test";
import assert from "node:assert/strict";
import { anonymousReferrer, publicAnalyticsPath, trackCartAddition, trackPublicPage, trackProductView } from "../src/lib/matomo";

test("referrers retain only a web origin and do not leak identifiers or search terms", () => {
  const site = "https://hs6tools.com";
  assert.equal(anonymousReferrer("https://user:secret@www.google.com/search?q=private#fragment", site), "https://www.google.com/");
  assert.equal(anonymousReferrer("https://example.org/sensitive?email=test@example.org", site), "https://example.org/");
  for (const input of ["", "not a url", "javascript:alert(1)", "data:text/plain,secret"]) {
    assert.equal(anonymousReferrer(input, site), `${site}/`);
  }
});

test("only public locale paths are tracked as page views", () => {
  assert.equal(publicAnalyticsPath("/fa/products/sample"), true);
  for (const path of ["/fa/auth/reset-password", "/fa/account/orders/123", "/en/checkout", "/fa/admin", "/api/auth"]) {
    assert.equal(publicAnalyticsPath(path), false, path);
  }
});

test("tracking uses clean paths, and cart events from private pages use the cart URL", () => {
  const scripts: Array<{ src?: string }> = [];
  const browser = { location: { origin: "https://hs6tools.com", pathname: "/fa/products/example", search: "?token=secret" }, _paq: undefined as unknown[][] | undefined };
  Object.assign(globalThis, { window: browser, document: { referrer: "https://www.google.com/search?q=secret", createElement: () => ({}), head: { appendChild: (item: {src?: string}) => scripts.push(item) } } });
  try {
    trackPublicPage("/fa/products/example");
    trackProductView("product-123");
    trackCartAddition("product-123");
    browser.location.pathname = "/fa/account/wishlist";
    trackPublicPage(browser.location.pathname);
    trackCartAddition("product-456");
    const commands = browser._paq!;
    assert.equal(scripts[0].src, "/analytics/matomo.js");
    assert.ok(commands.some(c => c[0] === "disableCookies"));
    assert.ok(commands.some(c => c[0] === "setRequestMethod" && c[1] === "POST"));
    assert.ok(commands.some(c => c[0] === "setReferrerUrl" && c[1] === "https://www.google.com/"));
    assert.ok(commands.some(c => c[0] === "setCustomUrl" && c[1] === "https://hs6tools.com/fa/cart"));
    assert.equal(commands.filter(c => c[0] === "trackPageView").length, 1);
    assert.ok(commands.some(c => c[0] === "trackEvent" && c[2] === "View" && c[3] === "product-123"));
    assert.equal(commands.filter(c => c[0] === "trackEvent" && c[2] === "Add to cart").length, 2);
    assert.ok(!JSON.stringify(commands).includes("secret"));
    assert.ok(!JSON.stringify(commands).includes("account"));
  } finally {
    Reflect.deleteProperty(globalThis, "window");
    Reflect.deleteProperty(globalThis, "document");
  }
});
