/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		// Mock expense analytics data
		const analytics = {
			totalExpenses: 32000,
			monthlyTrend: -5.2,
			pendingApprovals: 3,
			averageProcessingTime: 24,
			budgetComparison: {
				budgeted: 40000,
				spent: 32000,
				remaining: 8000,
				overBudget: false,
			},
			topCategories: [
				{ category: 'Software & Tools', amount: 8500, percentage: 26.6, count: 12 },
				{ category: 'Marketing', amount: 6200, percentage: 19.4, count: 8 },
				{ category: 'Office Supplies', amount: 4800, percentage: 15.0, count: 15 },
				{ category: 'Travel', amount: 4200, percentage: 13.1, count: 6 },
				{ category: 'Professional Services', amount: 3800, percentage: 11.9, count: 4 },
			],
		};

		return NextResponse.json(analytics);
	} catch (error) {
		console.error('Error fetching expense analytics:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}
