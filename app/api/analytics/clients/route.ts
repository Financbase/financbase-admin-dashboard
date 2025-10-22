import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { AnalyticsService } from '@/lib/services/analytics/analytics-service';

export async function GET() {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const clientAnalytics = await AnalyticsService.getClientAnalytics(userId);

		return NextResponse.json({ analytics: clientAnalytics });
	} catch (error) {
		console.error('Error fetching client analytics:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch client analytics' },
			{ status: 500 }
		);
	}
}
