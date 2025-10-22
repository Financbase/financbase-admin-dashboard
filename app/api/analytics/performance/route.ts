import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { AnalyticsService } from '@/lib/services/analytics/analytics-service';

export async function GET() {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const performanceMetrics = await AnalyticsService.getPerformanceMetrics(userId);

		return NextResponse.json({ metrics: performanceMetrics });
	} catch (error) {
		console.error('Error fetching performance metrics:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch performance metrics' },
			{ status: 500 }
		);
	}
}
