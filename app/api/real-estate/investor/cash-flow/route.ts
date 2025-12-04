/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { ApiErrorHandler, generateRequestId } from '@/lib/api-error-handler';
import { z } from 'zod';
import { logger } from '@/lib/logger';

interface CashFlowRow {
	month: Date | string;
	income: string | number;
	expenses: string | number;
	net_cash_flow: string | number;
}

// Simple database connection using neon directly
async function getDbConnection() {
	const { neon } = await import('@neondatabase/serverless');
	if (!process.env.DATABASE_URL) {
		throw new Error('DATABASE_URL is not configured');
	}
	return neon(process.env.DATABASE_URL);
}

const queryParamsSchema = z.object({
	months: z.string().optional().transform((val) => {
		const num = parseInt(val || '12', 10);
		return Math.min(Math.max(num, 1), 36); // Clamp between 1 and 36 months
	}),
});

// GET /api/real-estate/investor/cash-flow - Get monthly cash flow data
export async function GET(request: NextRequest) {
	const requestId = generateRequestId();
	try {
		const { userId } = await auth();
		if (!userId) {
			return ApiErrorHandler.unauthorized('Authentication required');
		}

		const { searchParams } = new URL(request.url);
		const params = queryParamsSchema.parse({
			months: searchParams.get('months'),
		});
		const months = params.months || 12;

		// Get database connection
		const sql = await getDbConnection();

		// Get monthly cash flow data for the last N months with parameterized query
		const cashFlowResult = (await sql`
			WITH monthly_data AS (
				SELECT
					date_trunc('month', generate_series(
						CURRENT_DATE - INTERVAL '1 month' * ${months}::int,
						CURRENT_DATE,
						INTERVAL '1 month'
					))::date as month
			),
			income_data AS (
				SELECT
					date_trunc('month', pi.date)::date as month,
					COALESCE(SUM(pi.amount), 0)::decimal as income
				FROM property_income pi
				WHERE pi.user_id = ${userId}
					AND pi.income_type = 'rent'
					AND pi.payment_status = 'received'
					AND pi.date >= CURRENT_DATE - INTERVAL '1 month' * ${months}::int
				GROUP BY date_trunc('month', pi.date)
			),
			expense_data AS (
				SELECT
					date_trunc('month', pe.date)::date as month,
					COALESCE(SUM(pe.amount), 0)::decimal as expenses
				FROM property_expenses pe
				WHERE pe.user_id = ${userId}
					AND pe.date >= CURRENT_DATE - INTERVAL '1 month' * ${months}::int
				GROUP BY date_trunc('month', pe.date)
			)
			SELECT
				md.month,
				COALESCE(id.income, 0)::decimal as income,
				COALESCE(ed.expenses, 0)::decimal as expenses,
				COALESCE(id.income, 0) - COALESCE(ed.expenses, 0) as net_cash_flow
			FROM monthly_data md
			LEFT JOIN income_data id ON md.month = id.month
			LEFT JOIN expense_data ed ON md.month = ed.month
			ORDER BY md.month
		`) as CashFlowRow[];

		const cashFlowData = cashFlowResult.map((row: CashFlowRow) => ({
			month: row.month instanceof Date ? row.month.toISOString().split('T')[0] : row.month,
			income: Number(row.income || 0),
			expenses: Number(row.expenses || 0),
			netCashFlow: Number(row.net_cash_flow || 0),
		}));

		return NextResponse.json({ cashFlowData });

	} catch (error) {
		if (error instanceof z.ZodError) {
			return ApiErrorHandler.validationError(error, requestId);
		}
		logger.error('Failed to fetch cash flow data:', error);
		return ApiErrorHandler.databaseError(error, requestId);
	}
}
