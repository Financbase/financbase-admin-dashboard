/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { NextRequest, NextResponse } from 'next/server';
import { ApiErrorHandler } from '@/lib/api-error-handler';
import { logger } from '@/lib/logger';

/**
 * GET /api/test-dashboard-insights
 * Test endpoint for AI insights data
 */
export async function GET(request: NextRequest) {
	try {
		return NextResponse.json({
			insights: [
				{
					type: 'success' as const,
					title: 'Revenue Growth',
					description: 'Your revenue has grown 19.6% this month compared to last month. Consider increasing marketing spend to capitalize on this momentum.',
					action: 'View Revenue Report'
				},
				{
					type: 'warning' as const,
					title: 'Pending Invoices',
					description: 'You have 8 pending invoices totaling $15,680. Consider following up with clients to improve cash flow.',
					action: 'Send Reminders'
				},
				{
					type: 'info' as const,
					title: 'Expense Optimization',
					description: 'Your office expenses have increased 18.7%. Review vendor contracts for potential cost savings.',
					action: 'Review Expenses'
				}
			]
		});
	} catch (error) {
		logger.error('Error in test-dashboard-insights route', { error });
		return ApiErrorHandler.handle(error);
	}
}
