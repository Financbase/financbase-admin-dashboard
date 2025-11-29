/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { ApiErrorHandler, generateRequestId } from '@/lib/api-error-handler';
import { logger } from '@/lib/logger';

// Simple database connection using neon directly
async function getDbConnection() {
	const { neon } = await import('@neondatabase/serverless');
	if (!process.env.DATABASE_URL) {
		throw new Error('DATABASE_URL is not configured');
	}
	return neon(process.env.DATABASE_URL);
}

// GET /api/real-estate/realtor/stats - Get realtor statistics
export async function GET() {
	const requestId = generateRequestId();
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		// Get database connection
		const sql = await getDbConnection();

		// Get realtor statistics
		const statsResult = await sql`
			SELECT
				COUNT(CASE WHEN status = 'active' THEN 1 END) as active_listings,
				COALESCE(SUM(CASE WHEN status = 'sold' THEN commission_amount END), 0) as total_commissions,
				COALESCE(SUM(CASE WHEN status = 'sold' AND DATE_TRUNC('month', sold_date) = DATE_TRUNC('month', CURRENT_DATE) THEN commission_amount END), 0) as monthly_commissions,
				COALESCE(AVG(CASE WHEN status = 'sold' THEN sold_date - listed_date END), 0) as avg_days_on_market,
				COUNT(CASE WHEN status = 'sold' THEN 1 END)::float / NULLIF(COUNT(*), 0) * 100 as conversion_rate,
				COUNT(CASE WHEN lead_status = 'new' THEN 1 END) as new_leads,
				COUNT(CASE WHEN lead_status = 'scheduled' THEN 1 END) as scheduled_showings,
				COUNT(CASE WHEN lead_status = 'closed' THEN 1 END) as closed_deals
			FROM listings l
			LEFT JOIN leads le ON l.id = le.listing_id
			WHERE l.user_id = ${userId} AND l.is_active = true
		`;

		if (statsResult.length === 0) {
			return NextResponse.json({
				stats: {
					activeListings: 0,
					totalCommissions: 0,
					monthlyCommissions: 0,
					averageDaysOnMarket: 0,
					conversionRate: 0,
					totalLeads: 0,
					newLeads: 0,
					scheduledShowings: 0,
					closedDeals: 0
				}
			});
		}

		const row = statsResult[0];
		const stats = {
			activeListings: Number(row.active_listings),
			totalCommissions: Number(row.total_commissions),
			monthlyCommissions: Number(row.monthly_commissions),
			averageDaysOnMarket: Number(row.avg_days_on_market),
			conversionRate: Number(row.conversion_rate),
			totalLeads: Number(row.new_leads) + Number(row.scheduled_showings) + Number(row.closed_deals),
			newLeads: Number(row.new_leads),
			scheduledShowings: Number(row.scheduled_showings),
			closedDeals: Number(row.closed_deals)
		};

		return NextResponse.json({ stats });

	} catch (error) {
		logger.error('Failed to fetch realtor stats:', error);
		return ApiErrorHandler.databaseError(error, requestId);
	}
}
