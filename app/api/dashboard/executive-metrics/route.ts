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
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
	const requestId = generateRequestId();
	try {
		const { userId } = await auth();
		if (!userId) {
			return ApiErrorHandler.unauthorized();
		}

		// Get query parameters
		const { searchParams } = new URL(request.url);
		const period = searchParams.get('period') || '30d';

		// Calculate date range
		const now = new Date();
		let startDate: Date;
		switch (period) {
			case '7d':
				startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
				break;
			case '90d':
				startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
				break;
			default: // 30d
				startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
		}

		// Previous period for comparison
		const periodDays = Math.floor((now.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));
		const prevStartDate = new Date(startDate.getTime() - periodDays * 24 * 60 * 60 * 1000);
		const prevEndDate = startDate;

		// Get total revenue (from paid invoices)
		const revenueResult = await db.execute(sql`
			SELECT COALESCE(SUM(total::numeric), 0) as total_revenue
			FROM financbase_invoices
			WHERE user_id = ${userId} AND status = 'paid' AND paid_date >= ${startDate}
		`);
		const totalRevenue = Number(revenueResult.rows[0]?.total_revenue || 0);

		// Previous period revenue
		const prevRevenueResult = await db.execute(sql`
			SELECT COALESCE(SUM(total::numeric), 0) as total_revenue
			FROM financbase_invoices
			WHERE user_id = ${userId} AND status = 'paid' 
				AND paid_date >= ${prevStartDate} AND paid_date < ${prevEndDate}
		`);
		const prevRevenue = Number(prevRevenueResult.rows[0]?.total_revenue || 0);
		const revenueChange = prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : 0;

		// Get invoice count (orders)
		const invoiceResult = await db.execute(sql`
			SELECT COUNT(*) as invoice_count
			FROM financbase_invoices
			WHERE user_id = ${userId} AND issue_date >= ${startDate}
		`);
		const totalOrders = Number(invoiceResult.rows[0]?.invoice_count || 0);

		// Previous period orders
		const prevInvoiceResult = await db.execute(sql`
			SELECT COUNT(*) as invoice_count
			FROM financbase_invoices
			WHERE user_id = ${userId} 
				AND issue_date >= ${prevStartDate} AND issue_date < ${prevEndDate}
		`);
		const prevOrders = Number(prevInvoiceResult.rows[0]?.invoice_count || 0);
		const ordersChange = prevOrders > 0 ? ((totalOrders - prevOrders) / prevOrders) * 100 : 0;

		// Get average invoice value
		const avgInvoiceResult = await db.execute(sql`
			SELECT COALESCE(AVG(total::numeric), 0) as avg_invoice_value
			FROM financbase_invoices
			WHERE user_id = ${userId} AND issue_date >= ${startDate}
		`);
		const avgOrderValue = Number(avgInvoiceResult.rows[0]?.avg_invoice_value || 0);

		// Get client count (users)
		const clientResult = await db.execute(sql`
			SELECT COUNT(*) as client_count
			FROM financbase_clients
			WHERE user_id = ${userId}
		`);
		const totalUsers = Number(clientResult.rows[0]?.client_count || 0);

		// Previous period clients (estimate based on invoices)
		const prevClientResult = await db.execute(sql`
			SELECT COUNT(DISTINCT client_id) as client_count
			FROM financbase_invoices
			WHERE user_id = ${userId}
				AND issue_date >= ${prevStartDate} AND issue_date < ${prevEndDate}
				AND client_id IS NOT NULL
		`);
		const prevUsers = Number(prevClientResult.rows[0]?.client_count || 0);
		const usersChange = prevUsers > 0 ? ((totalUsers - prevUsers) / prevUsers) * 100 : 0;

		// Calculate conversion rate (paid invoices / total invoices)
		const conversionResult = await db.execute(sql`
			SELECT 
				COUNT(*) as total_invoices,
				COUNT(CASE WHEN status = 'paid' THEN 1 END) as paid_invoices
			FROM financbase_invoices
			WHERE user_id = ${userId} AND issue_date >= ${startDate}
		`);
		const totalInvoices = Number(conversionResult.rows[0]?.total_invoices || 0);
		const paidInvoices = Number(conversionResult.rows[0]?.paid_invoices || 0);
		const conversionRate = totalInvoices > 0 ? (paidInvoices / totalInvoices) * 100 : 0;

		// Get top products (using existing endpoint logic)
		const topProductsResponse = await fetch(`${request.nextUrl.origin}/api/dashboard/top-products?limit=4&sortBy=revenue`, {
			headers: {
				Cookie: request.headers.get('cookie') || '',
			},
		});
		let topProducts = [];
		if (topProductsResponse.ok) {
			const topProductsData = await topProductsResponse.json();
			topProducts = (topProductsData.products || []).map((p: any) => ({
				name: p.name,
				sales: p.sales || 0,
				revenue: Math.round(p.revenue || 0),
			}));
		}

		// Get user growth trends (last 5 months)
		const userGrowthResult = await db.execute(sql`
			SELECT 
				TO_CHAR(created_at, 'YYYY-MM') as month,
				COUNT(*) as new_clients
			FROM financbase_clients
			WHERE user_id = ${userId}
				AND created_at >= ${new Date(now.getTime() - 5 * 30 * 24 * 60 * 60 * 1000)}
			GROUP BY TO_CHAR(created_at, 'YYYY-MM')
			ORDER BY month ASC
		`);

		// Calculate cumulative users per month
		let cumulativeUsers = totalUsers;
		const userGrowth = Array.from({ length: 5 }, (_, i) => {
			const date = new Date();
			date.setMonth(date.getMonth() - (4 - i));
			const monthStr = date.toLocaleDateString('en-US', { month: 'short' });
			
			// Find new clients for this month
			const monthData = (userGrowthResult.rows as any[]).find(
				(r) => r.month === `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
			);
			const newUsers = Number(monthData?.new_clients || 0);
			cumulativeUsers -= newUsers; // Subtract to get starting count
			const users = cumulativeUsers;
			cumulativeUsers += newUsers; // Add back for next iteration

			return {
				month: monthStr,
				users: Math.max(0, users),
				newUsers,
			};
		});

		// Get revenue by category (simplified - using invoice items)
		const revenueByCategoryResult = await db.execute(sql`
			SELECT 
				COALESCE(notes, 'General') as category,
				SUM(total::numeric) as revenue,
				COUNT(*) as count
			FROM financbase_invoices
			WHERE user_id = ${userId} 
				AND status = 'paid'
				AND paid_date >= ${startDate}
			GROUP BY notes
			ORDER BY revenue DESC
			LIMIT 3
		`);

		const totalCategoryRevenue = revenueByCategoryResult.rows.reduce(
			(sum: number, row: any) => sum + Number(row.revenue || 0),
			0
		);

		const revenueByCategory = (revenueByCategoryResult.rows as any[]).map((row) => ({
			category: row.category || 'General',
			revenue: Math.round(Number(row.revenue || 0)),
			percentage: totalCategoryRevenue > 0 
				? Math.round((Number(row.revenue || 0) / totalCategoryRevenue) * 100)
				: 0,
		}));

		// Get recent activity (from invoices and transactions)
		const recentActivityResult = await db.execute(sql`
			SELECT 
				'invoice' as type,
				invoice_number as description,
				status,
				created_at as timestamp
			FROM financbase_invoices
			WHERE user_id = ${userId}
				AND created_at >= ${startDate}
			UNION ALL
			SELECT 
				'transaction' as type,
				description,
				status,
				transaction_date as timestamp
			FROM transactions
			WHERE user_id::text = ${userId}
				AND transaction_date >= ${startDate}
			ORDER BY timestamp DESC
			LIMIT 10
		`);

		const recentActivity = (recentActivityResult.rows as any[]).map((row, index) => {
			const timestamp = new Date(row.timestamp);
			const now = new Date();
			const diffMs = now.getTime() - timestamp.getTime();
			const diffMins = Math.floor(diffMs / (1000 * 60));
			const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

			let timeAgo: string;
			if (diffMins < 60) {
				timeAgo = `${diffMins} minutes ago`;
			} else if (diffHours < 24) {
				timeAgo = `${diffHours} hours ago`;
			} else {
				timeAgo = `${Math.floor(diffHours / 24)} days ago`;
			}

			return {
				id: String(index + 1),
				type: row.type === 'invoice' ? 'order' : 'transaction',
				description: row.description || 'Activity',
				timestamp: timeAgo,
				status: row.status === 'paid' || row.status === 'completed' ? 'success' : 'info',
			};
		});

		return NextResponse.json({
			totalRevenue: Math.round(totalRevenue),
			revenueChange: parseFloat(revenueChange.toFixed(1)),
			totalUsers,
			usersChange: parseFloat(usersChange.toFixed(1)),
			totalOrders,
			ordersChange: parseFloat(ordersChange.toFixed(1)),
			conversionRate: parseFloat(conversionRate.toFixed(1)),
			avgOrderValue: parseFloat(avgOrderValue.toFixed(2)),
			topProducts,
			userGrowth,
			revenueByCategory,
			recentActivity,
		});
	} catch (error) {
		logger.error('Executive metrics API error:', error);
		return ApiErrorHandler.handle(error, requestId);
	}
}

