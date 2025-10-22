import { NextResponse } from 'next/server';

export async function GET() {
	return NextResponse.json({
		insights: [
			{
				type: 'success',
				title: 'Revenue Growth',
				description: 'Your revenue has grown by 20.1% this month. Great job!',
				action: 'View Details'
			},
			{
				type: 'warning',
				title: 'Expense Alert',
				description: 'Consider reviewing your expense categories',
				action: 'Review'
			},
			{
				type: 'info',
				title: 'New Clients',
				description: "You've added 2 new clients this month. Keep up the great work!",
				action: undefined
			}
		]
	});
}
