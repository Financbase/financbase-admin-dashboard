import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
// import { headers } from 'next/headers'; // Temporarily disabled
import { DashboardService } from '@/lib/services/dashboard-service';

export async function GET(request: NextRequest) {
	try {
		// TEMPORARILY DISABLED FOR TESTING
		// const headersList = await headers();
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { searchParams } = new URL(request.url);
		const limit = parseInt(searchParams.get('limit') || '10');

		const activities = await DashboardService.getRecentActivity(userId, limit);

		return NextResponse.json({ activities });
	} catch (error) {
		console.error('Error fetching recent activity:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch recent activity' },
			{ status: 500 }
		);
	}
}
