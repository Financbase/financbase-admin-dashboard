/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { updateBlogPostSchema } from '@/lib/validation-schemas';
import { ApiErrorHandler, generateRequestId } from '@/lib/api-error-handler';
import { withRLS } from '@/lib/api/with-rls';
import { checkAdminStatus } from '@/lib/auth/check-admin-status';
import * as blogService from '@/lib/services/blog/blog-service';
import { createSuccessResponse, type StandardApiResponse } from '@/lib/api/standard-response';
import { logger } from '@/lib/logger';

/**
 * GET /api/blog/[id]
 * Get a blog post by ID (admin only) or by slug (public for published posts)
 */
export async function GET(
	req: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	const requestId = generateRequestId();
	try {
		const { userId } = await auth();
		const isAdmin = userId ? await checkAdminStatus() : false;
		
		const { id: param } = await params;
		
		// Check if param is numeric (ID) or a slug
		const numericId = parseInt(param);
		const isNumericId = !isNaN(numericId) && numericId.toString() === param;

		if (isNumericId) {
			// Handle numeric ID (admin only)
			if (!isAdmin) {
				return ApiErrorHandler.forbidden('Only administrators can view blog posts by ID');
			}

			const post = await blogService.getPostById(numericId, true);

			if (!post) {
				return ApiErrorHandler.notFound('Blog post not found');
			}

			return createSuccessResponse(post, 200, { requestId });
		} else {
			// Handle slug (public for published posts, admin can see all)
			const post = await blogService.getPostBySlug(param, isAdmin);

			if (!post) {
				return ApiErrorHandler.notFound('Blog post not found');
			}

			// Non-admin users can only see published posts
			if (!isAdmin && post.status !== 'published') {
				return ApiErrorHandler.notFound('Blog post not found');
			}

			// Increment view count if published and not viewed by author
			if (post.status === 'published' && post.userId !== userId) {
				// Fire and forget - don't wait for view count update
				blogService.incrementViewCount(post.id).catch((err) => {
					logger.error('Error incrementing view count:', err);
				});
			}

			return createSuccessResponse(post, 200, { requestId });
		}
	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}

/**
 * PUT /api/blog/[id]
 * Update a blog post (admin only)
 */
export async function PUT(
	req: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	const requestId = generateRequestId();
	return withRLS<StandardApiResponse<unknown>>(async (clerkUserId, clerkUser, request) => {
		// Check if user is admin
		const isAdmin = await checkAdminStatus();
		if (!isAdmin) {
			return ApiErrorHandler.forbidden('Only administrators can update blog posts') as NextResponse<StandardApiResponse<unknown>>;
		}

		try {
			const { id: idParam } = await params;
			const id = parseInt(idParam);
			if (isNaN(id)) {
				return ApiErrorHandler.badRequest('Invalid blog post ID', requestId) as NextResponse<StandardApiResponse<unknown>>;
			}

			// Parse JSON body with proper error handling
			let body;
			try {
				body = await (request || req).json();
			} catch (error) {
				// Handle JSON parse errors (malformed JSON)
				if (
					error instanceof SyntaxError ||
					error instanceof TypeError ||
					(error instanceof Error && error.message.includes('Invalid JSON'))
				) {
					return ApiErrorHandler.badRequest('Invalid JSON in request body', requestId) as NextResponse<StandardApiResponse<unknown>>;
				}
				// Re-throw other errors to be handled by outer catch
				throw error;
			}

			const validatedData = updateBlogPostSchema.parse({
				...body,
				id,
			});

			const updatedPost = await blogService.updatePost(id, validatedData);

			return createSuccessResponse(updatedPost, 200, { requestId });
		} catch (error) {
			return ApiErrorHandler.handle(error, requestId) as NextResponse<StandardApiResponse<unknown>>;
		}
	});
}

/**
 * DELETE /api/blog/[id]
 * Delete a blog post (admin only)
 */
export async function DELETE(
	req: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	const requestId = generateRequestId();
	return withRLS<StandardApiResponse<unknown>>(async (clerkUserId, clerkUser, request) => {
		// Check if user is admin
		const isAdmin = await checkAdminStatus();
		if (!isAdmin) {
			return ApiErrorHandler.forbidden('Only administrators can delete blog posts') as NextResponse<StandardApiResponse<unknown>>;
		}

		try {
			const { id: idParam } = await params;
			const id = parseInt(idParam);
			if (isNaN(id)) {
				return ApiErrorHandler.badRequest('Invalid blog post ID', requestId) as NextResponse<StandardApiResponse<unknown>>;
			}

			const { searchParams } = new URL((request || req).url);
			const hardDelete = searchParams.get('hardDelete') === 'true';

			await blogService.deletePost(id, hardDelete);

			return createSuccessResponse(
				{ message: hardDelete ? 'Blog post deleted permanently' : 'Blog post archived successfully' },
				200,
				{ requestId }
			);
		} catch (error) {
			return ApiErrorHandler.handle(error, requestId) as NextResponse<StandardApiResponse<unknown>>;
		}
	});
}

