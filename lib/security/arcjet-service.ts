/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

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

	// Contact form endpoints (stricter limits for public forms)
	tokenBucket({
		mode: 'LIVE',
		refillRate: 5, // requests per window - stricter for public forms
		interval: 60,
		capacity: 10,
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
// ARCJET_KEY is required - throw error if not set
if (!process.env.ARCJET_KEY) {
	throw new Error(
		'ARCJET_KEY environment variable is required for security. ' +
		'Please set it in your .env.local file. Get your key from https://arcjet.com'
	);
}

export const arcjetSecurity = arcjet({
	key: process.env.ARCJET_KEY,
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
	 * Uses arcjetSecurity instance which applies all configured rules
	 */
	static async applyRateLimit(request: Request, endpoint: string) {
		try {
			// Determine which rate limit rule to use based on endpoint
			let selectedRateLimitRule = rateLimitRules[0]; // Default

			if (endpoint.includes('/auth') || endpoint.includes('/login')) {
				selectedRateLimitRule = rateLimitRules[1]; // Stricter for auth
			} else if (endpoint.includes('/upload') || endpoint.includes('/files')) {
				selectedRateLimitRule = rateLimitRules[2]; // File upload limits
			} else if (endpoint.includes('/contact') || endpoint.includes('/support')) {
				selectedRateLimitRule = rateLimitRules[3]; // Stricter for public forms
			}

			// Create endpoint-specific Arcjet instance with selected rate limit
			const endpointSecurity = arcjet({
				key: process.env.ARCJET_KEY!,
				rules: [
					selectedRateLimitRule,
					...protectionRules,
				],
			});

			const decision = await endpointSecurity.protect(request);

			if (decision.isDenied()) {
				return {
					denied: true,
					reason: decision.reason,
					status: 429,
				};
			}

			// Extract remaining tokens from the decision
			// Arcjet returns remaining in the decision object or results array
			const remaining = (decision as any).remaining ?? decision.results?.[0]?.remaining ?? null;

			return {
				denied: false,
				remaining,
			};
		} catch (error) {
			console.error('Rate limit check error:', error);
			// Deny request if rate limit check fails (fail secure)
			return {
				denied: true,
				reason: 'Rate limit check failed',
				status: 429,
			};
		}
	}

	/**
	 * Check for bot traffic
	 */
	static async detectBot(request: Request) {
		try {
			const decision = await arcjetSecurity.protect(request);
			
			// Check if request was denied due to bot detection
			if (decision.isDenied()) {
				const reason = decision.reason || '';
				// Check if the denial reason indicates bot detection
				if (reason.toLowerCase().includes('bot') || reason.toLowerCase().includes('automated')) {
					return {
						isBot: true,
						reason: decision.reason,
					};
				}
			}

			// Also check results array for bot-related denials
			const botResult = decision.results?.find(
				result => (result as any).state === 'DENY' && 
					((result as any).reason?.toLowerCase().includes('bot') || 
					 (result as any).reason?.toLowerCase().includes('automated'))
			);

			return {
				isBot: botResult !== undefined,
				reason: (botResult as any)?.reason,
			};
		} catch (error) {
			console.error('Bot detection error:', error);
			// Fail secure - treat as bot if detection fails
			return { isBot: true, reason: 'Bot detection failed' };
		}
	}

	/**
	 * Check for threats
	 */
	static async detectThreats(request: Request) {
		try {
			const decision = await arcjetSecurity.protect(request);
			
			// Check if request was denied due to threat detection
			if (decision.isDenied()) {
				const reason = decision.reason || '';
				// Check if the denial reason indicates threat detection
				if (reason.toLowerCase().includes('shield') || 
					reason.toLowerCase().includes('threat') ||
					reason.toLowerCase().includes('attack')) {
					return {
						isThreat: true,
						reason: decision.reason,
					};
				}
			}

			// Also check results array for threat-related denials
			const threatResult = decision.results?.find(
				result => (result as any).state === 'DENY' && 
					((result as any).reason?.toLowerCase().includes('shield') ||
					 (result as any).reason?.toLowerCase().includes('threat') ||
					 (result as any).reason?.toLowerCase().includes('attack'))
			);

			return {
				isThreat: threatResult !== undefined,
				reason: (threatResult as any)?.reason,
			};
		} catch (error) {
			console.error('Threat detection error:', error);
			// Fail secure - treat as threat if detection fails
			return { isThreat: true, reason: 'Threat detection failed' };
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
			// Fail secure - deny request if security check fails
			return {
				denied: true,
				reasons: ['Security check failed'],
				status: 500,
			};
		}
	}
}

export default SecurityService;
