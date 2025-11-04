import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { ApiErrorHandler, generateRequestId } from '@/lib/api-error-handler';
import { withRLS } from '@/lib/api/with-rls';
import { checkAdminStatus } from '@/lib/auth/check-admin-status';
import * as blogService from '@/lib/services/blog/blog-service';

/**
 * POST /api/blog/[id]/publish
 * Publish a blog post (admin only)
 */
export async function POST(
	req: NextRequest,
	{ params }: { params: { id: string } }
) {
	const requestId = generateRequestId();
	return withRLS(async (clerkUserId) => {
		// Check if user is admin
		const isAdmin = await checkAdminStatus();
		if (!isAdmin) {
			return ApiErrorHandler.forbidden('Only administrators can publish blog posts');
		}

		try {
			const id = parseInt(params.id);
			if (isNaN(id)) {
				return ApiErrorHandler.badRequest('Invalid blog post ID');
			}

			const publishedPost = await blogService.publishPost(id);

			return NextResponse.json({
				success: true,
				message: 'Blog post published successfully',
				data: publishedPost,
			});
		} catch (error) {
			return ApiErrorHandler.handle(error, requestId);
		}
	});
}

