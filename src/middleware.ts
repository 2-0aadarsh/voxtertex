import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Role-based redirect configuration
 */
const ROLE_ROUTES = {
  speaker: '/speakerUser',
  organizer: '/newuser',
  participant: '/participant',
} as const;

/**
 * Middleware for handling role-based redirects
 * 
 * This middleware runs on the server side and can handle redirects
 * based on user roles stored in cookies or JWT tokens.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only handle the /profile route
  if (pathname !== '/profile') {
    return NextResponse.next();
  }

  // Get user role from cookie (you might need to adjust this based on your auth implementation)
  const userRole = request.cookies.get('userRole')?.value;
  
  // Get JWT token from cookie
  const token = request.cookies.get('token')?.value;

  // If no token, redirect to home
  if (!token) {
    console.log('🔒 No token found, redirecting to home');
    return NextResponse.redirect(new URL('/home', request.url));
  }

  // If we have a role, redirect based on it
  if (userRole && userRole in ROLE_ROUTES) {
    const redirectUrl = ROLE_ROUTES[userRole as keyof typeof ROLE_ROUTES];
    console.log(`🔄 Server-side redirect: ${userRole} → ${redirectUrl}`);
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  }

  // If no valid role, redirect to default
  console.log('⚠️ No valid role found, redirecting to default');
  return NextResponse.redirect(new URL('/newuser', request.url));
}

/**
 * Configure which paths the middleware should run on
 */
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
