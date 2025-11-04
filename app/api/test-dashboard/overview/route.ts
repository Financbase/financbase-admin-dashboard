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
		overview: {
			revenue: {
				total: 45231.89,
				thisMonth: 18000,
				lastMonth: 15000,
				growth: 20.1
			},
			clients: {
				total: 50,
				active: 12,
				newThisMonth: 2
			},
			invoices: {
				total: 25,
				pending: 8,
				overdue: 2,
				totalAmount: 12450
			},
			expenses: {
				total: 15000,
				thisMonth: 2350,
				lastMonth: 2500,
				growth: -5.2
			},
			netIncome: {
				thisMonth: 15650,
				lastMonth: 12500,
				growth: 25.2
			}
		}
	});
}
