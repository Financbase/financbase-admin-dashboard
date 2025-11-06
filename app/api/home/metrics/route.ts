/**
 * Home Metrics API
 * Returns aggregated platform-wide metrics for public home page
 */

/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { NextResponse } from 'next/server';
import { getHomeMetrics } from '@/lib/services/home-metrics-service';
import { ApiErrorHandler, generateRequestId } from '@/lib/api-error-handler';

/**
 * @swagger
 * /api/home/metrics:
 *   get:
 *     summary: Get public home page metrics
 *     description: Returns aggregated platform-wide metrics for the public home page (no authentication required)
 *     tags:
 *       - Home
 *     responses:
 *       200:
 *         description: Home metrics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     revenue:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: number
 *                         thisMonth:
 *                           type: number
 *                         lastMonth:
 *                           type: number
 *                         growth:
 *                           type: number
 *                         formatted:
 *                           type: string
 *                     efficiency:
 *                       type: object
 *                       properties:
 *                         timeSaved:
 *                           type: number
 *                         change:
 *                           type: number
 *                         formatted:
 *                           type: string
 *                     accuracy:
 *                       type: object
 *                       properties:
 *                         rate:
 *                           type: number
 *                         change:
 *                           type: number
 *                         formatted:
 *                           type: string
 *                     totalUsers:
 *                       type: number
 *                     totalClients:
 *                       type: number
 *                     totalInvoices:
 *                       type: number
 *                     platformUptime:
 *                       type: number
 *       500:
 *         description: Internal server error
 */
export async function GET() {
	const requestId = generateRequestId();
	try {
		const metrics = await getHomeMetrics();

		return NextResponse.json({
			success: true,
			data: metrics,
			timestamp: new Date().toISOString(),
		});
	} catch (error) {
		console.error('Error fetching home metrics:', error);
		return ApiErrorHandler.handle(error, requestId);
	}
}

