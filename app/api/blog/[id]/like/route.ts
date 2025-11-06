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
import { ApiErrorHandler, generateRequestId } from '@/lib/api-error-handler';
import * as blogService from '@/lib/services/blog/blog-service';

/**
 * POST /api/blog/[id]/like
 * Increment like count for a blog post (public endpoint)
 */
export async function POST(
	req: NextRequest,
	{ params }: { params: { id: string } }
) {
	const requestId = generateRequestId();
	try {
		const id = parseInt(params.id);
		if (isNaN(id)) {
			return ApiErrorHandler.badRequest('Invalid blog post ID');
		}

		const likeCount = await blogService.incrementLikeCount(id);

		return NextResponse.json({
			success: true,
			message: 'Post liked successfully',
			data: {
				likeCount,
			},
		});
	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}

