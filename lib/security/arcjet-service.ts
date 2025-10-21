import arcjet, { tokenBucket, shield, detectBot } from '@arcjet/next';

/**
 * Arcjet Security Configuration
 * Provides rate limiting, bot detection, and threat protection
 */

// Rate limiting rules
const rateLimitRules = [
	// General API rate limiting
	tokenBucket({
		mode: 'LIVE', // Use "DRY_RUN" for testing
		refillRate: 100, // requests per window
		interval: 60, // window in seconds
		capacity: 200, // maximum burst
	}),

	// Authentication endpoints (stricter limits)
	tokenBucket({
		mode: 'LIVE',
		refillRate: 10, // requests per window
		interval: 60,
		capacity: 20,
	}),

	// File upload endpoints
	tokenBucket({
		mode: 'LIVE',
		refillRate: 50, // requests per window
		interval: 60,
		capacity: 100,
	}),
];

// Bot detection and threat protection
const protectionRules = [
	shield({
		mode: 'LIVE',
	}),
	detectBot({
		mode: 'LIVE',
		allow: [], // Block all bots by default
	}),
];

// Create Arcjet instance with rules
export const arcjetSecurity = arcjet({
	key: process.env.ARCJET_KEY!,
	rules: [
		...rateLimitRules,
		...protectionRules,
	],
});

/**
 * Security utility functions
 */
export class SecurityService {
	/**
	 * Apply rate limiting to API routes
	 */
	static async applyRateLimit(request: Request, endpoint: string) {
		try {
			// Apply different rate limits based on endpoint type
			let rateLimitRule = rateLimitRules[0]; // Default

			if (endpoint.includes('/auth') || endpoint.includes('/login')) {
				rateLimitRule = rateLimitRules[1]; // Stricter for auth
			} else if (endpoint.includes('/upload') || endpoint.includes('/files')) {
				rateLimitRule = rateLimitRules[2]; // File upload limits
			}

			const decision = await rateLimitRule.protect(request);

			if (decision.isDenied()) {
				return {
					denied: true,
					reason: decision.reason,
					status: 429,
				};
			}

			return {
				denied: false,
				remaining: decision.remaining,
			};
		} catch (error) {
			console.error('Rate limit check error:', error);
			// Allow request to proceed if rate limit check fails
			return {
				denied: false,
			};
		}
	}

	/**
	 * Check for bot traffic
	 */
	static async detectBot(request: Request) {
		try {
			const botRule = protectionRules.find(rule => rule.type === 'DETECT_BOT');
			if (!botRule) return { isBot: false };

			const decision = await botRule.protect(request);

			return {
				isBot: decision.isDenied(),
				reason: decision.reason,
			};
		} catch (error) {
			console.error('Bot detection error:', error);
			return { isBot: false };
		}
	}

	/**
	 * Check for threats
	 */
	static async detectThreats(request: Request) {
		try {
			const shieldRule = protectionRules.find(rule => rule.type === 'SHIELD');
			if (!shieldRule) return { isThreat: false };

			const decision = await shieldRule.protect(request);

			return {
				isThreat: decision.isDenied(),
				reason: decision.reason,
			};
		} catch (error) {
			console.error('Threat detection error:', error);
			return { isThreat: false };
		}
	}

	/**
	 * Comprehensive security check
	 */
	static async securityCheck(request: Request, endpoint: string) {
		try {
			// Rate limiting check
			const rateLimitResult = await this.applyRateLimit(request, endpoint);

			// Bot detection check
			const botResult = await this.detectBot(request);

			// Threat detection check
			const threatResult = await this.detectThreats(request);

			// If any check fails, deny the request
			if (rateLimitResult.denied || botResult.isBot || threatResult.isThreat) {
				return {
					denied: true,
					reasons: [
						rateLimitResult.denied && `Rate limit: ${rateLimitResult.reason}`,
						botResult.isBot && `Bot detected: ${botResult.reason}`,
						threatResult.isThreat && `Threat detected: ${threatResult.reason}`,
					].filter(Boolean),
					status: rateLimitResult.status || 403,
				};
			}

			return {
				denied: false,
				rateLimitRemaining: rateLimitResult.remaining,
			};
		} catch (error) {
			console.error('Security check error:', error);
			// Allow request if security check fails
			return { denied: false };
		}
	}
}

export default SecurityService;
