import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { AnalyticsService } from '@/lib/services/analytics/analytics-service';

export async function GET() {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const revenueAnalytics = await AnalyticsService.getRevenueAnalytics(userId);

		return NextResponse.json({ analytics: revenueAnalytics });
	} catch (error) {
		console.error('Error fetching revenue analytics:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch revenue analytics' },
			{ status: 500 }
		);
	}
}
