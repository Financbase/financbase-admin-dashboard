/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

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
