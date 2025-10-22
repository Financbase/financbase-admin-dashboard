import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { DashboardService } from '@/lib/services/dashboard-service';

export async function GET() {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const overview = await DashboardService.getOverview(userId);

		return NextResponse.json({ overview });
	} catch (error) {
		console.error('Error fetching dashboard overview:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch dashboard overview' },
			{ status: 500 }
		);
	}
}
