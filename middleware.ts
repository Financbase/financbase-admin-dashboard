import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  // '/real-estate(.*)', // Temporarily disabled for testing
  '/profile(.*)',
  '/settings(.*)',
  '/api/leads(.*)',
  '/api/webhooks(.*)',
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
  '/api/platform(.*)',
  '/api/workflows(.*)',
  '/api/monitoring(.*)',
  '/api/integrations(.*)',
  '/api/real-estate(.*)',
  '/onboarding(.*)',
]);

export default clerkMiddleware((auth, req) => {
  if (isProtectedRoute(req)) auth().protect();
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
