/**
 * Home Testimonials API
 * Returns user testimonials for public home page
 */

/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getTestimonials } from '@/lib/services/home-metrics-service';
import { ApiErrorHandler, generateRequestId } from '@/lib/api-error-handler';

/**
 * @swagger
 * /api/home/testimonials:
 *   get:
 *     summary: Get user testimonials
 *     description: Returns user testimonials for the public home page (no authentication required)
 *     tags:
 *       - Home
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 3
 *         description: Maximum number of testimonials to return
 *     responses:
 *       200:
 *         description: Testimonials retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       role:
 *                         type: string
 *                       company:
 *                         type: string
 *                       avatar:
 *                         type: string
 *                       content:
 *                         type: string
 *                       rating:
 *                         type: number
 *                       metric:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *       500:
 *         description: Internal server error
 */
export async function GET(request: NextRequest) {
	const requestId = generateRequestId();
	try {
		const { searchParams } = new URL(request.url);
		const limit = parseInt(searchParams.get('limit') || '3', 10);

		const testimonials = await getTestimonials(limit);

		return NextResponse.json({
			success: true,
			data: testimonials,
			timestamp: new Date().toISOString(),
		});
	} catch (error) {
		console.error('Error fetching testimonials:', error);
		return ApiErrorHandler.handle(error, requestId);
	}
}

