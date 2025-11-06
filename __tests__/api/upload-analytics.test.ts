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
import { GET } from '@/app/api/analytics/upload/route';

// Mock Clerk auth
vi.mock('@clerk/nextjs/server', () => ({
	auth: vi.fn(),
}));

// Mock Neon database
let queryCallCount = 0;
const mockSql = vi.fn((query: any) => {
	const queryString = Array.isArray(query) ? query.join(' ') : String(query);
	
	// Reset counter for new test
	if (queryString.includes('expense_attachments') && queryString.includes('COUNT')) {
		queryCallCount = 0;
		return Promise.resolve([
			{
				total_count: '10',
				total_size: '10485760', // 10MB
				avg_size: '1048576', // 1MB
				image_count: '8',
				video_count: '2',
				ai_analysis_count: '5',
			},
		]);
	}
	if (queryString.includes('collaboration_files') && queryString.includes('COUNT')) {
		return Promise.resolve([
			{
				total_count: '5',
				total_size: '5242880', // 5MB
				avg_size: '1048576', // 1MB
				image_count: '4',
				video_count: '1',
				ai_analysis_count: '3',
			},
		]);
	}
	if (queryString.includes('document_processing') && queryString.includes('COUNT')) {
		return Promise.resolve([
			{
				total_count: '3',
				total_size: '3145728', // 3MB
				avg_size: '1048576', // 1MB
				image_count: '3',
				video_count: '0',
				ai_analysis_count: '2',
				avg_processing_time: '2500', // 2.5 seconds in milliseconds
			},
		]);
	}
	if (queryString.includes('category') || queryString.includes('GROUP BY')) {
		return Promise.resolve([
			{ category: 'Travel', count: '5' },
			{ category: 'Office Supplies', count: '3' },
			{ category: 'Software', count: '2' },
		]);
	}
	if (queryString.includes('UNION ALL') || queryString.includes('expense') && queryString.includes('collaboration')) {
		// Recent activity query
		return Promise.resolve([
			{
				source: 'expense',
				timestamp: new Date('2024-01-15T10:00:00Z'),
				type: 'image/jpeg',
				size: '1048576',
				success: true,
			},
			{
				source: 'collaboration',
				timestamp: new Date('2024-01-15T09:00:00Z'),
				type: 'video/mp4',
				size: '5242880',
				success: true,
			},
			{
				source: 'document',
				timestamp: new Date('2024-01-15T08:00:00Z'),
				type: 'image/png',
				size: '2097152',
				success: true,
			},
		]);
	}
	return Promise.resolve([]);
});

vi.mock('@neondatabase/serverless', () => ({
	neon: vi.fn(() => mockSql),
}));

// Mock API error handler
vi.mock('@/lib/api-error-handler', () => ({
	ApiErrorHandler: {
		unauthorized: vi.fn(() => new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })),
		validationError: vi.fn(() => new Response(JSON.stringify({ error: 'Validation error' }), { status: 400 })),
		databaseError: vi.fn(() => new Response(JSON.stringify({ error: 'Database error' }), { status: 500 })),
	},
	generateRequestId: vi.fn(() => 'test-request-id'),
}));

describe('Upload Analytics API', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should return upload analytics for authenticated user', async () => {
		const { auth } = await import('@clerk/nextjs/server');
		vi.mocked(auth).mockResolvedValue({
			userId: 'user_123',
			sessionId: 'sess_123',
		} as any);

		const request = new NextRequest('http://localhost:3000/api/analytics/upload?timeRange=30d');
		const response = await GET(request);
		const data = await response.json();

		expect(response.status).toBe(200);
		expect(data).toHaveProperty('metrics');
		expect(data.metrics).toHaveProperty('totalUploads');
		expect(data.metrics).toHaveProperty('totalImages');
		expect(data.metrics).toHaveProperty('totalVideos');
		expect(data.metrics).toHaveProperty('totalSize');
		expect(data.metrics).toHaveProperty('averageFileSize');
		expect(data.metrics).toHaveProperty('aiAnalysisCount');
		expect(data.metrics).toHaveProperty('popularCategories');
		expect(data.metrics).toHaveProperty('recentActivity');
	});

	it('should return 401 for unauthenticated requests', async () => {
		const { auth } = await import('@clerk/nextjs/server');
		vi.mocked(auth).mockResolvedValue({
			userId: null,
		} as any);

		const request = new NextRequest('http://localhost:3000/api/analytics/upload');
		const response = await GET(request);

		expect(response.status).toBe(401);
	});

	it('should handle different time ranges', async () => {
		const { auth } = await import('@clerk/nextjs/server');
		vi.mocked(auth).mockResolvedValue({
			userId: 'user_123',
			sessionId: 'sess_123',
		} as any);

		const timeRanges = ['7d', '30d', '90d'];
		
		for (const range of timeRanges) {
			const request = new NextRequest(`http://localhost:3000/api/analytics/upload?timeRange=${range}`);
			const response = await GET(request);
			const data = await response.json();

			expect(response.status).toBe(200);
			expect(data.metrics).toBeDefined();
		}
	});

	it('should default to 30d if no timeRange is provided', async () => {
		const { auth } = await import('@clerk/nextjs/server');
		vi.mocked(auth).mockResolvedValue({
			userId: 'user_123',
			sessionId: 'sess_123',
		} as any);

		const request = new NextRequest('http://localhost:3000/api/analytics/upload');
		const response = await GET(request);
		const data = await response.json();

		expect(response.status).toBe(200);
		expect(data.metrics).toBeDefined();
	});

	it('should aggregate data from all sources', async () => {
		const { auth } = await import('@clerk/nextjs/server');
		vi.mocked(auth).mockResolvedValue({
			userId: 'user_123',
			sessionId: 'sess_123',
		} as any);

		const request = new NextRequest('http://localhost:3000/api/analytics/upload?timeRange=30d');
		const response = await GET(request);
		const data = await response.json();

		expect(response.status).toBe(200);
		// Should aggregate: 10 + 5 + 3 = 18 total uploads
		expect(data.metrics.totalUploads).toBe(18);
		// Should aggregate images: 8 + 4 + 3 = 15
		expect(data.metrics.totalImages).toBe(15);
		// Should aggregate videos: 2 + 1 = 3
		expect(data.metrics.totalVideos).toBe(3);
	});

	it('should calculate success rates correctly', async () => {
		const { auth } = await import('@clerk/nextjs/server');
		vi.mocked(auth).mockResolvedValue({
			userId: 'user_123',
			sessionId: 'sess_123',
		} as any);

		const request = new NextRequest('http://localhost:3000/api/analytics/upload?timeRange=30d');
		const response = await GET(request);
		const data = await response.json();

		expect(response.status).toBe(200);
		expect(data.metrics.uploadSuccessRate).toBeGreaterThanOrEqual(0);
		expect(data.metrics.uploadSuccessRate).toBeLessThanOrEqual(100);
		expect(data.metrics.aiAnalysisSuccessRate).toBeGreaterThanOrEqual(0);
		expect(data.metrics.aiAnalysisSuccessRate).toBeLessThanOrEqual(100);
	});

	it('should format recent activity correctly', async () => {
		const { auth } = await import('@clerk/nextjs/server');
		vi.mocked(auth).mockResolvedValue({
			userId: 'user_123',
			sessionId: 'sess_123',
		} as any);

		const request = new NextRequest('http://localhost:3000/api/analytics/upload?timeRange=30d');
		const response = await GET(request);
		const data = await response.json();

		expect(response.status).toBe(200);
		expect(Array.isArray(data.metrics.recentActivity)).toBe(true);
		
		if (data.metrics.recentActivity.length > 0) {
			const activity = data.metrics.recentActivity[0];
			expect(activity).toHaveProperty('timestamp');
			expect(activity).toHaveProperty('type');
			expect(activity).toHaveProperty('size');
			expect(activity).toHaveProperty('success');
			expect(['image', 'video', 'ai_analysis']).toContain(activity.type);
		}
	});

	it('should handle empty results gracefully', async () => {
		const { auth } = await import('@clerk/nextjs/server');
		
		vi.mocked(auth).mockResolvedValue({
			userId: 'user_123',
			sessionId: 'sess_123',
		} as any);

		// Mock empty results for this specific test
		const emptyMockSql = vi.fn(() => Promise.resolve([]));
		const { neon } = await import('@neondatabase/serverless');
		vi.mocked(neon).mockReturnValue(emptyMockSql as any);

		const request = new NextRequest('http://localhost:3000/api/analytics/upload?timeRange=30d');
		const response = await GET(request);
		const data = await response.json();

		expect(response.status).toBe(200);
		expect(data.metrics.totalUploads).toBe(0);
		expect(data.metrics.totalImages).toBe(0);
		expect(data.metrics.totalVideos).toBe(0);
		expect(Array.isArray(data.metrics.popularCategories)).toBe(true);
		expect(Array.isArray(data.metrics.recentActivity)).toBe(true);
		
		// Restore original mock
		vi.mocked(neon).mockReturnValue(mockSql as any);
	});
});

