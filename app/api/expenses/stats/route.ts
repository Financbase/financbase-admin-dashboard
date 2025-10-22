/**
 * Expense Statistics API Route
 * Returns expense statistics for the user
 */

import { auth } from '@clerk/nextjs/server';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { ExpenseService } from '@/lib/services/expense-service';

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
		console.error('Error fetching expense stats:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch expense statistics' },
			{ status: 500 }
		);
	}
}

