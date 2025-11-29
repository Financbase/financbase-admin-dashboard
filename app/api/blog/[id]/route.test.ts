/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, PUT, DELETE } from './route';
import { NextRequest } from 'next/server';
import * as blogService from '@/lib/services/blog/blog-service';
import { checkAdminStatus } from '@/lib/auth/check-admin-status';

// Use vi.hoisted() to define variables before mocks are hoisted
const { mockUserId, mockPostId, mockSlug } = vi.hoisted(() => ({
	mockUserId: 'user-123',
	mockPostId: '123',
	mockSlug: 'test-post-slug',
}));

// Mock dependencies
vi.mock('@/lib/services/blog/blog-service', () => ({
	getPostById: vi.fn(),
	getPostBySlug: vi.fn(),
	updatePost: vi.fn(),
	deletePost: vi.fn(),
	incrementViewCount: vi.fn().mockResolvedValue(undefined),
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
vi.mock('@/lib/validation-schemas', async () => {
	const actual = await vi.importActual<typeof import('@/lib/validation-schemas')>('@/lib/validation-schemas');
	const { z } = await import('zod');
	return {
		...actual,
		updateBlogPostSchema: {
			parse: vi.fn((data: any) => {
				// Check if data has invalid fields (not in the schema)
				// Valid fields: id, title, content, slug, status, publishedAt, etc.
				const validFields = ['id', 'title', 'content', 'slug', 'status', 'publishedAt', 'excerpt', 'tags', 'categoryId', 'featuredImage', 'metaTitle', 'metaDescription'];
				const hasInvalidFields = Object.keys(data).some(key => !validFields.includes(key) && key !== 'invalid');
				
				// If data has 'invalid' key or other invalid fields, fail validation
				if (data.invalid || hasInvalidFields) {
					const error = new z.ZodError([
						{
							code: 'custom',
							path: data.invalid ? ['invalid'] : Object.keys(data).filter(k => !validFields.includes(k)),
							message: 'Validation failed',
						},
					]);
					throw error;
				}
				
				if (!data.id) {
					const error = new z.ZodError([
						{
							code: 'custom',
							path: ['id'],
							message: 'Validation failed',
						},
					]);
					throw error;
				}
				return data;
			}),
		},
	};
});

describe('Blog [id] API', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(checkAdminStatus).mockResolvedValue(true);
	});

	describe('GET /api/blog/[id]', () => {
		it('should return post by numeric ID for admin', async () => {
			const mockPost = {
				id: parseInt(mockPostId),
				title: 'Test Post',
				slug: mockSlug,
				status: 'draft',
				userId: mockUserId,
			};

			vi.mocked(blogService.getPostById).mockResolvedValue(mockPost);

			const request = new NextRequest(
				`http://localhost/api/blog/${mockPostId}`
			);
			const response = await GET(request, {
				params: Promise.resolve({ id: mockPostId }),
			});
			const data = await response.json();

			expect(response.status).toBe(200);
			expect(data.success).toBe(true);
			expect(data.data).toEqual(mockPost);
		});

		it('should return 403 for non-admin accessing by ID', async () => {
			vi.mocked(checkAdminStatus).mockResolvedValue(false);

			const request = new NextRequest(
				`http://localhost/api/blog/${mockPostId}`
			);
			const response = await GET(request, {
				params: Promise.resolve({ id: mockPostId }),
			});

			expect(response.status).toBe(403);
		});

		it('should return post by slug for public published posts', async () => {
			vi.mocked(checkAdminStatus).mockResolvedValue(false);
			const mockPost = {
				id: 1,
				title: 'Test Post',
				slug: mockSlug,
				status: 'published',
				userId: 'other-user',
			};

			vi.mocked(blogService.getPostBySlug).mockResolvedValue(mockPost);

			const request = new NextRequest(
				`http://localhost/api/blog/${mockSlug}`
			);
			const response = await GET(request, {
				params: Promise.resolve({ id: mockSlug }),
			});
			const data = await response.json();

			expect(response.status).toBe(200);
			expect(data.success).toBe(true);
			// The route returns the post, which should match our mock
			expect(data.data).toMatchObject({
				id: mockPost.id,
				title: mockPost.title,
				slug: mockPost.slug,
				status: mockPost.status,
			});
		});

		it('should return 404 for non-published post for non-admin', async () => {
			vi.mocked(checkAdminStatus).mockResolvedValue(false);
			const mockPost = {
				id: 1,
				title: 'Test Post',
				slug: mockSlug,
				status: 'draft',
				userId: 'other-user',
			};

			vi.mocked(blogService.getPostBySlug).mockResolvedValue(mockPost);

			const request = new NextRequest(
				`http://localhost/api/blog/${mockSlug}`
			);
			const response = await GET(request, {
				params: Promise.resolve({ id: mockSlug }),
			});

			expect(response.status).toBe(404);
		});

		it('should return 404 when post not found', async () => {
			vi.mocked(blogService.getPostById).mockResolvedValue(null);

			const request = new NextRequest(
				`http://localhost/api/blog/${mockPostId}`
			);
			const response = await GET(request, {
				params: Promise.resolve({ id: mockPostId }),
			});

			expect(response.status).toBe(404);
		});

		it('should handle service errors', async () => {
			vi.mocked(blogService.getPostById).mockRejectedValue(new Error('Service error'));

			const request = new NextRequest(
				`http://localhost/api/blog/${mockPostId}`
			);
			const response = await GET(request, {
				params: Promise.resolve({ id: mockPostId }),
			});

			expect(response.status).toBe(500);
		});
	});

	describe('PUT /api/blog/[id]', () => {
		it('should update post successfully for admin', async () => {
			const mockUpdatedPost = {
				id: parseInt(mockPostId),
				title: 'Updated Post',
				slug: mockSlug,
				status: 'published',
			};

			vi.mocked(blogService.updatePost).mockResolvedValue(mockUpdatedPost);

			const request = new NextRequest(
				`http://localhost/api/blog/${mockPostId}`,
				{
					method: 'PUT',
					body: JSON.stringify({
						title: 'Updated Post',
					}),
				}
			);

			const response = await PUT(request, {
				params: Promise.resolve({ id: mockPostId }),
			});
			const data = await response.json();

			expect(response.status).toBe(200);
			expect(data.success).toBe(true);
			expect(data.data).toEqual(mockUpdatedPost);
		});

		it('should return 403 for non-admin users', async () => {
			vi.mocked(checkAdminStatus).mockResolvedValue(false);

			const request = new NextRequest(
				`http://localhost/api/blog/${mockPostId}`,
				{
					method: 'PUT',
					body: JSON.stringify({
						title: 'Updated Post',
					}),
				}
			);

			const response = await PUT(request, {
				params: Promise.resolve({ id: mockPostId }),
			});

			expect(response.status).toBe(403);
		});

		it('should return 400 for invalid ID', async () => {
			const request = new NextRequest('http://localhost/api/blog/invalid', {
				method: 'PUT',
				body: JSON.stringify({
					title: 'Updated Post',
				}),
			});

			const response = await PUT(request, {
				params: Promise.resolve({ id: 'invalid' }),
			});

			expect(response.status).toBe(400);
		});

		it('should return 400 for invalid input', async () => {
			const request = new NextRequest(
				`http://localhost/api/blog/${mockPostId}`,
				{
					method: 'PUT',
					body: JSON.stringify({ invalid: 'data' }),
				}
			);

			const response = await PUT(request, {
				params: Promise.resolve({ id: mockPostId }),
			});

			expect(response.status).toBe(400);
		});

		it('should return 400 for invalid JSON', async () => {
			const request = new NextRequest(
				`http://localhost/api/blog/${mockPostId}`,
				{
					method: 'PUT',
					body: 'invalid json',
				}
			);

			const response = await PUT(request, {
				params: Promise.resolve({ id: mockPostId }),
			});

			expect(response.status).toBe(400);
		});
	});

	describe('DELETE /api/blog/[id]', () => {
		it('should delete post successfully for admin', async () => {
			vi.mocked(blogService.deletePost).mockResolvedValue(undefined);

			const request = new NextRequest(
				`http://localhost/api/blog/${mockPostId}`,
				{
					method: 'DELETE',
				}
			);

			const response = await DELETE(request, {
				params: Promise.resolve({ id: mockPostId }),
			});
			const data = await response.json();

			expect(response.status).toBe(200);
			expect(data.success).toBe(true);
			expect(data.data).toHaveProperty('message');
		});

		it('should hard delete when hardDelete=true', async () => {
			vi.mocked(blogService.deletePost).mockResolvedValue(undefined);

			const request = new NextRequest(
				`http://localhost/api/blog/${mockPostId}?hardDelete=true`,
				{
					method: 'DELETE',
				}
			);

			const response = await DELETE(request, {
				params: Promise.resolve({ id: mockPostId }),
			});
			const data = await response.json();

			expect(response.status).toBe(200);
			expect(data.data.message).toContain('permanently');
			expect(blogService.deletePost).toHaveBeenCalledWith(parseInt(mockPostId), true);
		});

		it('should return 403 for non-admin users', async () => {
			vi.mocked(checkAdminStatus).mockResolvedValue(false);

			const request = new NextRequest(
				`http://localhost/api/blog/${mockPostId}`,
				{
					method: 'DELETE',
				}
			);

			const response = await DELETE(request, {
				params: Promise.resolve({ id: mockPostId }),
			});

			expect(response.status).toBe(403);
		});

		it('should return 400 for invalid ID', async () => {
			const request = new NextRequest('http://localhost/api/blog/invalid', {
				method: 'DELETE',
			});

			const response = await DELETE(request, {
				params: Promise.resolve({ id: 'invalid' }),
			});

			expect(response.status).toBe(400);
		});

		it('should handle service errors', async () => {
			vi.mocked(blogService.deletePost).mockRejectedValue(new Error('Service error'));

			const request = new NextRequest(
				`http://localhost/api/blog/${mockPostId}`,
				{
					method: 'DELETE',
				}
			);

			const response = await DELETE(request, {
				params: Promise.resolve({ id: mockPostId }),
			});

			expect(response.status).toBe(500);
		});
	});
});
