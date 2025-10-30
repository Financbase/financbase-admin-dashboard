import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { headers } from 'next/headers';
import { DashboardService } from '@/lib/services/dashboard-service';

export async function GET(request: Request) {
	try {
		await headers(); // Await headers before using auth
		// TEMPORARILY DISABLED FOR TESTING
		// const { userId } = await auth();
		// if (!userId) {
		// 	return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		// }
		const userId = '550e8400-e29b-41d4-a716-446655440001'; // Temporary for testing

		// Get overview data from database
		const overview = await DashboardService.getOverview(userId);

		return NextResponse.json({
			message: 'Dashboard API with real database data works!',
			overview,
			userId,
			timestamp: new Date().toISOString()
		});
	} catch (error) {
		console.error('Dashboard API error:', error);
		return NextResponse.json({ error: 'Failed to fetch dashboard overview', details: (error as Error).message }, { status: 500 });
	}
}
