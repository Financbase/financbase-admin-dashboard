/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import arcjet, { tokenBucket, shield, detectBot } from '@arcjet/next';
import { logger } from '@/lib/logger';

/**
 * Arcjet Security Configuration
 * Provides rate limiting, bot detection, and threat protection
 * 
 * Error handling follows Arcjet best practices:
 * - Fail open: Service issues don't block requests
 * - Timeout: 500ms in production, 1000ms in development (SDK default)
 * - Error checking: Explicitly checks for ERROR results in rule execution
 * 
 * @see https://docs.arcjet.com/reference/nextjs#error-handling
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
 * Helper function to check for errors in Arcjet decision results
 * Logs errors but treats them as ALLOW decisions (fail open)
 * 
 * @param decision - Arcjet decision object
 * @param context - Context for logging (e.g., endpoint name)
 * @returns true if errors were found and logged
 */
function checkDecisionErrors(decision: any, context: string): boolean {
	if (!decision.results || !Array.isArray(decision.results)) {
		return false;
	}

	let hasErrors = false;
	for (const result of decision.results) {
		// Check if result has an error state
		// Arcjet returns ERROR state when rule processing fails
		if (result.state === 'ERROR' || (result as any).isError?.()) {
			hasErrors = true;
			const errorMessage = result.reason?.message || result.message || 'Unknown error';
			
			logger.warn('Arcjet rule execution error', {
				context,
				error: errorMessage,
				ruleType: result.type || 'unknown',
				// Fail open: Log but don't block
			});
		}
	}

	return hasErrors;
}

/**
 * Security utility functions
 */
export class SecurityService {
	/**
	 * Apply rate limiting to API routes
	 * Uses arcjetSecurity instance which applies all configured rules
	 * 
	 * Error handling follows Arcjet best practices:
	 * - Fail open: Allow requests if Arcjet is unavailable
	 * - Log errors for monitoring
	 * - Return appropriate status codes based on decision
	 * 
	 * @see https://docs.arcjet.com/reference/nextjs#error-handling
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

			// Check for errors in rule execution (fail open)
			checkDecisionErrors(decision, `rate-limit:${endpoint}`);

			if (decision.isDenied()) {
				// Determine appropriate status code based on denial reason
				let status = 429; // Default to rate limit
				const reasonStr = String(decision.reason || '');
				if (reasonStr.toLowerCase().includes('bot')) {
					status = 403; // Forbidden for bots
				} else if (reasonStr.toLowerCase().includes('shield') || 
				           reasonStr.toLowerCase().includes('threat')) {
					status = 403; // Forbidden for threats
				}

				return {
					denied: true,
					reason: reasonStr || 'Request denied',
					status,
				};
			}

			// Extract remaining tokens from the decision
			// Arcjet returns remaining in the decision object or results array
			const remaining = (decision as any).remaining ?? (decision.results?.[0] as any)?.remaining ?? null;

			return {
				denied: false,
				remaining,
			};
		} catch (error) {
			// Fail open: Allow request if Arcjet is unavailable
			// This follows Arcjet's recommended error handling pattern
			// Log error for monitoring but don't block legitimate requests
			logger.error('Arcjet rate limit check error', {
				error: error instanceof Error ? error.message : String(error),
				endpoint,
				stack: error instanceof Error ? error.stack : undefined,
				// Fail open: Service continues even if Arcjet is unavailable
			});

			// Fail open - allow the request to proceed
			// This ensures service availability even if Arcjet is temporarily unavailable
			// Timeout defaults: 500ms in production, 1000ms in development
			return {
				denied: false,
				remaining: null,
				error: 'Arcjet unavailable, request allowed',
			};
		}
	}

	/**
	 * Check for bot traffic
	 * 
	 * Error handling follows Arcjet best practices:
	 * - Fail open: Allow requests if Arcjet is unavailable
	 * - Log errors for monitoring
	 * 
	 * @see https://docs.arcjet.com/reference/nextjs#error-handling
	 */
	static async detectBot(request: Request) {
		try {
			const decision = await arcjetSecurity.protect(request);
			
			// Check for errors in rule execution (fail open)
			checkDecisionErrors(decision, 'bot-detection');
			
			// Check if request was denied due to bot detection
			if (decision.isDenied()) {
				const reason = String(decision.reason || '');
				// Check if the denial reason indicates bot detection
				if (reason.toLowerCase().includes('bot') || reason.toLowerCase().includes('automated')) {
					return {
						isBot: true,
						reason: String(decision.reason || ''),
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
			// Fail open: Allow request if Arcjet is unavailable
			// Log error for monitoring but don't block legitimate requests
			logger.error('Arcjet bot detection error', {
				error: error instanceof Error ? error.message : String(error),
				stack: error instanceof Error ? error.stack : undefined,
				// Fail open: Assume not a bot if detection fails
			});

			// Fail open - assume not a bot if detection fails
			return { 
				isBot: false, 
				reason: 'Bot detection unavailable, request allowed',
				error: 'Arcjet unavailable',
			};
		}
	}

	/**
	 * Check for threats
	 * 
	 * Error handling follows Arcjet best practices:
	 * - Fail open: Allow requests if Arcjet is unavailable
	 * - Log errors for monitoring
	 * 
	 * @see https://docs.arcjet.com/reference/nextjs#error-handling
	 */
	static async detectThreats(request: Request) {
		try {
			const decision = await arcjetSecurity.protect(request);
			
			// Check for errors in rule execution (fail open)
			checkDecisionErrors(decision, 'threat-detection');
			
			// Check if request was denied due to threat detection
			if (decision.isDenied()) {
				const reason = String(decision.reason || '');
				// Check if the denial reason indicates threat detection
				if (reason.toLowerCase().includes('shield') || 
					reason.toLowerCase().includes('threat') ||
					reason.toLowerCase().includes('attack')) {
					return {
						isThreat: true,
						reason: String(decision.reason || ''),
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
			// Fail open: Allow request if Arcjet is unavailable
			// Log error for monitoring but don't block legitimate requests
			logger.error('Arcjet threat detection error', {
				error: error instanceof Error ? error.message : String(error),
				stack: error instanceof Error ? error.stack : undefined,
				// Fail open: Assume not a threat if detection fails
			});

			// Fail open - assume not a threat if detection fails
			return { 
				isThreat: false, 
				reason: 'Threat detection unavailable, request allowed',
				error: 'Arcjet unavailable',
			};
		}
	}

	/**
	 * Comprehensive security check
	 * 
	 * Error handling follows Arcjet best practices:
	 * - Fail open: Allow requests if Arcjet is unavailable
	 * - Log errors for monitoring
	 * - Only deny if explicitly detected by Arcjet
	 * 
	 * @see https://docs.arcjet.com/reference/nextjs#error-handling
	 */
	static async securityCheck(request: Request, endpoint: string) {
		try {
			// Rate limiting check
			const rateLimitResult = await this.applyRateLimit(request, endpoint);

			// Bot detection check
			const botResult = await this.detectBot(request);

			// Threat detection check
			const threatResult = await this.detectThreats(request);

			// If any check explicitly denies, deny the request
			// Note: We only deny if Arcjet explicitly denies, not if it's unavailable
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
			// Fail open: Allow request if security check fails
			// This ensures service availability even if Arcjet is temporarily unavailable
			logger.error('Arcjet security check error', {
				error: error instanceof Error ? error.message : String(error),
				endpoint,
				stack: error instanceof Error ? error.stack : undefined,
				// Fail open: Service continues even if Arcjet is unavailable
			});

			// Fail open - allow the request to proceed
			// Timeout defaults: 500ms in production, 1000ms in development
			return {
				denied: false,
				rateLimitRemaining: null,
				error: 'Arcjet unavailable, request allowed',
			};
		}
	}
}

export default SecurityService;
