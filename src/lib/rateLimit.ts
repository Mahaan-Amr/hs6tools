// Simple in-memory rate limiter (per-instance). Suitable for low-volume auth endpoints.
// For production scale, replace with Redis/Upstash.

type Bucket = { count: number; expiresAt: number };
const buckets = new Map<string, Bucket>();

export function rateLimitByIp(ip: string | null, key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const bucketKey = `${key}:${ip || "unknown"}`;
  const existing = buckets.get(bucketKey);
  if (existing && existing.expiresAt > now) {
    if (existing.count >= limit) {
      return { allowed: false, remaining: 0, resetInMs: existing.expiresAt - now };
    }
    existing.count += 1;
    return { allowed: true, remaining: limit - existing.count, resetInMs: existing.expiresAt - now };
  }
  buckets.set(bucketKey, { count: 1, expiresAt: now + windowMs });
  return { allowed: true, remaining: limit - 1, resetInMs: windowMs };
}

/**
 * Simplified rate limit check - automatically generates key from endpoint context
 * @param ip Client IP address
 * @param limit Maximum requests allowed
 * @param windowMs Time window in milliseconds
 * @param key Optional custom key (defaults to 'default')
 */
export function checkRateLimit(ip: string, limit: number, windowMs: number, key: string = 'default') {
  return rateLimitByIp(ip, key, limit, windowMs);
}

