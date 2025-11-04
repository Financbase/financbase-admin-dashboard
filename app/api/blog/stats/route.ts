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
import { withRLS } from '@/lib/api/with-rls';
import { checkAdminStatus } from '@/lib/auth/check-admin-status';
import * as blogService from '@/lib/services/blog/blog-service';

/**
 * GET /api/blog/stats
 * Get blog statistics (admin only)
 */
export async function GET(req: NextRequest) {
	const requestId = generateRequestId();
	return withRLS(async (clerkUserId) => {
		// Check if user is admin
		const isAdmin = await checkAdminStatus();
		if (!isAdmin) {
			return ApiErrorHandler.forbidden('Only administrators can view blog statistics');
		}

		try {
			const stats = await blogService.getBlogStats();

			return NextResponse.json({
				success: true,
				data: stats,
			});
		} catch (error) {
			return ApiErrorHandler.handle(error, requestId);
		}
	});
}

