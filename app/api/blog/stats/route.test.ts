/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';
import { NextRequest } from 'next/server';
import * as blogService from '@/lib/services/blog/blog-service';
import { checkAdminStatus } from '@/lib/auth/check-admin-status';

const mockUserId = 'user-123';

// Mock dependencies
vi.mock('@/lib/services/blog/blog-service', () => ({
	getBlogStats: vi.fn(),
}));
vi.mock('@/lib/auth/check-admin-status', () => ({
	checkAdminStatus: vi.fn(),
}));
vi.mock('@/lib/api/with-rls', () => ({
	withRLS: async (fn: any) => {
		return await fn(mockUserId);
	},
}));
vi.mock('@clerk/nextjs/server', () => ({
	auth: vi.fn().mockResolvedValue({ userId: mockUserId }),
	currentUser: vi.fn().mockResolvedValue({
		id: mockUserId,
		emailAddresses: [{ emailAddress: 'test@example.com' }],
	}),
}));

describe('Blog Stats API', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(checkAdminStatus).mockResolvedValue(true);
	});

	describe('GET /api/blog/stats', () => {
		it('should return blog statistics for admin', async () => {
			const mockStats = {
				totalPosts: 10,
				publishedPosts: 8,
				draftPosts: 2,
				totalViews: 1000,
				totalCategories: 5,
			};

			vi.mocked(blogService.getBlogStats).mockResolvedValue(mockStats);

			const request = new NextRequest('http://localhost/api/blog/stats');
			const response = await GET(request);
			const data = await response.json();

			expect(response.status).toBe(200);
			expect(data.success).toBe(true);
			expect(data.data).toEqual(mockStats);
		});

		it('should return 403 for non-admin users', async () => {
			vi.mocked(checkAdminStatus).mockResolvedValue(false);

			const request = new NextRequest('http://localhost/api/blog/stats');
			const response = await GET(request);

			expect(response.status).toBe(403);
		});

		it('should handle service errors', async () => {
			vi.mocked(blogService.getBlogStats).mockRejectedValue(new Error('Service error'));

			const request = new NextRequest('http://localhost/api/blog/stats');
			const response = await GET(request);

			expect(response.status).toBe(500);
		});
	});
});
