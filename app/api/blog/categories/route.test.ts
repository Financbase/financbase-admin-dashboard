/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, POST } from './route';
import { NextRequest } from 'next/server';
import * as blogService from '@/lib/services/blog/blog-service';
import { checkAdminStatus } from '@/lib/auth/check-admin-status';

const mockUserId = 'user-123';

// Mock dependencies
vi.mock('@/lib/services/blog/blog-service', () => ({
	getCategories: vi.fn(),
	createCategory: vi.fn(),
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
		createBlogCategorySchema: {
			parse: vi.fn((data: any) => {
				if (!data.name) {
					const error = new z.ZodError([
						{
							code: 'custom',
							path: ['name'],
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

describe('Blog Categories API', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(checkAdminStatus).mockResolvedValue(true);
	});

	describe('GET /api/blog/categories', () => {
		it('should return all categories', async () => {
			const mockCategories = [
				{ id: 1, name: 'Technology', slug: 'technology' },
				{ id: 2, name: 'Business', slug: 'business' },
			];

			vi.mocked(blogService.getCategories).mockResolvedValue(mockCategories);

			const request = new NextRequest('http://localhost/api/blog/categories');
			const response = await GET(request);
			const data = await response.json();

			expect(response.status).toBe(200);
			expect(data.success).toBe(true);
			expect(data.data).toEqual(mockCategories);
		});

		it('should handle service errors', async () => {
			vi.mocked(blogService.getCategories).mockRejectedValue(new Error('Service error'));

			const request = new NextRequest('http://localhost/api/blog/categories');
			const response = await GET(request);

			expect(response.status).toBe(500);
		});
	});

	describe('POST /api/blog/categories', () => {
		it('should create category successfully for admin', async () => {
			const mockCategory = {
				id: 3,
				name: 'Finance',
				slug: 'finance',
			};

			vi.mocked(blogService.createCategory).mockResolvedValue(mockCategory);

			const request = new NextRequest('http://localhost/api/blog/categories', {
				method: 'POST',
				body: JSON.stringify({
					name: 'Finance',
				}),
			});

			const response = await POST(request);
			const data = await response.json();

			expect(response.status).toBe(201);
			expect(data.success).toBe(true);
			expect(data.data).toEqual(mockCategory);
		});

		it('should return 403 for non-admin users', async () => {
			vi.mocked(checkAdminStatus).mockResolvedValue(false);

			const request = new NextRequest('http://localhost/api/blog/categories', {
				method: 'POST',
				body: JSON.stringify({
					name: 'Finance',
				}),
			});

			const response = await POST(request);
			expect(response.status).toBe(403);
		});

		it('should return 400 for invalid input', async () => {
			const request = new NextRequest('http://localhost/api/blog/categories', {
				method: 'POST',
				body: JSON.stringify({ invalid: 'data' }),
			});

			const response = await POST(request);
			expect(response.status).toBe(400);
		});

		it('should return 400 for invalid JSON', async () => {
			// Create a request with invalid JSON that will throw when parsed
			const request = new NextRequest('http://localhost/api/blog/categories', {
				method: 'POST',
				body: 'invalid json',
			});

			// The route should catch the JSON parse error and return 400
			// The test setup throws Error('Invalid JSON'), which the route catches
			const response = await POST(request);
			// Route catches the error and returns 400 via ApiErrorHandler
			expect(response.status).toBe(400);
		});

		it('should handle service errors', async () => {
			vi.mocked(blogService.createCategory).mockRejectedValue(new Error('Service error'));

			const request = new NextRequest('http://localhost/api/blog/categories', {
				method: 'POST',
				body: JSON.stringify({
					name: 'Finance',
				}),
			});

			const response = await POST(request);
			expect(response.status).toBe(500);
		});
	});
});
