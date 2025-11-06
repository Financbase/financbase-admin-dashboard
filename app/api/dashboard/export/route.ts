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
import { DashboardService } from '@/lib/services/dashboard-service';
import { ApiErrorHandler, generateRequestId } from '@/lib/api-error-handler';

/**
 * @swagger
 * /api/dashboard/export:
 *   get:
 *     summary: Export dashboard data as CSV
 *     description: Exports dashboard overview metrics and recent activity as a CSV file
 *     tags:
 *       - Dashboard
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: CSV file with dashboard data
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 *               format: binary
 *         headers:
 *           Content-Disposition:
 *             schema:
 *               type: string
 *               example: attachment; filename="dashboard-export-2025-01-XX.csv"
 *       401:
 *         description: Unauthorized - Authentication required
 *       500:
 *         description: Internal server error
 */
/**
 * GET /api/dashboard/export
 * Export dashboard data as CSV
 */
export async function GET(request: NextRequest) {
	const requestId = generateRequestId();
	try {
		// Authenticate user
		const { userId } = await auth();
		if (!userId) {
			return ApiErrorHandler.unauthorized();
		}

		// Get dashboard overview data
		const overview = await DashboardService.getOverview(userId);
		const recentActivity = await DashboardService.getRecentActivity(userId, 100);

		// Convert to CSV format
		const csvRows: string[] = [];
		
		// Add header
		csvRows.push('Dashboard Export');
		csvRows.push(`Generated: ${new Date().toISOString()}`);
		csvRows.push('');
		
		// Add overview metrics
		csvRows.push('Overview Metrics');
		csvRows.push('Metric,Value');
		csvRows.push(`Total Revenue,${overview.totalRevenue || 0}`);
		csvRows.push(`Total Expenses,${overview.totalExpenses || 0}`);
		csvRows.push(`Net Income,${overview.netIncome || 0}`);
		csvRows.push(`Total Clients,${overview.totalClients || 0}`);
		csvRows.push(`Active Projects,${overview.activeProjects || 0}`);
		csvRows.push('');
		
		// Add recent activity
		csvRows.push('Recent Activity');
		csvRows.push('Type,Description,Amount,Date,Status');
		recentActivity.forEach((activity) => {
			const amount = activity.amount ? `$${activity.amount.toFixed(2)}` : '';
			const date = new Date(activity.timestamp).toLocaleDateString();
			csvRows.push(
				`${activity.type},"${activity.description || ''}",${amount},${date},${activity.status || ''}`
			);
		});

		const csvContent = csvRows.join('\n');

		// Return CSV file
		return new NextResponse(csvContent, {
			headers: {
				'Content-Type': 'text/csv',
				'Content-Disposition': `attachment; filename="dashboard-export-${new Date().toISOString().split('T')[0]}.csv"`,
			},
		});
	} catch (error) {
		console.error('Dashboard export error:', error);
		return ApiErrorHandler.handle(error, requestId);
	}
}

