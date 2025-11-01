import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { ApiErrorHandler, generateRequestId } from '@/lib/api-error-handler';

// Simple database connection using neon directly
async function getDbConnection() {
	const { neon } = await import('@neondatabase/serverless');
	if (!process.env.DATABASE_URL) {
		throw new Error('DATABASE_URL is not configured');
	}
	return neon(process.env.DATABASE_URL);
}

// GET /api/real-estate/stats - Get property portfolio statistics
export async function GET() {
	const requestId = generateRequestId();
	try {
		const { userId } = await auth();
		if (!userId) {
			return ApiErrorHandler.unauthorized('Authentication required');
		}

		// Get database connection
		const sql = await getDbConnection();

		// Get basic property statistics with parameterized query
		const statsResult = await sql`
			SELECT
				COUNT(*)::int as total_properties,
				COALESCE(SUM(current_value), 0)::decimal as total_value,
				COALESCE(SUM(purchase_price), 0)::decimal as total_invested,
				COUNT(CASE WHEN status = 'active' THEN 1 END)::int as active_properties,
				COUNT(CASE WHEN status = 'vacant' THEN 1 END)::int as vacant_properties,
				COUNT(CASE WHEN status = 'maintenance' THEN 1 END)::int as maintenance_properties
			FROM properties
			WHERE user_id = ${userId} AND is_active = true
		`;

		if (statsResult.length === 0) {
			return NextResponse.json({
				stats: {
					totalProperties: 0,
					totalPortfolioValue: 0,
					totalInvested: 0,
					monthlyCashFlow: 0,
					occupancyRate: 0,
					averageRoi: 0,
					portfolioGrowth: 0,
					activeProperties: 0,
					vacantProperties: 0,
					maintenanceProperties: 0,
					occupiedUnits: 0
				}
			});
		}

		const row = statsResult[0];
		
		// Get monthly income for cash flow calculation
		const incomeResult = await sql`
			SELECT COALESCE(SUM(amount), 0)::decimal as monthly_income
			FROM property_income
			WHERE user_id = ${userId}
				AND income_type = 'rent'
				AND payment_status = 'received'
				AND date >= date_trunc('month', CURRENT_DATE)
				AND date < date_trunc('month', CURRENT_DATE) + INTERVAL '1 month'
		`;

		// Get monthly expenses
		const expensesResult = await sql`
			SELECT COALESCE(SUM(amount), 0)::decimal as monthly_expenses
			FROM property_expenses
			WHERE user_id = ${userId}
				AND date >= date_trunc('month', CURRENT_DATE)
				AND date < date_trunc('month', CURRENT_DATE) + INTERVAL '1 month'
		`;

		// Get occupancy rate (occupied units / total units)
		const occupancyResult = await sql`
			SELECT
				COUNT(*) FILTER (WHERE is_occupied = true)::int as occupied_units,
				COUNT(*)::int as total_units
			FROM property_units pu
			INNER JOIN properties p ON pu.property_id = p.id
			WHERE p.user_id = ${userId} AND p.is_active = true
		`;

		// Calculate average ROI
		const roiResult = await sql`
			SELECT COALESCE(AVG(roi), 0)::decimal as average_roi
			FROM property_roi
			WHERE user_id = ${userId}
				AND calculation_date >= CURRENT_DATE - INTERVAL '1 year'
		`;

		const monthlyIncome = Number(incomeResult[0]?.monthly_income || 0);
		const monthlyExpenses = Number(expensesResult[0]?.monthly_expenses || 0);
		const occupiedUnits = occupancyResult[0]?.occupied_units || 0;
		const totalUnits = occupancyResult[0]?.total_units || 0;
		const occupancyRate = totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0;
		const averageROI = Number(roiResult[0]?.average_roi || 0);

		const stats = {
			totalProperties: Number(row.total_properties || 0),
			totalPortfolioValue: Number(row.total_value || 0),
			totalInvested: Number(row.total_invested || 0),
			monthlyCashFlow: monthlyIncome - monthlyExpenses,
			monthlyIncome,
			monthlyExpenses,
			occupancyRate: Math.round(occupancyRate * 100) / 100,
			averageRoi: Math.round(averageROI * 100) / 100,
			portfolioGrowth: 0, // Will be calculated based on historical data
			activeProperties: Number(row.active_properties || 0),
			vacantProperties: Number(row.vacant_properties || 0),
			maintenanceProperties: Number(row.maintenance_properties || 0),
			occupiedUnits,
			totalUnits
		};

		return NextResponse.json({ stats });

	} catch (error) {
		console.error('Failed to fetch property stats:', error);
		return ApiErrorHandler.databaseError(error, requestId);
	}
}
