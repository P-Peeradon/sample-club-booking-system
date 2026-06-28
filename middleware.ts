import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { locales, defaultLocale, timezones, defaultTimezone } from './lib/app-config';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Skip paths that don't need locale routing (api, public files, next internals)
  const isExcluded = 
    pathname.startsWith('/api') || 
    pathname.startsWith('/_next') || 
    pathname.match(/\.(png|ico|jpg|jpeg|svg|css)$/);

  if (isExcluded) return NextResponse.next();

  // 2. Check if the current pathname already has a valid locale
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  // 3. Resolve preferred locale and timezone from cookies
  const cookieLocale = request.cookies.get('USER_LOCALE')?.value;
  const cookieTimezone = request.cookies.get('USER_TIMEZONE')?.value;

  const resolvedLocale = locales.includes(cookieLocale as any) ? cookieLocale : defaultLocale;
  const resolvedTimezone = timezones.includes(cookieTimezone as any) ? cookieTimezone : defaultTimezone;

  // 4. Redirect to locale path if it's missing
  if (!pathnameHasLocale) {
    request.nextUrl.pathname = `/${resolvedLocale}${pathname === '/' ? '' : pathname}`;
    const response = NextResponse.redirect(request.nextUrl);
    // Persist cookies if they weren't set yet (optional but good practice)
    response.cookies.set('USER_LOCALE', resolvedLocale || 'en', { path: '/' });
    response.cookies.set('USER_TIMEZONE', resolvedTimezone || 'America/Los_Angeles', { path: '/' });
    return response;
  }

  // 5. If it HAS a locale, we need to extract it to put it into the headers
  const currentLocale = locales.find(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  ) || defaultLocale;

  // 6. Rewrite the request headers with our deep-layer config
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-locale', currentLocale);
  requestHeaders.set('x-timezone', resolvedTimezone || 'America/Los_Angeles');
  requestHeaders.set('x-pathname', pathname);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

// Config to run middleware on all routes
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
