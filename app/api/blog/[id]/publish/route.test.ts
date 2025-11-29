/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';
import { NextRequest } from 'next/server';
import * as blogService from '@/lib/services/blog/blog-service';
import { checkAdminStatus } from '@/lib/auth/check-admin-status';

const mockUserId = 'user-123';
const mockPostId = '123';

// Mock dependencies
vi.mock('@/lib/services/blog/blog-service', () => ({
	publishPost: vi.fn(),
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

describe('Blog Publish API', () => {
	const mockParams = Promise.resolve({ id: mockPostId });

	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(checkAdminStatus).mockResolvedValue(true);
	});

	describe('POST /api/blog/[id]/publish', () => {
		it('should publish post successfully for admin', async () => {
			const mockPublishedPost = {
				id: parseInt(mockPostId),
				title: 'Test Post',
				slug: 'test-post',
				status: 'published',
				publishedAt: new Date(),
			};

			vi.mocked(blogService.publishPost).mockResolvedValue(mockPublishedPost);

			const request = new NextRequest(
				`http://localhost/api/blog/${mockPostId}/publish`,
				{
					method: 'POST',
				}
			);

			const response = await POST(request, { params: mockParams });
			const data = await response.json();

			expect(response.status).toBe(200);
			expect(data.success).toBe(true);
			expect(data.data).toEqual(mockPublishedPost);
			expect(blogService.publishPost).toHaveBeenCalledWith(parseInt(mockPostId));
		});

		it('should return 403 for non-admin users', async () => {
			vi.mocked(checkAdminStatus).mockResolvedValue(false);

			const request = new NextRequest(
				`http://localhost/api/blog/${mockPostId}/publish`,
				{
					method: 'POST',
				}
			);

			const response = await POST(request, { params: mockParams });

			expect(response.status).toBe(403);
		});

		it('should return 400 for invalid ID', async () => {
			const request = new NextRequest(
				'http://localhost/api/blog/invalid/publish',
				{
					method: 'POST',
				}
			);

			const response = await POST(request, {
				params: Promise.resolve({ id: 'invalid' }),
			});

			expect(response.status).toBe(400);
		});

		it('should handle service errors', async () => {
			vi.mocked(blogService.publishPost).mockRejectedValue(new Error('Service error'));

			const request = new NextRequest(
				`http://localhost/api/blog/${mockPostId}/publish`,
				{
					method: 'POST',
				}
			);

			const response = await POST(request, { params: mockParams });

			expect(response.status).toBe(500);
		});
	});
});
