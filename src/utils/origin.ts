/**
 * Simple origin validation helper for CSRF mitigation on browser-initiated POSTs.
 * Allows requests only if Origin matches an allowed list (env + request host).
 */
export function isAllowedOrigin(origin: string | null, requestHost: string): boolean {
  if (!origin) return false;

  try {
    const allowed: string[] = [];
    // Allow configured app URL if set (for multi-domain setups)
    const envOrigin = process.env.NEXT_PUBLIC_APP_URL;
    if (envOrigin) allowed.push(envOrigin);

    // Always allow same-origin based on the request host (primary security check)
    allowed.push(`https://${requestHost}`);
    allowed.push(`http://${requestHost}`);

    const originUrl = new URL(origin);
    return allowed.some((o) => {
      try {
        const u = new URL(o);
        return u.protocol === originUrl.protocol && u.host === originUrl.host;
      } catch {
        return false;
      }
    });
  } catch {
    return false;
  }
}

