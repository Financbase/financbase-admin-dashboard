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

		const { searchParams } = new URL(request.url);
		const chartType = searchParams.get('chartType') as 'sales' | 'revenue' | 'expenses' | null;
		const timeRange = searchParams.get('timeRange') as 'day' | 'week' | 'month' | null;
		
		// Get overview data
		const overview = await DashboardService.getOverview(userId);
		
		// Get chart data if requested
		let chartData = null;
		if (chartType && timeRange) {
			const now = new Date();
			const startDate = new Date();
			
			// Calculate date range based on timeRange
			switch (timeRange) {
				case 'day':
					startDate.setDate(now.getDate() - 30); // Last 30 days
					break;
				case 'week':
					startDate.setDate(now.getDate() - 84); // Last 12 weeks
					break;
				case 'month':
					startDate.setMonth(now.getMonth() - 12); // Last 12 months
					break;
			}
			
			chartData = await DashboardService.getChartData(userId, {
				type: chartType,
				dateRange: { start: startDate, end: now },
				timeRange,
			});
		}

		return NextResponse.json({ 
			overview,
			...(chartData && { chartData })
		});
	} catch (error) {
		console.error('Error fetching dashboard overview:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch dashboard overview' },
			{ status: 500 }
		);
	}
}
