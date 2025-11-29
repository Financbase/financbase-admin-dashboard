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
import { ApiErrorHandler, generateRequestId } from '@/lib/api-error-handler';
import { withRLS } from '@/lib/api/with-rls';
import { checkAdminStatus } from '@/lib/auth/check-admin-status';
import * as blogService from '@/lib/services/blog/blog-service';
import { createSuccessResponse } from '@/lib/api/standard-response';

/**
 * POST /api/blog/[id]/publish
 * Publish a blog post (admin only)
 */
export async function POST(
	req: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	const requestId = generateRequestId();
	return withRLS(async (clerkUserId) => {
		// Check if user is admin
		const isAdmin = await checkAdminStatus();
		if (!isAdmin) {
			return ApiErrorHandler.forbidden('Only administrators can publish blog posts');
		}

		try {
			const { id: idParam } = await params;
			const id = parseInt(idParam);
			if (isNaN(id)) {
				return ApiErrorHandler.badRequest('Invalid blog post ID');
			}

			const publishedPost = await blogService.publishPost(id);

			return createSuccessResponse(publishedPost, 200, { requestId });
		} catch (error) {
			return ApiErrorHandler.handle(error, requestId);
		}
	});
}

