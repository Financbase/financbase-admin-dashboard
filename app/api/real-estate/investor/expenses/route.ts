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

interface ExpenseBreakdownRow {
	category: string;
	total_amount: string | number;
	expense_count: string | number;
	average_amount: string | number;
}

interface MonthlyExpenseRow {
	month: Date | string;
	total_expenses: string | number;
}

interface TopVendorRow {
	vendor: string;
	total_amount: string | number;
	transaction_count: string | number;
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

// GET /api/real-estate/investor/expenses - Get expense analytics
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

		// Get expense breakdown by category with parameterized query
		const expenseBreakdownResult = (await sql`
			SELECT
				pe.category,
				SUM(pe.amount)::decimal as total_amount,
				COUNT(*)::int as expense_count,
				AVG(pe.amount)::decimal as average_amount
			FROM property_expenses pe
			WHERE pe.user_id = ${userId}
				AND pe.date >= CURRENT_DATE - INTERVAL '1 month' * ${months}::int
			GROUP BY pe.category
			ORDER BY total_amount DESC
		`) as ExpenseBreakdownRow[];

		// Get monthly expense trends
		const monthlyExpensesResult = (await sql`
			SELECT
				date_trunc('month', pe.date)::date as month,
				SUM(pe.amount)::decimal as total_expenses
			FROM property_expenses pe
			WHERE pe.user_id = ${userId}
				AND pe.date >= CURRENT_DATE - INTERVAL '1 month' * ${months}::int
			GROUP BY date_trunc('month', pe.date)
			ORDER BY month
		`) as MonthlyExpenseRow[];

		// Get top vendors
		const topVendorsResult = (await sql`
			SELECT
				pe.vendor,
				SUM(pe.amount)::decimal as total_amount,
				COUNT(*)::int as transaction_count
			FROM property_expenses pe
			WHERE pe.user_id = ${userId}
				AND pe.vendor IS NOT NULL
				AND pe.date >= CURRENT_DATE - INTERVAL '1 month' * ${months}::int
			GROUP BY pe.vendor
			ORDER BY total_amount DESC
			LIMIT 10
		`) as TopVendorRow[];

		const expenseBreakdown = expenseBreakdownResult.map((row: ExpenseBreakdownRow) => ({
			category: row.category,
			totalAmount: Number(row.total_amount || 0),
			expenseCount: Number(row.expense_count || 0),
			averageAmount: Number(row.average_amount || 0),
		}));

		const monthlyExpenses = monthlyExpensesResult.map((row: MonthlyExpenseRow) => ({
			month: row.month instanceof Date ? row.month.toISOString().split('T')[0] : row.month,
			totalExpenses: Number(row.total_expenses || 0),
		}));

		const topVendors = topVendorsResult.map((row: TopVendorRow) => ({
			vendor: row.vendor,
			totalAmount: Number(row.total_amount || 0),
			transactionCount: Number(row.transaction_count || 0),
		}));

		return NextResponse.json({
			expenseBreakdown,
			monthlyExpenses,
			topVendors,
		});

	} catch (error) {
		if (error instanceof z.ZodError) {
			return ApiErrorHandler.validationError(error, requestId);
		}
		logger.error('Failed to fetch expense analytics:', error);
		return ApiErrorHandler.databaseError(error, requestId);
	}
}
