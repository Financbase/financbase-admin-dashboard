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
import { createBlogPostSchema } from '@/lib/validation-schemas';
import { ApiErrorHandler, generateRequestId } from '@/lib/api-error-handler';
import { withRLS } from '@/lib/api/with-rls';
import { checkAdminStatus } from '@/lib/auth/check-admin-status';
import * as blogService from '@/lib/services/blog/blog-service';
import { createSuccessResponse, type StandardApiResponse } from '@/lib/api/standard-response';

/**
 * GET /api/blog
 * List blog posts (public for published posts, admin can see all)
 */
export async function GET(req: NextRequest) {
	const requestId = generateRequestId();
	const { searchParams } = new URL(req.url);
	const page = parseInt(searchParams.get('page') || '1');
	const limit = parseInt(searchParams.get('limit') || '10');
	const offset = (page - 1) * limit;

	const status = searchParams.get('status') as 'draft' | 'published' | 'scheduled' | 'archived' | null;
	const categoryId = searchParams.get('categoryId') ? parseInt(searchParams.get('categoryId')!) : undefined;
	const search = searchParams.get('search') || undefined;
	const isFeatured = searchParams.get('featured') === 'true' ? true : searchParams.get('featured') === 'false' ? false : undefined;

	try {
		const { userId } = await auth();
		const isAdmin = userId ? await checkAdminStatus() : false;

		// Public users can only see published posts
		// Admin users can see all posts
		const queryStatus = isAdmin ? (status || undefined) : 'published';

		const result = await blogService.getPosts({
			status: queryStatus,
			categoryId,
			search,
			isFeatured,
			limit,
			offset,
			includeArchived: isAdmin,
		});

		return createSuccessResponse(
			result.posts,
			200,
			{
				requestId,
				pagination: {
					page,
					limit,
					total: result.total,
					totalPages: Math.ceil(result.total / limit),
				},
			}
		);
	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}

/**
 * POST /api/blog
 * Create a new blog post (admin only)
 */
export async function POST(req: NextRequest) {
	const requestId = generateRequestId();
	return withRLS<StandardApiResponse<unknown>>(async (clerkUserId, clerkUser, request) => {
		// Check if user is admin
		const isAdmin = await checkAdminStatus();
		if (!isAdmin) {
			return ApiErrorHandler.forbidden('Only administrators can create blog posts') as NextResponse<StandardApiResponse<unknown>>;
		}

		// Parse JSON body with proper error handling
		let body;
		try {
			body = await (request || req).json();
		} catch (error) {
			// Handle JSON parse errors (malformed JSON)
			if (error instanceof SyntaxError || error instanceof TypeError) {
				return ApiErrorHandler.badRequest('Invalid JSON in request body') as NextResponse<StandardApiResponse<unknown>>;
			}
			// Re-throw other errors to be handled by outer catch
			throw error;
		}

		try {
			const validatedData = createBlogPostSchema.parse({
				...body,
				userId: clerkUserId, // Ensure userId comes from auth, not request body
			});

			const newPost = await blogService.createPost(validatedData);

			return createSuccessResponse(
				newPost,
				201,
				{ requestId }
			);
		} catch (error) {
			return ApiErrorHandler.handle(error, requestId) as NextResponse<StandardApiResponse<unknown>>;
		}
	});
}

