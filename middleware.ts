import { clerkMiddleware } from "@clerk/nextjs/server";
import { type NextRequest, NextResponse } from "next/server";

const isProtectedRoute = (request: NextRequest) => {
  const pathname = request.nextUrl.pathname;

  // Protect dashboard routes
  if (pathname.startsWith("/dashboard")) {
    return true;
  }

  // Protect API routes except public endpoints
  if (pathname.startsWith("/api/")) {
    // Allow public access to health check for monitoring
    if (pathname === "/api/health") {
      return false;
    }

    // Allow test routes for development/testing
    if (pathname.startsWith("/api/test-")) {
      return false;
    }

    // Protect all other API routes (including transactions)
    return true;
  }

  return false;
};

export default clerkMiddleware(async (auth, request) => {
  // Test mode bypass - allow access when TEST_MODE is enabled
  if (process.env.TEST_MODE === 'true' || process.env.NODE_ENV === 'test') {
    console.log('🧪 Test mode enabled - bypassing authentication for:', request.nextUrl.pathname);
    return NextResponse.next();
  }

  // Development mode bypass for auth pages
  if (process.env.NODE_ENV === 'development' && 
      (request.nextUrl.pathname.startsWith('/auth/') || 
       request.nextUrl.pathname === '/')) {
    return NextResponse.next();
  }

  if (isProtectedRoute(request)) {
    const { userId } = await auth();

    // For API routes, return explicit 401 JSON instead of redirect
    if (request.nextUrl.pathname.startsWith("/api/")) {
      if (!userId) {
        return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
      }
    } else {
      // For non-API routes, use Clerk's default protection
      await auth.protect();
    }
  }

  // Simple CORS headers for performance
  const response = NextResponse.next();

  // Comprehensive security headers
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "origin-when-cross-origin");

  // Content Security Policy - comprehensive for all services
  const cspValue = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' *.clerk.accounts.dev *.clerk.dev *.sentry.io *.posthog.com js.stripe.com *.uploadthing.com *.algolia.net *.algolianet.com",
    "worker-src 'self' blob: *.clerk.accounts.dev *.clerk.dev",
    "style-src 'self' 'unsafe-inline' fonts.googleapis.com *.uploadthing.com",
    "img-src 'self' data: https: blob: *.clerk.accounts.dev *.clerk.dev *.uploadthing.com *.algolia.net *.algolianet.com *.stripe.com *.posthog.com",
    "font-src 'self' fonts.gstatic.com fonts.googleapis.com",
    "connect-src 'self' *.clerk.accounts.dev *.clerk.dev *.sentry.io *.posthog.com api.openai.com api.resend.com *.algolia.net *.algolianet.com *.uploadthing.com api.stripe.com *.anthropic.com *.google.com *.partykit.dev wss: https:",
    "frame-src 'self' *.clerk.accounts.dev *.clerk.dev js.stripe.com *.uploadthing.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "block-all-mixed-content",
    "upgrade-insecure-requests"
  ].join("; ");

  response.headers.set("Content-Security-Policy", cspValue);

  // Strict Transport Security - only set if HTTPS
  if (request.headers.get("x-forwarded-proto") === "https" || request.nextUrl.protocol === "https:") {
    response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  }

  // Permissions Policy
  const permissionsPolicy = [
    "camera=()",
    "microphone=()",
    "geolocation=()",
    "interest-cohort=()",
    "payment=(self)",
    "usb=()"
  ].join(", ");

  response.headers.set("Permissions-Policy", permissionsPolicy);

  // Remove server information disclosure
  response.headers.set("X-Powered-By", "");

  // Security headers for file downloads
  if (request.nextUrl.pathname.includes("/api/")) {
    response.headers.set("X-Download-Options", "noopen");
  }

  return response;
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)"
  ],
};
