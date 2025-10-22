import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { AnalyticsService } from '@/lib/services/analytics/analytics-service';

export async function GET() {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const expenseAnalytics = await AnalyticsService.getExpenseAnalytics(userId);

		return NextResponse.json({ analytics: expenseAnalytics });
	} catch (error) {
		console.error('Error fetching expense analytics:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch expense analytics' },
			{ status: 500 }
		);
	}
}
