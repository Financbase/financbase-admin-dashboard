/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { NextRequest, NextResponse } from 'next/server';
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

// GET /api/dashboard/top-products - Get top revenue generating services/products
export async function GET(request: NextRequest) {
	const requestId = generateRequestId();
	try {
		const { userId } = await auth();
		if (!userId) {
			return ApiErrorHandler.unauthorized();
		}

		const { searchParams } = new URL(request.url);
		const sortBy = searchParams.get('sortBy') || 'revenue';
		const limit = parseInt(searchParams.get('limit') || '5');

		// Get database connection
		const sql = await getDbConnection();

		// Query invoices and extract items from JSONB to get product/service names
		// We'll aggregate by item description/name from the items JSONB column
		const result = await sql`
			WITH invoice_items AS (
				SELECT 
					i.id,
					i.total,
					i.status,
					jsonb_array_elements(i.items) as item
				FROM financbase_invoices i
				WHERE i.user_id = ${userId}
					AND i.status = 'paid'
					AND i.items IS NOT NULL
					AND jsonb_array_length(i.items) > 0
			),
			product_aggregates AS (
				SELECT
					COALESCE(
						item->>'description',
						item->>'name',
						item->>'service',
						item->>'product',
						'Unspecified Service'
					) as product_name,
					COUNT(*) as sales_count,
					SUM(COALESCE(
						(item->>'amount')::numeric,
						(item->>'price')::numeric,
						(item->>'lineTotal')::numeric,
						(item->>'total')::numeric,
						0
					)) as total_revenue
				FROM invoice_items
				WHERE item IS NOT NULL
				GROUP BY product_name
			)
			SELECT
				product_name as name,
				sales_count::int as sales,
				total_revenue::numeric as revenue
			FROM product_aggregates
			WHERE product_name != 'Unspecified Service'
			ORDER BY
				CASE WHEN ${sortBy} = 'sales' THEN sales_count END DESC,
				CASE WHEN ${sortBy} = 'revenue' THEN total_revenue END DESC,
				CASE WHEN ${sortBy} = 'growth' THEN (sales_count * total_revenue) END DESC
			LIMIT ${limit}
		`;

		// If no results from items, try grouping by invoice notes/description as fallback
		let products = result.map((row: any) => ({
			name: row.name || 'Unspecified Service',
			sales: Number(row.sales) || 0,
			revenue: Number(row.revenue) || 0
		}));

		// If still no results, try a simpler approach - group by invoice total and count
		if (products.length === 0) {
			const fallbackResult = await sql`
				SELECT
					COALESCE(notes, 'General Service') as name,
					COUNT(*)::int as sales,
					SUM(total::numeric) as revenue
				FROM financbase_invoices
				WHERE user_id = ${userId}
					AND status = 'paid'
				GROUP BY notes
				ORDER BY revenue DESC
				LIMIT ${limit}
			`;

			products = fallbackResult.map((row: any) => ({
				name: row.name || 'General Service',
				sales: Number(row.sales) || 0,
				revenue: Number(row.revenue) || 0
			}));
		}

		// Sort products based on sortBy parameter (if not already sorted by SQL)
		if (sortBy === 'growth') {
			products.sort((a, b) => (b.sales * b.revenue) - (a.sales * a.revenue));
		} else if (sortBy === 'sales') {
			products.sort((a, b) => b.sales - a.sales);
		} else {
			// revenue (default)
			products.sort((a, b) => b.revenue - a.revenue);
		}

		// Limit results
		products = products.slice(0, limit);

		return NextResponse.json({ products });

	} catch (error) {
		console.error('Failed to fetch top products:', error);
		return ApiErrorHandler.handle(error, requestId);
	}
}
