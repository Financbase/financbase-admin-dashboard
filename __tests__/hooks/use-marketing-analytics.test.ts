/**
 * Marketing Analytics Hook Tests
 * Tests for useMarketingAnalytics and useMarketingFeedback hooks
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
import { useMarketingAnalytics, useMarketingFeedback } from '@/lib/hooks/use-marketing-analytics';

// Mock fetch
global.fetch = vi.fn();

describe('useMarketingAnalytics', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('should fetch and return marketing analytics data', async () => {
		const mockAnalyticsData = {
			analytics: {
				overview: {
					totalImpressions: 5000,
					totalClicks: 500,
					totalConversions: 50,
					totalRevenue: 25000,
				},
				performanceMetrics: {
					impressions: { current: 5000, previous: 4000, change: 25 },
					clicks: { current: 500, previous: 400, change: 25 },
					conversions: { current: 50, previous: 40, change: 25 },
					revenue: { current: 25000, previous: 20000, change: 25 },
				},
			},
		};

		vi.mocked(fetch).mockResolvedValueOnce({
			ok: true,
			json: async () => mockAnalyticsData,
		} as Response);

		const { result } = renderHook(() => useMarketingAnalytics());

		expect(result.current.loading).toBe(true);

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		expect(result.current.data).toEqual({
			impressions: 5000,
			clicks: 500,
			conversions: 50,
			revenue: 25000,
		});
		expect(fetch).toHaveBeenCalledWith('/api/marketing/analytics');
	});

	it('should handle API errors gracefully', async () => {
		vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'));

		const { result } = renderHook(() => useMarketingAnalytics());

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		expect(result.current.data).toEqual({
			impressions: 0,
			clicks: 0,
			conversions: 0,
			revenue: 0,
		});
	});

	it('should handle non-ok responses', async () => {
		vi.mocked(fetch).mockResolvedValueOnce({
			ok: false,
			status: 500,
		} as Response);

		const { result } = renderHook(() => useMarketingAnalytics());

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		expect(result.current.data).toEqual({
			impressions: 0,
			clicks: 0,
			conversions: 0,
			revenue: 0,
		});
	});

	it('should track component interactions', async () => {
		vi.mocked(fetch).mockResolvedValueOnce({
			ok: true,
			json: async () => ({ analytics: { overview: {}, performanceMetrics: {} } }),
		} as Response);

		const { result } = renderHook(() => useMarketingAnalytics());

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		await result.current.trackComponentInteraction(
			'Button',
			'UI',
			'click',
			{ buttonId: 'submit' }
		);

		expect(fetch).toHaveBeenCalledWith('/api/marketing/analytics/track', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				componentName: 'Button',
				category: 'UI',
				action: 'click',
				metadata: { buttonId: 'submit' },
			}),
		});
	});
});

describe('useMarketingFeedback', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('should fetch feedback list', async () => {
		const mockFeedback = [
			{ id: '1', message: 'Great product!', rating: 5 },
			{ id: '2', message: 'Could be better', rating: 3 },
		];

		vi.mocked(fetch).mockResolvedValueOnce({
			ok: true,
			json: async () => ({ data: mockFeedback }),
		} as Response);

		const { result } = renderHook(() => useMarketingFeedback());

		expect(result.current.loading).toBe(true);

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		expect(result.current.feedback).toEqual(mockFeedback);
		expect(fetch).toHaveBeenCalledWith('/api/marketing/feedback');
	});

	it('should submit feedback', async () => {
		const newFeedback = { message: 'Test feedback', rating: 4 };
		const mockResponse = { data: { id: '3', ...newFeedback } };

		vi.mocked(fetch)
			.mockResolvedValueOnce({
				ok: true,
				json: async () => ({ data: [] }),
			} as Response)
			.mockResolvedValueOnce({
				ok: true,
				json: async () => mockResponse,
			} as Response);

		const { result } = renderHook(() => useMarketingFeedback());

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		await result.current.submitFeedback(newFeedback);

		expect(fetch).toHaveBeenCalledWith('/api/marketing/feedback', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(newFeedback),
		});
	});

	it('should handle feedback submission errors', async () => {
		vi.mocked(fetch)
			.mockResolvedValueOnce({
				ok: true,
				json: async () => ({ data: [] }),
			} as Response)
			.mockResolvedValueOnce({
				ok: false,
				status: 500,
			} as Response);

		const { result } = renderHook(() => useMarketingFeedback());

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		await expect(
			result.current.submitFeedback({ message: 'Test', rating: 5 })
		).rejects.toThrow();
	});
});
