import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { rateLimitByIp } from '@/lib/rateLimit';

const locales = ['fa', 'en', 'ar'];
const defaultLocale = 'fa';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Rate limit NextAuth credential POSTs to reduce brute-force risk
  if (pathname.startsWith('/api/auth') && request.method === 'POST') {
    const forwarded = request.headers.get('x-forwarded-for');
    const ip =
      (forwarded && forwarded.split(',')[0]?.trim()) ||
      request.headers.get('x-real-ip') ||
      null;
    const limitResult = rateLimitByIp(ip, 'auth-login', 10, 5 * 60 * 1000); // 10 requests / 5 min
    if (!limitResult.allowed) {
      return NextResponse.json(
        { success: false, error: 'Too many login attempts. Please try again later.' },
        { status: 429 }
      );
    }
  }

  // CRITICAL: Handle ZarinPal verification file BEFORE any other processing
  // This must be checked first to prevent Next.js from treating it as a locale
  if (pathname === '/28569823.txt' || 
      pathname === '/fa/28569823.txt' || 
      pathname === '/en/28569823.txt' || 
      pathname === '/ar/28569823.txt') {
    // Rewrite to API route
    const url = request.nextUrl.clone();
    url.pathname = '/api/verify/28569823';
    return NextResponse.rewrite(url);
  }
  
  // Skip middleware for static files (files with extensions)
  // This includes .txt, .jpg, .png, .svg, etc. from public folder
  if (pathname.includes('.')) {
    return;
  }
  
  // Check if the pathname has a locale
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) return;

  // Redirect to default locale if no locale is present
  const locale = defaultLocale;
  request.nextUrl.pathname = `/${locale}${pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  // IMPORTANT: Matcher must include the verification file paths so middleware can handle them
  // We handle them in middleware BEFORE Next.js tries to match routes
  matcher: [
    /*
     * Match all request paths except for:
     * - api (API routes) - handled separately
     * - _next/static (Next.js static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * 
     * NOTE: We DO match 28569823.txt paths so middleware can rewrite them to API route
     * This prevents Next.js from treating them as locale routes
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)'
  ]
};
