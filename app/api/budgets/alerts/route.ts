/**
 * Budget Alerts API Route
 * Get active budget alerts based on spending thresholds
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
import { getBudgetAlerts } from '@/lib/services/budget-service';

/**
 * GET /api/budgets/alerts
 * Get active budget alerts
 */
export async function GET(req: NextRequest) {
	try {
		const { userId } = await auth();
		if (!userId) {
			return ApiErrorHandler.unauthorized();
		}

		const alerts = await getBudgetAlerts(userId);

		return NextResponse.json({
			success: true,
			data: alerts,
		});
	} catch (error) {
		return ApiErrorHandler.handle(error);
	}
}

