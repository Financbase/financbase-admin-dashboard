import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

// Simple database connection using neon directly
async function getDbConnection() {
	const { neon } = await import('@neondatabase/serverless');
	return neon(process.env.DATABASE_URL!);
}

// GET /api/real-estate/buyer/stats - Get buyer statistics
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

		// Get buyer statistics
		const statsResult = await sql`
			SELECT
				COUNT(CASE WHEN status = 'saved' THEN 1 END) as saved_properties,
				COUNT(CASE WHEN status = 'viewed' THEN 1 END) as viewed_properties,
				COUNT(CASE WHEN status = 'offer_submitted' THEN 1 END) as offers_submitted,
				COALESCE(MAX(pre_approved_amount), 0) as pre_approved_amount,
				COALESCE(MAX(monthly_budget), 0) as monthly_budget,
				COALESCE(MAX(down_payment_saved), 0) as down_payment_saved
			FROM buyer_profiles bp
			LEFT JOIN saved_properties sp ON bp.user_id = sp.user_id
			WHERE bp.user_id = ${userId} AND bp.is_active = true
		`;

		if (statsResult.length === 0) {
			return NextResponse.json({
				stats: {
					savedProperties: 0,
					viewedProperties: 0,
					offersSubmitted: 0,
					preApprovedAmount: 0,
					monthlyBudget: 0,
					downPaymentSaved: 0
				}
			});
		}

		const row = statsResult[0];
		const stats = {
			savedProperties: Number(row.saved_properties),
			viewedProperties: Number(row.viewed_properties),
			offersSubmitted: Number(row.offers_submitted),
			preApprovedAmount: Number(row.pre_approved_amount),
			monthlyBudget: Number(row.monthly_budget),
			downPaymentSaved: Number(row.down_payment_saved)
		};

		return NextResponse.json({ stats });

	} catch (error) {
		console.error('Failed to fetch buyer stats:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch buyer statistics' },
			{ status: 500 }
		);
	}
}
