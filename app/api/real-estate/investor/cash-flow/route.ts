import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';

// GET /api/real-estate/investor/cash-flow - Get monthly cash flow data
export async function GET(request: NextRequest) {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { searchParams } = new URL(request.url);
		const months = parseInt(searchParams.get('months') || '12');

		// Get monthly cash flow data for the last N months
		const cashFlowResult = await db.execute(`
			WITH monthly_data AS (
				SELECT
					date_trunc('month', generate_series(
						CURRENT_DATE - INTERVAL '${months} months',
						CURRENT_DATE,
						INTERVAL '1 month'
					)) as month
			),
			income_data AS (
				SELECT
					date_trunc('month', pi.date) as month,
					COALESCE(SUM(pi.amount), 0) as income
				FROM property_income pi
				WHERE pi.user_id = '${userId}'
					AND pi.income_type = 'rent'
					AND pi.payment_status = 'received'
					AND pi.date >= CURRENT_DATE - INTERVAL '${months} months'
				GROUP BY date_trunc('month', pi.date)
			),
			expense_data AS (
				SELECT
					date_trunc('month', pe.date) as month,
					COALESCE(SUM(pe.amount), 0) as expenses
				FROM property_expenses pe
				WHERE pe.user_id = '${userId}'
					AND pe.date >= CURRENT_DATE - INTERVAL '${months} months'
				GROUP BY date_trunc('month', pe.date)
			)
			SELECT
				md.month,
				COALESCE(id.income, 0) as income,
				COALESCE(ed.expenses, 0) as expenses,
				COALESCE(id.income, 0) - COALESCE(ed.expenses, 0) as net_cash_flow
			FROM monthly_data md
			LEFT JOIN income_data id ON md.month = id.month
			LEFT JOIN expense_data ed ON md.month = ed.month
			ORDER BY md.month
		`);

		const cashFlowData = cashFlowResult.rows.map(row => ({
			month: row.month,
			income: Number(row.income),
			expenses: Number(row.expenses),
			netCashFlow: Number(row.net_cash_flow),
		}));

		return NextResponse.json({ cashFlowData });

	} catch (error) {
		console.error('Failed to fetch cash flow data:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch cash flow data' },
			{ status: 500 }
		);
	}
}
