/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { DashboardService } from '@/lib/services/dashboard-service';
import { ApiErrorHandler, generateRequestId } from '@/lib/api-error-handler';

export async function GET(request: Request) {
	const requestId = generateRequestId();
	try {
		// Authenticate user
		const { userId } = await auth();
		if (!userId) {
			return ApiErrorHandler.unauthorized();
		}

		// Get overview data from database
		const overview = await DashboardService.getOverview(userId);

		return NextResponse.json({
			message: 'Dashboard API with real database data works!',
			overview,
			userId,
			timestamp: new Date().toISOString()
		});
	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}
