import { NextRequest, NextResponse } from 'next/server';

// ========== PROTECTED ROUTES CONFIG ==========
const ADMIN_ROUTES = ['/dashboard'];
const ASESOR_ROUTES = ['/dashboard'];
const CLIENTE_ROUTES = ['/my-courses', '/checkout-success', '/profile'];
const PUBLIC_ROUTES = [
  '/',
  '/about',
  '/academy',
  '/propiedades',
  '/services',
  '/portfolio',
  '/privacy',
  '/terms',
  '/contacto',
];

// ========== MIDDLEWARE FUNCTION ==========
export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Allow public routes
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Allow API routes to proceed (they handle auth separately)
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Allow static assets
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/public') ||
    pathname.match(/\.(jpg|jpeg|png|gif|svg|webp|ico|json)$/)
  ) {
    return NextResponse.next();
  }

  // Get session token from cookie
  const sessionToken = request.cookies.get('ohb_session')?.value;
  const userRole = request.cookies.get('ohb_role')?.value as
    | 'admin'
    | 'asesor'
    | 'cliente'
    | undefined;

  // Check if route requires authentication
  if (pathname.startsWith('/dashboard')) {
    // Admin/Asesor only
    if (!sessionToken) {
      return redirectToLogin(pathname);
    }

    if (userRole !== 'admin' && userRole !== 'asesor') {
      return NextResponse.redirect(new URL('/', request.url));
    }

    // Validate session token (basic check - real validation in API)
    if (!isValidSessionToken(sessionToken)) {
      return redirectToLogin(pathname);
    }
  }

  if (isClientOnlyRoute(pathname)) {
    // Client routes - requires authentication
    if (!sessionToken) {
      return redirectToLogin(pathname);
    }

    if (userRole !== 'cliente' && userRole !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url));
    }

    if (!isValidSessionToken(sessionToken)) {
      return redirectToLogin(pathname);
    }
  }

  // Set security headers
  const response = NextResponse.next();
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set(
    'Referrer-Policy',
    'strict-origin-when-cross-origin'
  );

  return response;
}

// ========== HELPER FUNCTIONS ==========

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(
    (route) =>
      pathname === route || pathname.startsWith(route + '/') || pathname.startsWith('/api/')
  );
}

function isClientOnlyRoute(pathname: string): boolean {
  return CLIENTE_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + '/')
  );
}

function isValidSessionToken(token: string): boolean {
  // Basic validation - check if token exists and has reasonable format
  if (!token || token.length < 20) {
    return false;
  }

  // Check if token is a valid JWT-like format (3 parts separated by dots)
  // or localStorage-generated format
  const parts = token.split('.');
  if (parts.length !== 3 && !token.startsWith('local_')) {
    return false;
  }

  return true;
}

function redirectToLogin(returnUrl: string): NextResponse {
  const loginUrl = new URL('/login', 'http://localhost:3000');
  loginUrl.searchParams.set('redirect', returnUrl);
  return NextResponse.redirect(loginUrl);
}

// ========== MATCHER CONFIG ==========
// Run middleware on these paths
export const config = {
  matcher: [
    // Run on all routes except these
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
};
