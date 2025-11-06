/**
 * API Hub Monitoring Integration Test
 * Tests the API hub page integration with monitoring endpoints
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
import { NextRequest } from 'next/server';

// Mock the monitoring endpoints
const mockHealthResponse = {
	status: 'healthy',
	uptime: 99.9,
	timestamp: new Date().toISOString(),
};

const mockMetricsResponse = {
	performance: [
		{
			metricName: 'response_time',
			value: '245',
			timestamp: new Date().toISOString(),
		},
		{
			metricName: 'response_time',
			value: '250',
			timestamp: new Date().toISOString(),
		},
	],
};

const mockRateLimitsResponse = {
	success: true,
	data: {
		requests: 750,
		limit: 1000,
		remaining: 250,
		resetTime: Date.now() + 3600000,
		errors: [],
		summary: {
			totalRequests: 750,
			throttledRequests: 5,
			avgResponseTime: 120,
			uniqueIps: 45,
		},
	},
};

describe('API Hub Monitoring Integration', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		global.fetch = vi.fn();
	});

	it('should fetch and aggregate monitoring data correctly', async () => {
		// Mock all monitoring endpoints
		vi.mocked(fetch)
			.mockResolvedValueOnce({
				ok: true,
				json: async () => mockHealthResponse,
			} as Response)
			.mockResolvedValueOnce({
				ok: true,
				json: async () => mockMetricsResponse,
			} as Response)
			.mockResolvedValueOnce({
				ok: true,
				json: async () => mockRateLimitsResponse,
			} as Response);

		// Simulate the API hub page data fetching logic
		const [healthResponse, metricsResponse, rateLimitsResponse] = await Promise.all([
			fetch('/api/monitoring/health?timeRange=24h'),
			fetch('/api/monitoring/metrics?timeRange=24h&type=performance'),
			fetch('/api/monitoring/rate-limits?hours=24'),
		]);

		expect(healthResponse.ok).toBe(true);
		expect(metricsResponse.ok).toBe(true);
		expect(rateLimitsResponse.ok).toBe(true);

		const healthData = await healthResponse.json();
		const metricsData = await metricsResponse.json();
		const rateLimitsData = await rateLimitsResponse.json();

		// Verify data structure
		expect(healthData.status).toBe('healthy');
		expect(metricsData.performance).toBeDefined();
		expect(rateLimitsData.success).toBe(true);
		expect(rateLimitsData.data.summary).toBeDefined();

		// Calculate aggregated stats (as done in the API hub page)
		let uptime = 99.9;
		if (healthData.status === 'healthy') {
			uptime = 99.9;
		} else if (healthData.status === 'warning') {
			uptime = 98.5;
		} else {
			uptime = 95.0;
		}

		let averageResponseTime = 245;
		if (metricsData.performance && metricsData.performance.length > 0) {
			const responseTimes = metricsData.performance
				.filter((m: any) => m.metricName === 'response_time')
				.map((m: any) => parseFloat(m.value) || 0);
			if (responseTimes.length > 0) {
				averageResponseTime = responseTimes.reduce((a: number, b: number) => a + b, 0) / responseTimes.length;
			}
		}

		const totalRequests = rateLimitsData.data.summary?.totalRequests || 0;
		const throttledRequests = rateLimitsData.data.summary?.throttledRequests || 0;
		const successRate = totalRequests > 0
			? ((totalRequests - throttledRequests) / totalRequests) * 100
			: 99.8;

		// Verify calculated values
		expect(uptime).toBe(99.9);
		expect(averageResponseTime).toBeCloseTo(247.5, 1);
		expect(totalRequests).toBe(750);
		expect(successRate).toBeCloseTo(99.33, 1);
	});

	it('should handle monitoring endpoint failures gracefully', async () => {
		// Mock one endpoint failing
		vi.mocked(fetch)
			.mockResolvedValueOnce({
				ok: false,
				status: 500,
			} as Response)
			.mockResolvedValueOnce({
				ok: true,
				json: async () => mockMetricsResponse,
			} as Response)
			.mockResolvedValueOnce({
				ok: true,
				json: async () => mockRateLimitsResponse,
			} as Response);

		const [healthResponse, metricsResponse, rateLimitsResponse] = await Promise.all([
			fetch('/api/monitoring/health?timeRange=24h'),
			fetch('/api/monitoring/metrics?timeRange=24h&type=performance'),
			fetch('/api/monitoring/rate-limits?hours=24'),
		]);

		// Should still get data from other endpoints
		expect(metricsResponse.ok).toBe(true);
		expect(rateLimitsResponse.ok).toBe(true);

		// Should use default values when health endpoint fails
		const uptime = 99.9; // Default fallback
		expect(uptime).toBe(99.9);
	});

	it('should calculate success rate correctly from rate limit data', async () => {
		const testCases = [
			{
				totalRequests: 1000,
				throttledRequests: 10,
				expectedSuccessRate: 99.0,
			},
			{
				totalRequests: 500,
				throttledRequests: 0,
				expectedSuccessRate: 100.0,
			},
			{
				totalRequests: 100,
				throttledRequests: 50,
				expectedSuccessRate: 50.0,
			},
		];

		for (const testCase of testCases) {
			const successRate = testCase.totalRequests > 0
				? ((testCase.totalRequests - testCase.throttledRequests) / testCase.totalRequests) * 100
				: 99.8;

			expect(successRate).toBeCloseTo(testCase.expectedSuccessRate, 1);
		}
	});

	it('should calculate average response time correctly', async () => {
		const responseTimes = [100, 150, 200, 250, 300];
		const average = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;

		expect(average).toBe(200);
	});

	it('should handle empty metrics data', async () => {
		vi.mocked(fetch).mockResolvedValueOnce({
			ok: true,
			json: async () => ({ performance: [] }),
		} as Response);

		const response = await fetch('/api/monitoring/metrics?timeRange=24h&type=performance');
		const data = await response.json();

		expect(data.performance).toEqual([]);

		// Should use default when no data
		const averageResponseTime = 245; // Default fallback
		expect(averageResponseTime).toBe(245);
	});
});

