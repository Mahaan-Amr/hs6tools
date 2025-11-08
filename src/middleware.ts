import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const locales = ['fa', 'en', 'ar'];
const defaultLocale = 'fa';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
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
