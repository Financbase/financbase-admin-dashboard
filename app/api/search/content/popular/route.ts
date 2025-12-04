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
import { searchService } from '@/lib/services/content/search-service';

/**
 * GET /api/search/content/popular
 * Get popular search queries
 */
export async function GET(request: NextRequest) {
	const requestId = generateRequestId();
	try {
		const { userId } = await auth();
		if (!userId) {
			return ApiErrorHandler.unauthorized();
		}

		const { searchParams } = new URL(request.url);
		const limit = parseInt(searchParams.get('limit') || '10', 10);

		const popularQueries = await searchService.getPopularQueries(limit);

		return NextResponse.json({
			success: true,
			data: popularQueries.map(q => ({
				query: q.query,
				count: Number(q.count),
			})),
		});
	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}

