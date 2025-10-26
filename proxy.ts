import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const isPublicRoute = createRouteMatcher([
  '/',
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

const isIgnoredRoute = createRouteMatcher([
  '/api/webhooks/stripe',
  '/api/webhooks/paypal',
  '/api/webhooks/clerk',
]);

export default clerkMiddleware(async (auth, req: NextRequest) => {
  // Log API requests for debugging
  if (req.nextUrl.pathname.startsWith('/api/')) {
    console.log(`[Middleware] API Request: ${req.method} ${req.nextUrl.pathname}`);
  }

  // Handle public routes
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // Handle ignored routes
  if (isIgnoredRoute(req)) {
    return NextResponse.next();
  }

  // Allow dashboard access during testing
  if (process.env.TEST_MODE === 'true' && req.nextUrl.pathname.startsWith('/dashboard')) {
    console.log('[Middleware] Test mode - allowing dashboard access');
    return NextResponse.next();
  }

  // Protect all other routes
  const { userId } = await auth();
  if (!userId) {
    // Handle API routes that require authentication
    if (req.nextUrl.pathname.startsWith('/api/')) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
          message: 'Authentication required',
          code: 'UNAUTHORIZED'
        },
        { status: 401 }
      );
    }

    // Handle dashboard routes
    if (req.nextUrl.pathname.startsWith('/dashboard')) {
      const signInUrl = new URL('/auth/sign-in', req.url);
      signInUrl.searchParams.set('redirect_url', req.url);
      return NextResponse.redirect(signInUrl);
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
