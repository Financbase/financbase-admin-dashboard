import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { DashboardService } from '@/lib/services/dashboard-service';

export async function GET(request: Request) {
	try {
		// Authenticate user
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

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
		console.error('Error stack:', (error as Error).stack);
		return NextResponse.json({ 
			error: 'Failed to fetch dashboard overview', 
			details: (error as Error).message,
			stack: (error as Error).stack 
		}, { status: 500 });
	}
}
