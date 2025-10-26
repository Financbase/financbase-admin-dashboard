import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Rate limiting store (in production, use Redis or similar)
const rateLimitStore = new Map();

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX_REQUESTS = 100; // requests per window

// Create route matchers for protected and public routes
const isProtectedRoute = createRouteMatcher([
	'/dashboard(.*)',
	'/api/(?!auth|webhooks)(.*)',
	'/settings(.*)',
	'/admin(.*)',
]);

const isPublicRoute = createRouteMatcher([
	'/',
	'/auth(.*)',
	'/api/auth(.*)',
	'/api/webhooks(.*)',
	'/about(.*)',
	'/pricing(.*)',
	'/blog(.*)',
	'/careers(.*)',
	'/contact(.*)',
]);

// Rate limiting function
function checkRateLimit(ip: string): boolean {
	const now = Date.now();
	const userRequests = rateLimitStore.get(ip) || [];

	// Filter requests within the current window
	const recentRequests = userRequests.filter((timestamp: number) => now - timestamp < RATE_LIMIT_WINDOW);

	// Check if under limit
	if (recentRequests.length >= RATE_LIMIT_MAX_REQUESTS) {
		return false;
	}

	// Update the store
	recentRequests.push(now);
	rateLimitStore.set(ip, recentRequests);

	// Clean up old entries periodically
	if (rateLimitStore.size > 1000) {
		for (const [key, timestamps] of rateLimitStore.entries()) {
			const validTimestamps = (timestamps as number[]).filter((timestamp: number) => now - timestamp < RATE_LIMIT_WINDOW);
			if (validTimestamps.length === 0) {
				rateLimitStore.delete(key);
			} else {
				rateLimitStore.set(key, validTimestamps);
			}
		}
	}

	return true;
}

export default clerkMiddleware(async (auth, req) => {
	const { pathname } = req.nextUrl;

	// Skip rate limiting for health checks and static assets
	if (pathname.startsWith('/_next/') || pathname.startsWith('/api/health')) {
		return NextResponse.next();
	}

	// Get client IP for rate limiting
	const forwardedFor = req.headers.get('x-forwarded-for');
	const realIP = req.headers.get('x-real-ip');
	const clientIP = forwardedFor?.split(',')[0] || realIP || 'unknown';

	// Check rate limit
	if (!checkRateLimit(clientIP)) {
		return new NextResponse('Rate limit exceeded. Please try again later.', {
			status: 429,
			headers: {
				'Retry-After': Math.ceil(RATE_LIMIT_WINDOW / 1000).toString(),
				'X-RateLimit-Limit': RATE_LIMIT_MAX_REQUESTS.toString(),
				'X-RateLimit-Window': RATE_LIMIT_WINDOW.toString(),
			},
		});
	}

	// Handle public routes (no auth required)
	if (isPublicRoute(req)) {
		return NextResponse.next();
	}

	// Handle protected routes (auth required)
	if (isProtectedRoute(req)) {
		// This will redirect to sign-in if not authenticated
		await auth.protect();
	}

	// Handle API routes
	if (pathname.startsWith('/api/')) {
		// Add security headers for API responses
		const response = NextResponse.next();
		response.headers.set('X-Content-Type-Options', 'nosniff');
		response.headers.set('X-Frame-Options', 'DENY');
		response.headers.set('X-XSS-Protection', '1; mode=block');

		return response;
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
