/**
 * Rate Limiting Data API Route
 * Returns rate limiting statistics and data
 */

/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { ApiErrorHandler, generateRequestId } from '@/lib/api-error-handler';
import { RateLimitingService } from '@/lib/services/integration/rate-limiting.service';

export async function GET(request: NextRequest) {
	const requestId = generateRequestId();
	try {
		const { userId: clerkId } = await auth();
		if (!clerkId) {
			return ApiErrorHandler.unauthorized();
		}

		const { searchParams } = new URL(request.url);
		const hours = parseInt(searchParams.get('hours') || '24');

		const rateLimitingService = new RateLimitingService();

		// Get API events for the time period
		const events = await rateLimitingService.getApiEvents({
			hours,
			clerkUserId: clerkId,
			limit: 1000,
		});

		// Get rate limit violations
		const violations = await rateLimitingService.getRateLimitViolations({
			hours,
		});

		// Get summary
		const summary = await rateLimitingService.getSummary(hours);

		// Calculate current rate limit status
		const now = Date.now();
		const oneHourFromNow = now + 3600000;
		
		// Get active rate limits
		const activeRateLimits = await rateLimitingService.getActiveRateLimits();
		const defaultLimit = activeRateLimits.find(rl => rl.targetType === 'user')?.requestsPerHour || 1000;
		
		const totalRequests = events.length;
		const throttledRequests = violations.filter(v => v.violationType === 'throttled').length;
		const remaining = Math.max(0, defaultLimit - totalRequests);

		return NextResponse.json({
			success: true,
			data: {
				requests: totalRequests,
				limit: defaultLimit,
				remaining,
				resetTime: oneHourFromNow,
				errors: violations.map(v => ({
					message: `Rate limit ${v.violationType} for ${v.targetType}: ${v.targetValue}`,
					retryAfter: 3600,
					limit: v.limitValue,
					remaining: Math.max(0, v.limitValue - v.requestCount),
				})),
				summary: {
					totalRequests: summary.totalRequests,
					throttledRequests: summary.throttledRequests,
					avgResponseTime: summary.avgResponseTime,
					uniqueIps: summary.uniqueIps,
				},
			},
		});
	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}

