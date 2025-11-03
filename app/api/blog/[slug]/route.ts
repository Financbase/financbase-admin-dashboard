import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { ApiErrorHandler, generateRequestId } from '@/lib/api-error-handler';
import { checkAdminStatus } from '@/lib/auth/check-admin-status';
import * as blogService from '@/lib/services/blog/blog-service';

/**
 * GET /api/blog/[slug]
 * Get a single blog post by slug (public for published posts, admin can see all)
 */
export async function GET(
	req: NextRequest,
	{ params }: { params: { slug: string } }
) {
	const requestId = generateRequestId();
	try {
		const { userId } = await auth();
		const isAdmin = userId ? await checkAdminStatus() : false;

		const slug = params.slug;
		const post = await blogService.getPostBySlug(slug, isAdmin);

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
				console.error('Error incrementing view count:', err);
			});
		}

		return NextResponse.json({
			success: true,
			data: post,
		});
	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}

