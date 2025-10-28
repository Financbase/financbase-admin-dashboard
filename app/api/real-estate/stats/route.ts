import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';

// GET /api/real-estate/stats - Get property portfolio statistics
export async function GET() {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		// Get comprehensive property statistics
		const statsResult = await db.execute(`
			WITH property_stats AS (
				SELECT
					COUNT(*) as total_properties,
					COALESCE(SUM(current_value), 0) as total_value,
					COALESCE(SUM(purchase_price), 0) as total_invested,
					COUNT(CASE WHEN status = 'active' THEN 1 END) as active_properties,
					COUNT(CASE WHEN status = 'vacant' THEN 1 END) as vacant_properties,
					COUNT(CASE WHEN status = 'maintenance' THEN 1 END) as maintenance_properties
				FROM properties
				WHERE user_id = '${userId}' AND is_active = true
			),
			income_stats AS (
				SELECT
					COALESCE(SUM(CASE WHEN income_type = 'rent' AND payment_status = 'received' THEN amount END), 0) as monthly_income,
					COUNT(DISTINCT property_id) as occupied_units
				FROM property_income
				WHERE user_id = '${userId}'
					AND date >= date_trunc('month', CURRENT_DATE)
					AND date < date_trunc('month', CURRENT_DATE + INTERVAL '1 month')
			),
			roi_stats AS (
				SELECT
					AVG(CASE
						WHEN purchase_price > 0 THEN
							((COALESCE(current_value, purchase_price) - purchase_price) / purchase_price) * 100
						ELSE 0
					END) as average_roi
				FROM properties
				WHERE user_id = '${userId}' AND is_active = true AND purchase_price > 0
			)
			SELECT
				ps.total_properties,
				ps.total_value,
				ps.total_invested,
				ps.active_properties,
				ps.vacant_properties,
				ps.maintenance_properties,
				is_.monthly_income,
				is_.occupied_units,
				rs.average_roi,
				CASE
					WHEN ps.total_properties > 0 THEN
						(is_.occupied_units::decimal / ps.total_properties::decimal) * 100
					ELSE 0
				END as occupancy_rate,
				CASE
					WHEN ps.total_invested > 0 THEN
						(is_.monthly_income::decimal / ps.total_invested::decimal) * 12 * 100
					ELSE 0
				END as annual_yield
			FROM property_stats ps
			CROSS JOIN income_stats is_
			CROSS JOIN roi_stats rs
		`);

		if (statsResult.rows.length === 0) {
			return NextResponse.json({
				stats: {
					totalProperties: 0,
					totalValue: 0,
					monthlyIncome: 0,
					occupancyRate: 0,
					averageROI: 0,
					portfolioGrowth: 0
				}
			});
		}

		const row = statsResult.rows[0];
		const stats = {
			totalProperties: Number(row.total_properties),
			totalValue: Number(row.total_value),
			monthlyIncome: Number(row.monthly_income),
			occupancyRate: Number(row.occupancy_rate) || 0,
			averageROI: Number(row.average_roi) || 0,
			portfolioGrowth: Number(row.annual_yield) || 0,
			activeProperties: Number(row.active_properties),
			vacantProperties: Number(row.vacant_properties),
			maintenanceProperties: Number(row.maintenance_properties),
			occupiedUnits: Number(row.occupied_units)
		};

		return NextResponse.json({ stats });

	} catch (error) {
		console.error('Failed to fetch property stats:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch property statistics' },
			{ status: 500 }
		);
	}
}
