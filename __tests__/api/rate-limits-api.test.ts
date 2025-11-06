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
vi.mock('@/lib/services/integration/rate-limiting.service', () => {
	const mockServiceInstance = {
		getApiEvents: vi.fn(),
		getRateLimitViolations: vi.fn(),
		getSummary: vi.fn(),
		getActiveRateLimits: vi.fn(),
	};
	return {
		RateLimitingService: vi.fn().mockImplementation(() => mockServiceInstance),
	};
});

describe('Rate Limits API', () => {
	beforeEach(() => {
		vi.clearAllMocks();
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

		vi.mocked(mockServiceInstance.getApiEvents).mockResolvedValue(mockEvents);
		vi.mocked(mockServiceInstance.getRateLimitViolations).mockResolvedValue(mockViolations);
		vi.mocked(mockServiceInstance.getSummary).mockResolvedValue(mockSummary);
		vi.mocked(mockServiceInstance.getActiveRateLimits).mockResolvedValue(mockActiveRateLimits);

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
		expect(mockServiceInstance.getApiEvents).toHaveBeenCalledWith({
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

		vi.mocked(mockServiceInstance.getApiEvents).mockResolvedValue(mockEvents);
		vi.mocked(mockServiceInstance.getRateLimitViolations).mockResolvedValue(mockViolations);
		vi.mocked(mockServiceInstance.getSummary).mockResolvedValue(mockSummary);
		vi.mocked(mockServiceInstance.getActiveRateLimits).mockResolvedValue(mockActiveRateLimits);

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

		const { RateLimitingService } = await import('@/lib/services/integration/rate-limiting.service');
		const serviceInstance = new RateLimitingService();
		vi.mocked(serviceInstance.getApiEvents).mockResolvedValue([]);
		vi.mocked(serviceInstance.getRateLimitViolations).mockResolvedValue([]);
		vi.mocked(serviceInstance.getSummary).mockResolvedValue({
			totalRequests: 0,
			throttledRequests: 0,
			avgResponseTime: 0,
			uniqueIps: 0,
		});
		vi.mocked(serviceInstance.getActiveRateLimits).mockResolvedValue([]);

		const request = new NextRequest('http://localhost:3000/api/monitoring/rate-limits');
		const response = await GET(request);

		expect(response.status).toBe(200);
		expect(mockServiceInstance.getApiEvents).toHaveBeenCalledWith({
			hours: 24,
			clerkUserId: mockClerkId,
			limit: 1000,
		});
	});
});
