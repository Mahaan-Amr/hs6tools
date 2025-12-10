/**
 * Sanitize callback/redirect URLs to prevent open redirects.
 * - Allows only same-origin relative paths (starting with "/")
 * - Rejects protocol-relative ("//") and absolute URLs.
 * - Optionally ensures locale prefix.
 */
export function sanitizeCallbackUrl(callbackUrl: string | null | undefined, locale?: string): string | null {
  if (!callbackUrl) return null;

  try {
    const decoded = decodeURIComponent(callbackUrl);
    // Must start with a single slash and not with "//"
    if (!decoded.startsWith("/") || decoded.startsWith("//")) {
      return null;
    }
    // Optional locale scoping
    if (locale && !decoded.startsWith(`/${locale}`)) {
      return null;
    }
    return decoded;
  } catch {
    return null;
  }
}

