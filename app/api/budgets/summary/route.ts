/**
 * Budget Summary API Route
 * Get overall budget statistics and summary
 */

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
import { ApiErrorHandler } from '@/lib/api-error-handler';
import { getBudgetSummary } from '@/lib/services/budget-service';

/**
 * GET /api/budgets/summary
 * Get overall budget summary with statistics
 */
export async function GET(req: NextRequest) {
	try {
		const { userId } = await auth();
		if (!userId) {
			return ApiErrorHandler.unauthorized();
		}

		const summary = await getBudgetSummary(userId);

		return NextResponse.json({
			success: true,
			data: summary,
		});
	} catch (error) {
		return ApiErrorHandler.handle(error);
	}
}

