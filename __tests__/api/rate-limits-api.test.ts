/**
 * Rate Limits API Tests
 * Tests for rate limiting monitoring API endpoint
 */

/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '@/app/api/monitoring/rate-limits/route';
import { auth } from '@clerk/nextjs/server';
import { NextRequest } from 'next/server';

// Mock dependencies
vi.mock('@clerk/nextjs/server');
vi.mock('@/lib/db/neon-connection', () => ({
	query: vi.fn(),
}));

// Mock RateLimitingService as a class with instance methods
const mockGetApiEvents = vi.fn();
const mockGetRateLimitViolations = vi.fn();
const mockGetSummary = vi.fn();
const mockGetActiveRateLimits = vi.fn();

vi.mock('@/lib/services/integration/rate-limiting.service', () => {
	return {
		RateLimitingService: class {
			getApiEvents = mockGetApiEvents;
			getRateLimitViolations = mockGetRateLimitViolations;
			getSummary = mockGetSummary;
			getActiveRateLimits = mockGetActiveRateLimits;
		},
	};
});

describe('Rate Limits API', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		// Reset mock implementations
		mockGetApiEvents.mockClear();
		mockGetRateLimitViolations.mockClear();
		mockGetSummary.mockClear();
		mockGetActiveRateLimits.mockClear();
	});

	it('should return rate limiting data for authenticated user', async () => {
		const mockClerkId = 'clerk_user_123';
		const mockEvents = [
			{ id: '1', endpoint: '/api/test', method: 'GET', status: 200, responseTime: 100 },
			{ id: '2', endpoint: '/api/test', method: 'POST', status: 201, responseTime: 150 },
		];
		const mockViolations: any[] = [];
		const mockSummary = {
			totalRequests: 2,
			throttledRequests: 0,
			blockedRequests: 0,
			allowedRequests: 2,
			avgResponseTime: 125,
			uniqueIps: 1,
			timeWindow: '24h',
		};
		const mockActiveRateLimits = [
			{
				id: '1',
				targetType: 'user',
				requestsPerHour: 1000,
				requestsPerMinute: 100,
				enabled: true,
			},
		];

		vi.mocked(auth).mockResolvedValue({
			userId: mockClerkId,
		} as any);

		mockGetApiEvents.mockResolvedValue(mockEvents);
		mockGetRateLimitViolations.mockResolvedValue(mockViolations);
		mockGetSummary.mockResolvedValue(mockSummary);
		mockGetActiveRateLimits.mockResolvedValue(mockActiveRateLimits);

		const request = new NextRequest('http://localhost:3000/api/monitoring/rate-limits?hours=24');
		const response = await GET(request);
		const data = await response.json();

		expect(response.status).toBe(200);
		expect(data.success).toBe(true);
		expect(data.data).toMatchObject({
			requests: 2,
			limit: 1000,
			remaining: expect.any(Number),
			resetTime: expect.any(Number),
			errors: [],
			summary: {
				totalRequests: 2,
				throttledRequests: 0,
				avgResponseTime: 125,
				uniqueIps: 1,
			},
		});
		expect(mockGetApiEvents).toHaveBeenCalledWith({
			hours: 24,
			clerkUserId: mockClerkId,
			limit: 1000,
		});
	});

	it('should return 401 if user is not authenticated', async () => {
		vi.mocked(auth).mockResolvedValue({
			userId: null,
		} as any);

		const request = new NextRequest('http://localhost:3000/api/monitoring/rate-limits');
		const response = await GET(request);

		expect(response.status).toBe(401);
	});

	it('should handle rate limit violations correctly', async () => {
		const mockClerkId = 'clerk_user_123';
		const mockEvents = Array(1000).fill(null).map((_, i) => ({
			id: String(i),
			endpoint: '/api/test',
			method: 'GET',
			status: 200,
			responseTime: 100,
		}));
		const mockViolations = [
			{
				id: '1',
				rateLimitId: '1',
				targetType: 'user',
				targetValue: mockClerkId,
				violationType: 'throttled',
				requestCount: 1001,
				limitValue: 1000,
			},
		];
		const mockSummary = {
			totalRequests: 1001,
			throttledRequests: 1,
			blockedRequests: 0,
			allowedRequests: 1000,
			avgResponseTime: 100,
			uniqueIps: 1,
			timeWindow: '24h',
		};
		const mockActiveRateLimits = [
			{
				id: '1',
				targetType: 'user',
				requestsPerHour: 1000,
				requestsPerMinute: 100,
				enabled: true,
			},
		];

		vi.mocked(auth).mockResolvedValue({
			userId: mockClerkId,
		} as any);

		mockGetApiEvents.mockResolvedValue(mockEvents);
		mockGetRateLimitViolations.mockResolvedValue(mockViolations);
		mockGetSummary.mockResolvedValue(mockSummary);
		mockGetActiveRateLimits.mockResolvedValue(mockActiveRateLimits);

		const request = new NextRequest('http://localhost:3000/api/monitoring/rate-limits?hours=24');
		const response = await GET(request);
		const data = await response.json();

		expect(response.status).toBe(200);
		expect(data.data.errors).toHaveLength(1);
		expect(data.data.errors[0]).toMatchObject({
			message: expect.stringContaining('throttled'),
			retryAfter: 3600,
			limit: 1000,
		});
		expect(data.data.summary.throttledRequests).toBe(1);
	});

	it('should use default hours value if not provided', async () => {
		const mockClerkId = 'clerk_user_123';

		vi.mocked(auth).mockResolvedValue({
			userId: mockClerkId,
		} as any);

		mockGetApiEvents.mockResolvedValue([]);
		mockGetRateLimitViolations.mockResolvedValue([]);
		mockGetSummary.mockResolvedValue({
			totalRequests: 0,
			throttledRequests: 0,
			blockedRequests: 0,
			allowedRequests: 0,
			avgResponseTime: 0,
			uniqueIps: 0,
			timeWindow: '24 hours',
		});
		mockGetActiveRateLimits.mockResolvedValue([]);

		const request = new NextRequest('http://localhost:3000/api/monitoring/rate-limits');
		const response = await GET(request);

		expect(response.status).toBe(200);
		expect(mockGetApiEvents).toHaveBeenCalledWith({
			hours: 24,
			clerkUserId: mockClerkId,
			limit: 1000,
		});
	});
});
