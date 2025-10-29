import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { headers } from 'next/headers';

export async function GET(request: Request) {
	try {
		await headers(); // Await headers before using auth
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		// Mock data for testing
		const overview = {
			revenue: {
				total: 125000,
				thisMonth: 45000,
				lastMonth: 38000,
				growth: 18.4
			},
			clients: {
				total: 25,
				active: 22,
				newThisMonth: 3
			},
			invoices: {
				total: 45,
				pending: 8,
				overdue: 2,
				totalAmount: 125000
			},
			expenses: {
				total: 75000,
				thisMonth: 28000,
				lastMonth: 22000,
				growth: 27.3
			},
			netIncome: {
				thisMonth: 17000,
				lastMonth: 16000,
				growth: 6.25
			}
		};

		return NextResponse.json({
			message: 'Dashboard API with mock data works!',
			overview,
			userId,
			timestamp: new Date().toISOString()
		});
	} catch (error) {
		console.error('Dashboard API error:', error);
		return NextResponse.json({ error: 'Failed to fetch dashboard overview', details: (error as Error).message }, { status: 500 });
	}
}
