import { clerkMiddleware } from "@clerk/nextjs/server";
import { type NextRequest, NextResponse } from "next/server";

const isProtectedRoute = (request: NextRequest) => {
	const pathname = request.nextUrl.pathname;

	// Protect dashboard routes
	if (pathname.startsWith("/dashboard")) {
		// Allow dashboard access for testing if test credentials are provided
		if (process.env.TEST_USER_EMAIL && process.env.NODE_ENV === 'development') {
			return false;
		}
		return true;
	}

	// Protect API routes except test routes and health check
	if (pathname.startsWith("/api/")) {
		// Allow public access to health check for monitoring
		if (pathname === "/api/health") {
			return false;
		}
		return !pathname.startsWith("/api/test-");
	}

	return false;
};

export default clerkMiddleware(async (auth, request) => {
	if (isProtectedRoute(request)) {
		await auth.protect();
	}

	// Simple CORS headers for performance
	const response = NextResponse.next();

	// Comprehensive security headers
	response.headers.set("X-Frame-Options", "DENY");
	response.headers.set("X-Content-Type-Options", "nosniff");
	response.headers.set("X-XSS-Protection", "1; mode=block");
	response.headers.set("Referrer-Policy", "origin-when-cross-origin");

	// Content Security Policy - restrictive but functional
	const cspValue = [
		"default-src 'self'",
		"script-src 'self' 'unsafe-inline' 'unsafe-eval' *.clerk.accounts.dev *.clerk.dev",
		"style-src 'self' 'unsafe-inline' fonts.googleapis.com",
		"img-src 'self' data: https: blob:",
		"font-src 'self' fonts.gstatic.com",
		"connect-src 'self' *.clerk.accounts.dev *.clerk.dev wss: https:",
		"frame-src 'self' *.clerk.accounts.dev *.clerk.dev",
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
		"/((?!_next/static|_next/image|favicon.ico).*)",
	],
};
