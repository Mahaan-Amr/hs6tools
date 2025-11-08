import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const locales = ['fa', 'en', 'ar'];
const defaultLocale = 'fa';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
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
  // Exclude API routes, Next.js internals, and files with extensions (static files)
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - files with extensions (.*\.*) - static files from public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'
  ]
};
