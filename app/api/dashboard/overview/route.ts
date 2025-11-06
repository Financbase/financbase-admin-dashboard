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
import { DashboardService } from '@/lib/services/dashboard-service';
import { ApiErrorHandler, generateRequestId } from '@/lib/api-error-handler';

/**
 * @swagger
 * /api/dashboard/overview:
 *   get:
 *     summary: Get dashboard overview metrics
 *     description: Returns comprehensive dashboard overview data including revenue, expenses, clients, invoices, and net income metrics
 *     tags:
 *       - Dashboard
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard overview data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Dashboard API with real database data works!
 *                 overview:
 *                   type: object
 *                   description: Dashboard metrics and statistics
 *                   properties:
 *                     totalRevenue:
 *                       type: number
 *                       example: 125000.50
 *                     totalExpenses:
 *                       type: number
 *                       example: 45000.25
 *                     netIncome:
 *                       type: number
 *                       example: 80000.25
 *                     totalClients:
 *                       type: number
 *                       example: 45
 *                     activeProjects:
 *                       type: number
 *                       example: 12
 *                 userId:
 *                   type: string
 *                   example: user_123
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: Unauthorized - Authentication required
 *       500:
 *         description: Internal server error
 */
export async function GET(request: Request) {
	const requestId = generateRequestId();
	try {
		// Authenticate user
		const { userId } = await auth();
		if (!userId) {
			return ApiErrorHandler.unauthorized();
		}

		// Get overview data from database
		const overview = await DashboardService.getOverview(userId);

		return NextResponse.json({
			message: 'Dashboard API with real database data works!',
			overview,
			userId,
			timestamp: new Date().toISOString()
		});
	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}
