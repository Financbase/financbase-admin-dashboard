import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { DashboardService } from '@/lib/services/dashboard-service';

export async function GET() {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const insights = await DashboardService.getAIInsights(userId);

		return NextResponse.json({ insights });
	} catch (error) {
		console.error('Error fetching AI insights:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch AI insights' },
			{ status: 500 }
		);
	}
}
