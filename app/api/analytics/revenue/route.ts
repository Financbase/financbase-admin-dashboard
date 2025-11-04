/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { AnalyticsService } from '@/lib/services/analytics/analytics-service';
import { ApiErrorHandler, generateRequestId } from '@/lib/api-error-handler';

export async function GET(request: NextRequest) {
	const requestId = generateRequestId();
	try {
		const { userId } = await auth();
		if (!userId) {
			return ApiErrorHandler.unauthorized();
		}

		const { searchParams } = new URL(request.url);
		const period = searchParams.get('period') || '12months';

		// For now, always return 12 months of data regardless of period parameter
		// In a full implementation, this would handle different time periods
		const revenueAnalytics = await AnalyticsService.getRevenueAnalytics(userId);

		return NextResponse.json({ analytics: revenueAnalytics });
	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}
