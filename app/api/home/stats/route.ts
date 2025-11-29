/**
 * Home Stats API
 * Returns platform-wide statistics for public home page
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
import { getPlatformStats } from '@/lib/services/home-metrics-service';
import { ApiErrorHandler, generateRequestId } from '@/lib/api-error-handler';
import { logger } from '@/lib/logger';

/**
 * @swagger
 * /api/home/stats:
 *   get:
 *     summary: Get public platform statistics
 *     description: Returns aggregated platform statistics for the public home page (no authentication required)
 *     tags:
 *       - Home
 *     responses:
 *       200:
 *         description: Platform stats retrieved successfully
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
 *                     totalUsers:
 *                       type: number
 *                     totalClients:
 *                       type: number
 *                     totalRevenue:
 *                       type: string
 *                     avgRating:
 *                       type: number
 *                     formatted:
 *                       type: object
 *                       properties:
 *                         users:
 *                           type: string
 *                         clients:
 *                           type: string
 *                         revenue:
 *                           type: string
 *                         rating:
 *                           type: string
 *       500:
 *         description: Internal server error
 */
export async function GET() {
	const requestId = generateRequestId();
	try {
		const stats = await getPlatformStats();

		return NextResponse.json({
			success: true,
			data: stats,
			timestamp: new Date().toISOString(),
		});
	} catch (error) {
		logger.error('Error fetching home stats:', error);
		return ApiErrorHandler.handle(error, requestId);
	}
}

