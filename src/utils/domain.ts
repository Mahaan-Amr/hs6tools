import { NextRequest } from "next/server";

/**
 * Get the site origin from request headers
 * Priority: x-forwarded-host > host header > NEXT_PUBLIC_APP_URL > request.nextUrl.origin
 * 
 * @param request - Next.js request object
 * @returns The site origin URL (e.g., "https://hs6tools.com")
 */
export function getSiteOrigin(request: NextRequest): string {
  // Priority 1: x-forwarded-host (from reverse proxy/load balancer)
  const forwardedHost = request.headers.get('x-forwarded-host');
  const forwardedProto = request.headers.get('x-forwarded-proto') || 'https';
  
  if (forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`;
  }
  
  // Priority 2: host header (if not localhost)
  const host = request.headers.get('host');
  if (host && !host.includes('localhost') && !host.includes('127.0.0.1')) {
    const protocol = request.headers.get('x-forwarded-proto') || 
                     (request.nextUrl.protocol === 'https:' ? 'https' : 'http');
    return `${protocol}://${host}`;
  }
  
  // Priority 3: Environment variable
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  
  // Fallback: Use request origin (may be localhost in development)
  return request.nextUrl.origin;
}

