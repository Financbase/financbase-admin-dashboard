import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/test-dashboard-activity
 * Test endpoint for recent activity data
 */
export async function GET(request: NextRequest) {
	return NextResponse.json({
		activities: [
			{
				id: '1',
				type: 'invoice',
				description: 'Invoice INV-001 sent to TechCorp Inc.',
				amount: 2500.00,
				status: 'sent',
				createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString() // 30 minutes ago
			},
			{
				id: '2',
				type: 'expense',
				description: 'Office supplies purchase',
				amount: 450.00,
				status: 'approved',
				createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() // 2 hours ago
			},
			{
				id: '3',
				type: 'payment',
				description: 'Payment received from ABC Agency',
				amount: 1800.00,
				status: 'completed',
				createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString() // 4 hours ago
			},
			{
				id: '4',
				type: 'client',
				description: 'New client Digital Solutions Ltd. added',
				amount: undefined,
				status: 'active',
				createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString() // 6 hours ago
			},
			{
				id: '5',
				type: 'invoice',
				description: 'Invoice INV-002 paid by Marketing Pro',
				amount: 3200.00,
				status: 'paid',
				createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() // 1 day ago
			}
		]
	});
}
