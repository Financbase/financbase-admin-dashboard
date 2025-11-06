/**
 * Dashboard Chart Data API Route
 * Returns historical time series data for charts
 */

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
import { ApiErrorHandler, generateRequestId } from '@/lib/api-error-handler';
import { DashboardService } from '@/lib/services/dashboard-service';

/**
 * GET /api/dashboard/chart-data
 * Get historical chart data for time series visualization
 * 
 * Query parameters:
 * - type: 'revenue' | 'expenses' | 'sales' (default: 'revenue')
 * - period: '7d' | '30d' | '90d' | '12m' (default: '12m')
 * - timeRange: 'day' | 'week' | 'month' (default: 'month')
 */
export async function GET(request: NextRequest) {
	const requestId = generateRequestId();
	try {
		const { userId } = await auth();
		if (!userId) {
			return ApiErrorHandler.unauthorized();
		}

		const { searchParams } = new URL(request.url);
		const type = (searchParams.get('type') || 'revenue') as 'revenue' | 'expenses' | 'sales';
		const period = searchParams.get('period') || '12m';
		const timeRange = (searchParams.get('timeRange') || 'month') as 'day' | 'week' | 'month';

		// Calculate date range based on period
		const now = new Date();
		let startDate: Date;
		
		switch (period) {
			case '7d':
				startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
				break;
			case '30d':
				startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
				break;
			case '90d':
				startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
				break;
			case '12m':
			default:
				startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
				break;
		}

		// Fetch chart data from service
		const chartData = await DashboardService.getChartData(userId, {
			type,
			dateRange: {
				start: startDate,
				end: now,
			},
			timeRange,
		});

		// Transform to time series format for line/area charts
		const timeSeriesData = chartData.labels.map((label, index) => ({
			date: label,
			value: chartData.datasets[0]?.data[index] || 0,
		}));

		return NextResponse.json({
			success: true,
			data: {
				labels: chartData.labels,
				datasets: chartData.datasets,
				timeSeries: timeSeriesData,
			},
		});
	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}

