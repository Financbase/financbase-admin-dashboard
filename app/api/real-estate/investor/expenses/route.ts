import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';

// GET /api/real-estate/investor/expenses - Get expense analytics
export async function GET(request: NextRequest) {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { searchParams } = new URL(request.url);
		const months = parseInt(searchParams.get('months') || '12');

		// Get expense breakdown by category
		const expenseBreakdownResult = await db.execute(`
			SELECT
				pe.category,
				SUM(pe.amount) as total_amount,
				COUNT(*) as expense_count,
				AVG(pe.amount) as average_amount
			FROM property_expenses pe
			WHERE pe.user_id = '${userId}'
				AND pe.date >= CURRENT_DATE - INTERVAL '${months} months'
			GROUP BY pe.category
			ORDER BY total_amount DESC
		`);

		// Get monthly expense trends
		const monthlyExpensesResult = await db.execute(`
			SELECT
				date_trunc('month', pe.date) as month,
				SUM(pe.amount) as total_expenses
			FROM property_expenses pe
			WHERE pe.user_id = '${userId}'
				AND pe.date >= CURRENT_DATE - INTERVAL '${months} months'
			GROUP BY date_trunc('month', pe.date)
			ORDER BY month
		`);

		// Get top vendors
		const topVendorsResult = await db.execute(`
			SELECT
				pe.vendor,
				SUM(pe.amount) as total_amount,
				COUNT(*) as transaction_count
			FROM property_expenses pe
			WHERE pe.user_id = '${userId}'
				AND pe.vendor IS NOT NULL
				AND pe.date >= CURRENT_DATE - INTERVAL '${months} months'
			GROUP BY pe.vendor
			ORDER BY total_amount DESC
			LIMIT 10
		`);

		const expenseBreakdown = expenseBreakdownResult.rows.map(row => ({
			category: row.category,
			totalAmount: Number(row.total_amount),
			expenseCount: Number(row.expense_count),
			averageAmount: Number(row.average_amount),
		}));

		const monthlyExpenses = monthlyExpensesResult.rows.map(row => ({
			month: row.month,
			totalExpenses: Number(row.total_expenses),
		}));

		const topVendors = topVendorsResult.rows.map(row => ({
			vendor: row.vendor,
			totalAmount: Number(row.total_amount),
			transactionCount: Number(row.transaction_count),
		}));

		return NextResponse.json({
			expenseBreakdown,
			monthlyExpenses,
			topVendors,
		});

	} catch (error) {
		console.error('Failed to fetch expense analytics:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch expense analytics' },
			{ status: 500 }
		);
	}
}
