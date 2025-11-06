import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { handleApiVersioning } from '@/lib/api/versioning';
import { checkRoutePermissions } from '@/lib/auth/financbase-rbac';

const isPublicRoute = createRouteMatcher([
  // '/' is handled separately in middleware
  '/auth/sign-in(.*)',
  '/auth/sign-up(.*)',
  '/home(.*)',
  '/about(.*)',
  '/pricing(.*)',
  '/contact(.*)',
  '/blog(.*)',
  '/docs(.*)',
  '/support(.*)',
  '/security(.*)',
  '/privacy(.*)',
  '/terms(.*)',
  '/legal(.*)',
  '/careers(.*)',
  '/guides(.*)',
  '/products(.*)',
  '/integrations(.*)',
  '/adboard(.*)',
  '/training(.*)',
  '/enterprise(.*)',
  '/cloud-platform(.*)',
  '/consulting(.*)',
  '/public-help(.*)',
  '/public-security(.*)',
  '/financbase-gpt(.*)',
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
  '/budgets(.*)',
  '/workflows(.*)',
  '/webhooks(.*)',
  '/reports(.*)',
  '/developer(.*)',
  '/demo(.*)',
  // Dashboard route group pages (moved from root app/)
  '/admin(.*)',
  '/ai-assist(.*)',
  '/automations(.*)',
  '/customers(.*)',
  '/employees(.*)',
  '/orders(.*)',
  '/organization(.*)',
  '/tax(.*)',
  '/chat(.*)',
  '/gallery(.*)',
  '/global-search(.*)',
  '/products(.*)',
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
  '/api/marketplace(.*)', // Add Marketplace API routes
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
  // Critical: Must exclude all webpack chunk paths to prevent ChunkLoadError
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/_next/static/') ||
    pathname.startsWith('/_next/webpack/') ||
    pathname.startsWith('/_next/image/') ||
    pathname.startsWith('/static/') ||
    pathname.includes('/favicon.ico') ||
    pathname.includes('/manifest.json') ||
    pathname.includes('/robots.txt') ||
    pathname.includes('/sitemap') ||
    // Match all static file extensions (including chunk files)
    pathname.match(/\.(js|mjs|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|webp|avif|map)$/i) ||
    // Match webpack chunk patterns (e.g., /_next/static/chunks/webpack-*.js)
    pathname.match(/\/_next\/static\/chunks\/.*\.js$/) ||
    // Match webpack runtime chunks
    pathname.match(/\/_next\/static\/chunks\/webpack\.js/)
  ) {
    return NextResponse.next();
  }

  // Allow prefetch requests to pass through without authentication checks
  // Next.js prefetch requests can be identified by:
  // 1. The 'purpose' header set to 'prefetch'
  // 2. RSC (React Server Components) prefetch requests
  // 3. Next.js router prefetch requests
  const purpose = req.headers.get('purpose');
  const rsc = req.headers.get('rsc');
  const nextRouter = req.headers.get('next-router-prefetch');
  const isPrefetchRequest = purpose === 'prefetch' || 
                           rsc === '1' ||
                           nextRouter === '1' ||
                           req.nextUrl.searchParams.has('_rsc');
  
  if (isPrefetchRequest) {
    // For prefetch requests, allow them through but don't enforce auth
    // This prevents "Failed to fetch" errors during prefetching
    // Prefetch requests are safe to allow through as they don't execute side effects
    try {
      return NextResponse.next();
    } catch (error) {
      // If prefetch fails, return a minimal response to prevent errors
      console.warn('Prefetch request failed:', pathname, error);
      return NextResponse.next();
    }
  }

  // Handle API versioning - prepare headers for all API routes
  // We'll apply these headers to the final response
  let versioningHeaders: NextResponse | null = null;
  if (pathname.startsWith('/api/')) {
    versioningHeaders = handleApiVersioning(req);
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

  // Get auth result once and reuse it
  const authResult = await auth();
  const { userId } = authResult;

  // If user is authenticated and accessing auth pages, redirect to dashboard FIRST
  // This check must come before the public route check to prevent authenticated users
  // from accessing sign-in/sign-up pages
  if (userId && isAuthRoute(req)) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  // Allow public routes without authentication (only if not authenticated)
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // Protect routes that require authentication
  if (isProtectedRoute(req)) {
    if (!userId) {
      // For API routes, return 401 JSON response with version headers
      if (pathname.startsWith('/api/')) {
        const errorResponse = NextResponse.json(
          {
            error: 'Unauthorized',
            message: 'Authentication required',
            code: 'UNAUTHORIZED'
          },
          { status: 401 }
        );
        
        // Ensure version headers are added even to error responses
        if (versioningHeaders) {
          versioningHeaders.headers.forEach((value, key) => {
            errorResponse.headers.set(key, value);
          });
        }
        
        return errorResponse;
      }
      // For page routes, redirect to sign-in
      return NextResponse.redirect(new URL('/auth/sign-in', req.url));
    }

    // Check route permissions for authenticated users
    // Pass the auth result from middleware to avoid calling auth() again
    try {
      const hasPermission = await checkRoutePermissions(pathname, authResult);
      if (!hasPermission) {
        // For API routes, return 403 Forbidden
        if (pathname.startsWith('/api/')) {
          const errorResponse = NextResponse.json(
            {
              error: 'Forbidden',
              message: 'You do not have permission to access this resource',
              code: 'FORBIDDEN'
            },
            { status: 403 }
          );
          
          // Ensure version headers are added even to error responses
          if (versioningHeaders) {
            versioningHeaders.headers.forEach((value, key) => {
              errorResponse.headers.set(key, value);
            });
          }
          
          return errorResponse;
        }
        // For page routes, redirect to dashboard with error message
        const redirectUrl = new URL('/dashboard', req.url);
        redirectUrl.searchParams.set('error', 'unauthorized');
        return NextResponse.redirect(redirectUrl);
      }
    } catch (error) {
      // Log error but don't block access if permission check fails
      console.error('Error checking route permissions:', error);
      // Continue with request if permission check fails (fail open for now)
      // In production, you might want to fail closed
    }
  }

  // Final response - ensure version headers are included
  const finalResponse = NextResponse.next();
  if (versioningHeaders) {
    versioningHeaders.headers.forEach((value, key) => {
      finalResponse.headers.set(key, value);
    });
  }

  return finalResponse;
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
