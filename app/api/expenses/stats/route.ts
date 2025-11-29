/**
 * Expense Statistics API Route
 * Returns expense statistics for the user
 */

/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */


import { auth } from '@clerk/nextjs/server';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { ExpenseService } from '@/lib/services/expense-service';
import { logger } from '@/lib/logger';

/**
 * GET /api/expenses/stats
 * Get expense statistics
 */
export async function GET(req: NextRequest) {
	try {
		const { userId } = await auth();

		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const searchParams = req.nextUrl.searchParams;
		const timeframe = searchParams.get('timeframe') as 'month' | 'year' | undefined;

		const stats = await ExpenseService.getStats(userId, timeframe);

		return NextResponse.json(stats);
	} catch (error) {
		logger.error('Error fetching expense stats:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch expense statistics' },
			{ status: 500 }
		);
	}
}

