import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher([
  // '/' is handled separately in middleware
  '/auth/sign-in(.*)',
  '/auth/sign-up(.*)',
  '/api/health',
  '/api/test-simple',
  '/api/test-minimal',
  '/api/test-minimal-2',
  '/api/test-minimal-final',
  '/api/contact',
  '/api/webhooks(.*)',
]);

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  // '/real-estate(.*)', // Temporarily disable auth for real estate routes for testing
  '/profile(.*)',
  '/settings(.*)',
  '/api/leads(.*)',
  '/api/onboarding(.*)',
  '/api/accounts(.*)',
  '/api/invoices(.*)',
  '/api/expenses(.*)',
  '/api/reports(.*)',
  '/api/clients(.*)',
  '/api/projects(.*)',
  '/api/auth(.*)',
  '/api/ai(.*)',
  '/api/dashboard(.*)',
  '/api/support(.*)',
  '/api/platform(.*)', // Add Platform Services API routes
  '/api/workflows(.*)', // Add Workflows API routes
  '/api/monitoring(.*)', // Add Monitoring API routes
  '/api/integrations(.*)', // Add Integrations API routes
  // '/api/real-estate(.*)', // Temporarily disable auth for real estate API routes for testing
  '/onboarding(.*)',
]);

const isAuthRoute = createRouteMatcher([
  '/auth(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl;

  // Explicitly exclude Next.js internal files and static assets
  // This ensures middleware doesn't interfere with chunk loading
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/static/') ||
    pathname.includes('/favicon.ico') ||
    pathname.includes('/manifest.json') ||
    pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/)
  ) {
    return NextResponse.next();
  }

  // Handle root route - always redirect (avoid auth() call to prevent headers() issues)
  // Since we redirect regardless of auth status, we can skip the auth() call
  if (pathname === '/') {
    // Try to get auth status, but if it fails due to headers() issue, just redirect to home
    try {
      const { userId } = await auth();
      if (userId) {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
    } catch (error) {
      // If auth() fails due to headers() issue, redirect to home as fallback
      console.warn('Auth check failed for root route, redirecting to home:', error);
    }
    // Unauthenticated users go to home page
    return NextResponse.redirect(new URL('/home', req.url));
  }

  // Get userId only when needed (for protected routes and auth route checks)
  const { userId } = await auth();

  // Allow public routes without authentication
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // Protect routes that require authentication
  if (isProtectedRoute(req)) {
    if (!userId) {
      // For API routes, return 401 JSON response
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          {
            error: 'Unauthorized',
            message: 'Authentication required',
            code: 'UNAUTHORIZED'
          },
          { status: 401 }
        );
      }
      // For page routes, redirect to sign-in
      return NextResponse.redirect(new URL('/auth/sign-in', req.url));
    }
  }

  // If user is authenticated and accessing auth pages, redirect to dashboard
  if (userId && isAuthRoute(req)) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - _next/webpack (webpack chunks)
     * - favicon.ico, sitemap.xml, robots.txt
     * - Files with static extensions (.js, .css, .png, etc.)
     */
    '/((?!_next/static|_next/image|_next/webpack|favicon.ico|sitemap|robots.txt|.*\\.(?:js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)).*)',
    '/(api|trpc)(.*)',
  ],
};
