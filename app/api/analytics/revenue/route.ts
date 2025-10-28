import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { AnalyticsService } from '@/lib/services/analytics/analytics-service';

export async function GET(request: NextRequest) {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { searchParams } = new URL(request.url);
		const period = searchParams.get('period') || '12months';

		// For now, always return 12 months of data regardless of period parameter
		// In a full implementation, this would handle different time periods
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
