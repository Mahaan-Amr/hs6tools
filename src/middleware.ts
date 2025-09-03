import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const locales = ['fa', 'en', 'ar'];
const defaultLocale = 'fa';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
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
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
