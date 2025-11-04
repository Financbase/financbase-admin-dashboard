/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/test-dashboard-insights
 * Test endpoint for AI insights data
 */
export async function GET(request: NextRequest) {
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
}
