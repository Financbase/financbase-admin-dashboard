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
// import { headers } from 'next/headers'; // Temporarily disabled
import { DashboardService } from '@/lib/services/dashboard-service';
import { ApiErrorHandler, generateRequestId } from '@/lib/api-error-handler';

/**
 * @swagger
 * /api/dashboard/recent-activity:
 *   get:
 *     summary: Get recent dashboard activity
 *     description: Returns a list of recent activities including invoices, transactions, and other financial events
 *     tags:
 *       - Dashboard
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Maximum number of activities to return
 *     responses:
 *       200:
 *         description: Recent activities retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 activities:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: activity_123
 *                       type:
 *                         type: string
 *                         enum: [invoice, transaction, expense, payment]
 *                       description:
 *                         type: string
 *                         example: Invoice #123 was paid
 *                       amount:
 *                         type: number
 *                         example: 1250.00
 *                       timestamp:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Unauthorized - Authentication required
 *       500:
 *         description: Internal server error
 */
export async function GET(request: NextRequest) {
	const requestId = generateRequestId();
	try {
		// TEMPORARILY DISABLED FOR TESTING
		// const headersList = await headers();
		const { userId } = await auth();
		if (!userId) {
			return ApiErrorHandler.unauthorized();
		}

		const { searchParams } = new URL(request.url);
		const limit = parseInt(searchParams.get('limit') || '10');

		const activities = await DashboardService.getRecentActivity(userId, limit);

		return NextResponse.json({ activities });
	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}
