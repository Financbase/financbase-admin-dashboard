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
 * GET /api/test-dashboard-overview
 * Test endpoint for dashboard overview data
 */
export async function GET(request: NextRequest) {
	try {
		return NextResponse.json({
			overview: {
				revenue: {
					total: 45231.89,
					thisMonth: 15420.50,
					lastMonth: 12890.25,
					growth: 19.6
				},
				clients: {
					total: 45,
					active: 42,
					newThisMonth: 3
				},
				invoices: {
					total: 28,
					pending: 8,
					overdue: 2,
					totalAmount: 15680.00
				},
				expenses: {
					total: 8500.00,
					thisMonth: 2350.00,
					lastMonth: 1980.00,
					growth: 18.7
				},
				netIncome: {
					thisMonth: 13070.50,
					lastMonth: 10910.25,
					growth: 19.8
				}
			}
		});
	} catch (error) {
		logger.error('Error in test-dashboard-overview route', { error });
		return ApiErrorHandler.handle(error);
	}
}
