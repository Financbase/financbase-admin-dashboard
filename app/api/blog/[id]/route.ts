import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { updateBlogPostSchema } from '@/lib/validation-schemas';
import { ApiErrorHandler, generateRequestId } from '@/lib/api-error-handler';
import { withRLS } from '@/lib/api/with-rls';
import { checkAdminStatus } from '@/lib/auth/check-admin-status';
import * as blogService from '@/lib/services/blog/blog-service';

/**
 * GET /api/blog/[id]
 * Get a blog post by ID (admin only)
 */
export async function GET(
	req: NextRequest,
	{ params }: { params: { id: string } }
) {
	const requestId = generateRequestId();
	return withRLS(async (clerkUserId) => {
		// Check if user is admin
		const isAdmin = await checkAdminStatus();
		if (!isAdmin) {
			return ApiErrorHandler.forbidden('Only administrators can view blog posts by ID');
		}

		try {
			const id = parseInt(params.id);
			if (isNaN(id)) {
				return ApiErrorHandler.validationError(new Error('Invalid blog post ID') as any);
			}

			const post = await blogService.getPostById(id, true);

			if (!post) {
				return ApiErrorHandler.notFound('Blog post not found');
			}

			return NextResponse.json({
				success: true,
				data: post,
			});
		} catch (error) {
			return ApiErrorHandler.handle(error, requestId);
		}
	});
}

/**
 * PUT /api/blog/[id]
 * Update a blog post (admin only)
 */
export async function PUT(
	req: NextRequest,
	{ params }: { params: { id: string } }
) {
	const requestId = generateRequestId();
	return withRLS(async (clerkUserId) => {
		// Check if user is admin
		const isAdmin = await checkAdminStatus();
		if (!isAdmin) {
			return ApiErrorHandler.forbidden('Only administrators can update blog posts');
		}

		try {
			const id = parseInt(params.id);
			if (isNaN(id)) {
				return ApiErrorHandler.validationError(new Error('Invalid blog post ID') as any);
			}

			const body = await req.json();
			const validatedData = updateBlogPostSchema.parse({
				...body,
				id,
			});

			const updatedPost = await blogService.updatePost(id, validatedData);

			return NextResponse.json({
				success: true,
				message: 'Blog post updated successfully',
				data: updatedPost,
			});
		} catch (error) {
			return ApiErrorHandler.handle(error, requestId);
		}
	});
}

/**
 * DELETE /api/blog/[id]
 * Delete a blog post (admin only)
 */
export async function DELETE(
	req: NextRequest,
	{ params }: { params: { id: string } }
) {
	const requestId = generateRequestId();
	return withRLS(async (clerkUserId) => {
		// Check if user is admin
		const isAdmin = await checkAdminStatus();
		if (!isAdmin) {
			return ApiErrorHandler.forbidden('Only administrators can delete blog posts');
		}

		try {
			const id = parseInt(params.id);
			if (isNaN(id)) {
				return ApiErrorHandler.validationError(new Error('Invalid blog post ID') as any);
			}

			const { searchParams } = new URL(req.url);
			const hardDelete = searchParams.get('hardDelete') === 'true';

			await blogService.deletePost(id, hardDelete);

			return NextResponse.json({
				success: true,
				message: hardDelete ? 'Blog post deleted permanently' : 'Blog post archived successfully',
			});
		} catch (error) {
			return ApiErrorHandler.handle(error, requestId);
		}
	});
}

