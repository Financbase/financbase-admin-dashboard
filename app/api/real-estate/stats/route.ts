import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

// Simple database connection using neon directly
async function getDbConnection() {
	const { neon } = await import('@neondatabase/serverless');
	return neon(process.env.DATABASE_URL!);
}

// GET /api/real-estate/stats - Get property portfolio statistics
export async function GET() {
	try {
		// Temporarily disable auth for testing
		// const { userId } = await auth();
		// if (!userId) {
		// 	return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		// }
		
		const userId = 'test-user'; // Mock user ID for testing

		// Get database connection
		const sql = await getDbConnection();

		// Get basic property statistics
		const statsResult = await sql`
			SELECT
				COUNT(*) as total_properties,
				SUM(COALESCE(current_value, 0)) as total_value,
				SUM(COALESCE(purchase_price, 0)) as total_invested,
				COUNT(CASE WHEN status = 'active' THEN 1 END) as active_properties,
				COUNT(CASE WHEN status = 'vacant' THEN 1 END) as vacant_properties,
				COUNT(CASE WHEN status = 'maintenance' THEN 1 END) as maintenance_properties
			FROM properties
			WHERE user_id = ${userId} AND is_active = true
		`;

		if (statsResult.length === 0) {
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

		const row = statsResult[0];
		const stats = {
			totalProperties: Number(row.total_properties),
			totalValue: Number(row.total_value),
			monthlyIncome: 0, // Will be calculated separately
			occupancyRate: 0, // Will be calculated separately
			averageROI: 0, // Will be calculated separately
			portfolioGrowth: 0, // Will be calculated separately
			activeProperties: Number(row.active_properties),
			vacantProperties: Number(row.vacant_properties),
			maintenanceProperties: Number(row.maintenance_properties),
			occupiedUnits: 0 // Will be calculated separately
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
