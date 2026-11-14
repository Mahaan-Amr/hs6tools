"use client";

declare global {
  interface Window { _paq?: unknown[][]; }
}

const privateSections = new Set(["admin", "account", "auth", "checkout", "customer", "api"]);

export function publicAnalyticsPath(pathname: string): boolean {
  const segments = pathname.split("/").filter(Boolean);
  return ["fa", "en", "ar"].includes(segments[0]) && !privateSections.has(segments[1]);
}

function tracker(): unknown[][] | null {
  if (typeof window === "undefined") return null;
  if (!window._paq) {
    window._paq = [
      ["disableCookies"],
      ["setTrackerUrl", "/analytics/matomo.php"],
      ["setSiteId", "1"],
      ["setReferrerUrl", `${window.location.origin}/`],
    ];
    const script = document.createElement("script");
    script.async = true;
    script.src = "/analytics/matomo.js";
    document.head.appendChild(script);
  }
  return window._paq;
}

export function trackPublicPage(pathname: string) {
  if (!publicAnalyticsPath(pathname)) return;
  const queue = tracker();
  if (!queue) return;
  queue.push(["setCustomUrl", `${window.location.origin}${pathname}`]);
  queue.push(["setDocumentTitle", pathname]);
  queue.push(["trackPageView"]);
}

export function trackProductView(productId: string) {
  if (typeof window === "undefined" || !publicAnalyticsPath(window.location.pathname)) return;
  const queue = tracker();
  if (!queue) return;
  queue.push(["setCustomUrl", `${window.location.origin}${window.location.pathname}`]);
  queue.push(["setDocumentTitle", window.location.pathname]);
  queue.push(["trackEvent", "Product", "View", productId]);
}

export function trackCartAddition(productId: string) {
  if (typeof window === "undefined") return;
  const locale = window.location.pathname.split("/")[1];
  if (!["fa", "en", "ar"].includes(locale)) return;
  const queue = tracker();
  if (!queue) return;
  if (!publicAnalyticsPath(window.location.pathname)) {
    queue.push(["setCustomUrl", `${window.location.origin}/${locale}/cart`]);
    queue.push(["setDocumentTitle", `/${locale}/cart`]);
  }
  queue.push(["trackEvent", "Product", "Add to cart", productId]);
}
