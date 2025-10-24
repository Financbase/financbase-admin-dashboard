import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';

// Create next-intl middleware for locale handling
const intlMiddleware = createMiddleware({
  locales: ['en', 'es', 'fr', 'de'],
  defaultLocale: 'en',
  localeDetection: false,
  localePrefix: 'never'
});

// Create Clerk route matcher for protected routes
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/api/accounts(.*)',
  '/api/ai(.*)',
  '/api/analytics(.*)',
  '/api/approval-workflows(.*)',
  '/api/bills(.*)',
  '/api/byok(.*)',
  '/api/campaigns(.*)',
  '/api/clients(.*)',
  '/api/contact(.*)',
  '/api/dashboard(.*)',
  '/api/dashboards(.*)',
  '/api/developer(.*)',
  '/api/email(.*)',
  '/api/expenses(.*)',
  '/api/financial-intelligence(.*)',
  '/api/help(.*)',
  '/api/integrations(.*)',
  '/api/investor-portal(.*)',
  '/api/invoices(.*)',
  '/api/leads(.*)',
  '/api/marketplace(.*)',
  '/api/monitoring(.*)',
  '/api/notifications(.*)',
  '/api/onboarding(.*)',
  '/api/payment-methods(.*)',
  '/api/payments(.*)',
  '/api/performance(.*)',
  '/api/projects(.*)',
  '/api/reconciliation(.*)',
  '/api/reports(.*)',
  '/api/search(.*)',
  '/api/security(.*)',
  '/api/settings(.*)',
  '/api/time-entries(.*)',
  '/api/transactions(.*)',
  '/api/unified-dashboard(.*)',
  '/api/uploadthing(.*)',
  '/api/vendors(.*)',
  '/api/video-conferencing(.*)',
  '/api/webhooks(.*)',
  '/api/workflows(.*)',
]);

// Routes that are always allowed (public or auth-related)
const isPublicRoute = createRouteMatcher([
  '/',
  '/auth(.*)',
  '/onboarding(.*)',
  '/api/health(.*)',
  '/api/test(.*)',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/sign-out(.*)',
]);

export default clerkMiddleware(async (auth, request) => {
  // Temporarily disable next-intl middleware to fix routing
  // const intlResponse = intlMiddleware(request as any);
  // if (intlResponse) {
  //   return intlResponse;
  // }

  // Test mode bypass - allow access when TEST_MODE is enabled
  if (process.env.TEST_MODE === 'true' || process.env.NODE_ENV === 'test') {
    console.log('🧪 Test mode enabled - bypassing authentication for:', request.nextUrl.pathname);
    return NextResponse.next();
  }

  // Development mode bypass for auth pages and public API routes
  if (process.env.NODE_ENV === 'development' &&
      (request.nextUrl.pathname.startsWith('/auth/') ||
       request.nextUrl.pathname === '/' ||
       request.nextUrl.pathname.startsWith('/api/health') ||
       request.nextUrl.pathname.startsWith('/api/test'))) {
    return NextResponse.next();
  }

  // Skip authentication for health and test API routes
  if (request.nextUrl.pathname.startsWith('/api/health') ||
      request.nextUrl.pathname.startsWith('/api/test-')) {
    return NextResponse.next();
  }

  // Allow public routes
  if (isPublicRoute(request)) {
    return NextResponse.next();
  }

  // Protect routes that require authentication
  if (isProtectedRoute(request)) {
    const { userId } = await auth.protect();
    
    // Check if user needs onboarding
    if (userId && request.nextUrl.pathname.startsWith('/dashboard')) {
      try {
        // Check onboarding status
        const response = await fetch(`${request.nextUrl.origin}/api/onboarding`, {
          headers: {
            'Authorization': `Bearer ${await auth.getToken()}`,
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          
          // If no onboarding exists or it's not completed, redirect to onboarding
          if (!data.onboarding || data.onboarding.userOnboarding.status !== 'completed') {
            return NextResponse.redirect(new URL('/onboarding', request.url));
          }
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error);
        // Continue to dashboard if check fails
      }
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
