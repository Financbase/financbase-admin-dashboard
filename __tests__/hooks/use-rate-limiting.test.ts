/**
 * Rate Limiting Hook Tests
 * Tests for useRateLimitingData hook
 */

/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useRateLimitingData } from '@/hooks/use-rate-limiting';

// Mock fetch
global.fetch = vi.fn();

describe('useRateLimitingData', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('should fetch and return rate limiting data', async () => {
		const mockRateLimitData = {
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

		vi.mocked(fetch).mockResolvedValueOnce({
			ok: true,
			json: async () => mockRateLimitData,
		} as Response);

		const { result } = renderHook(() => useRateLimitingData(24));

		expect(result.current.loading).toBe(true);

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		expect(result.current.data).toEqual(mockRateLimitData.data);
		expect(result.current.error).toBeNull();
		expect(fetch).toHaveBeenCalledWith('/api/monitoring/rate-limits?hours=24');
	});

	it('should use default hours value if not provided', async () => {
		const mockRateLimitData = {
			success: true,
			data: {
				requests: 500,
				limit: 1000,
				remaining: 500,
				resetTime: Date.now() + 3600000,
				errors: [],
				summary: {
					totalRequests: 500,
					throttledRequests: 0,
					avgResponseTime: 100,
					uniqueIps: 30,
				},
			},
		};

		vi.mocked(fetch).mockResolvedValueOnce({
			ok: true,
			json: async () => mockRateLimitData,
		} as Response);

		const { result } = renderHook(() => useRateLimitingData());

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		}, { timeout: 5000 });

		expect(fetch).toHaveBeenCalledWith('/api/monitoring/rate-limits?hours=24');
	});

	it('should handle API errors gracefully', async () => {
		vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'));

		const { result } = renderHook(() => useRateLimitingData(24));

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		}, { timeout: 5000 });

		expect(result.current.error).toBeInstanceOf(Error);
		expect(result.current.data).toEqual({
			requests: 0,
			limit: 1000,
			remaining: 1000,
			resetTime: expect.any(Number),
			errors: [],
			summary: {
				totalRequests: 0,
				throttledRequests: 0,
				avgResponseTime: 0,
				uniqueIps: 0,
			},
		});
	});

	it('should handle non-ok responses', async () => {
		vi.mocked(fetch).mockResolvedValueOnce({
			ok: false,
			status: 500,
		} as Response);

		const { result } = renderHook(() => useRateLimitingData(24));

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		}, { timeout: 5000 });

		expect(result.current.error).toBeInstanceOf(Error);
	});

	it('should handle invalid response format', async () => {
		vi.mocked(fetch).mockResolvedValueOnce({
			ok: true,
			json: async () => ({ success: false }),
		} as Response);

		const { result } = renderHook(() => useRateLimitingData(24));

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		}, { timeout: 5000 });

		expect(result.current.error).toBeInstanceOf(Error);
	});

	it('should refresh data every minute', async () => {
		vi.useFakeTimers();
		
		const mockRateLimitData = {
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

		vi.mocked(fetch).mockResolvedValue({
			ok: true,
			json: async () => mockRateLimitData,
		} as Response);

		const { result, unmount } = renderHook(() => useRateLimitingData(24));

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		}, { timeout: 5000 });

		expect(fetch).toHaveBeenCalledTimes(1);

		// Advance time by 1 minute
		vi.advanceTimersByTime(60000);
		
		// Wait for the interval to trigger
		await waitFor(() => {
			expect(fetch).toHaveBeenCalledTimes(2);
		}, { timeout: 5000 });

		unmount();
		vi.useRealTimers();
	});
});
