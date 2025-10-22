import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		// Mock invoice analytics data
		const analytics = {
			totalRevenue: 45000,
			totalOutstanding: 12500,
			averagePaymentTime: 22,
			overdueInvoices: 2,
			monthlyTrend: 12.5,
			topClients: [
				{ name: 'Acme Corp', total: 15000, count: 5 },
				{ name: 'TechStart Inc', total: 8500, count: 3 },
				{ name: 'Global Solutions', total: 6200, count: 2 },
			],
		};

		return NextResponse.json(analytics);
	} catch (error) {
		console.error('Error fetching invoice analytics:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}
