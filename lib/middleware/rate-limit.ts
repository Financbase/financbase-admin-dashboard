/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { NextRequest, NextResponse } from 'next/server';
import { RATE_LIMIT } from '@/lib/constants/tax-constants';
import { cache } from '@/lib/cache/cache-manager';

export interface RateLimitConfig {
	requests: number;
	windowMs: number;
	keyPrefix?: string;
}

export interface RateLimitResult {
	allowed: boolean;
	remaining: number;
	resetTime: number;
}

/**
 * Rate limiter using cache
 */
export class RateLimiter {
	private config: RateLimitConfig;

	constructor(config: RateLimitConfig) {
		this.config = config;
	}

	/**
	 * Check if request is allowed
	 */
	async checkLimit(identifier: string): Promise<RateLimitResult> {
		const key = `${this.config.keyPrefix || 'rate-limit'}:${identifier}`;
		const windowStart = Math.floor(Date.now() / this.config.windowMs) * this.config.windowMs;
		const cacheKey = `${key}:${windowStart}`;

		// Get current count
		const currentCount = await cache.get<number>(cacheKey) || 0;

		// Check if limit exceeded
		if (currentCount >= this.config.requests) {
			return {
				allowed: false,
				remaining: 0,
				resetTime: windowStart + this.config.windowMs,
			};
		}

		// Increment count
		const newCount = currentCount + 1;
		await cache.set(cacheKey, newCount, {
			ttl: Math.ceil(this.config.windowMs / 1000), // Convert to seconds
			namespace: 'rate-limit',
		});

		return {
			allowed: true,
			remaining: this.config.requests - newCount,
			resetTime: windowStart + this.config.windowMs,
		};
	}
}

/**
 * Create rate limit middleware
 */
export function createRateLimitMiddleware(config: RateLimitConfig) {
	const limiter = new RateLimiter(config);

	return async (request: NextRequest, userId: string): Promise<NextResponse | null> => {
		const result = await limiter.checkLimit(userId);

		if (!result.allowed) {
			const resetTimeSeconds = Math.ceil((result.resetTime - Date.now()) / 1000);
			return NextResponse.json(
				{
					success: false,
					error: {
						message: 'Rate limit exceeded',
						code: 'RATE_LIMIT_EXCEEDED',
						statusCode: 429,
						details: {
							remaining: result.remaining,
							resetTime: result.resetTime,
							retryAfter: resetTimeSeconds,
						},
					},
				},
				{
					status: 429,
					headers: {
						'X-RateLimit-Limit': config.requests.toString(),
						'X-RateLimit-Remaining': result.remaining.toString(),
						'X-RateLimit-Reset': result.resetTime.toString(),
						'Retry-After': resetTimeSeconds.toString(),
					},
				}
			);
		}

		// Add rate limit headers to successful requests
		return null; // Continue with request
	};
}

/**
 * Rate limit middleware for tax calculation endpoints
 */
export const taxCalculationRateLimit = createRateLimitMiddleware({
	requests: RATE_LIMIT.TAX_CALCULATION.REQUESTS,
	windowMs: RATE_LIMIT.TAX_CALCULATION.WINDOW_MS,
	keyPrefix: 'tax:calculation',
});

/**
 * Rate limit middleware for tax payment endpoints
 */
export const taxPaymentRateLimit = createRateLimitMiddleware({
	requests: RATE_LIMIT.TAX_PAYMENT.REQUESTS,
	windowMs: RATE_LIMIT.TAX_PAYMENT.WINDOW_MS,
	keyPrefix: 'tax:payment',
});

