/**
 * Budgets API Routes
 * RESTful endpoints for budget management
 */

/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createBudgetSchema } from '@/lib/validation-schemas';
import { ApiErrorHandler } from '@/lib/api-error-handler';
import {
	createBudget,
	getBudgets,
} from '@/lib/services/budget-service';

/**
 * @swagger
 * /api/budgets:
 *   get:
 *     summary: Get list of budgets
 *     description: Retrieves a paginated list of budgets with optional filtering by category, status, and period type
 *     tags:
 *       - Financial
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter budgets by category
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, archived, paused]
 *         description: Filter budgets by status
 *       - in: query
 *         name: periodType
 *         schema:
 *           type: string
 *           enum: [monthly, yearly]
 *         description: Filter budgets by period type
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Maximum number of budgets to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of budgets to skip
 *     responses:
 *       200:
 *         description: Budgets retrieved successfully
 *       401:
 *         description: Unauthorized - Authentication required
 *       500:
 *         description: Internal server error
 */
export async function GET(req: NextRequest) {
	try {
		const { userId } = await auth();
		if (!userId) {
			return ApiErrorHandler.unauthorized();
		}

		const { searchParams } = new URL(req.url);
		const category = searchParams.get('category');
		const status = searchParams.get('status');
		const periodType = searchParams.get('periodType') as 'monthly' | 'yearly' | null;
		const limit = parseInt(searchParams.get('limit') || '50');
		const offset = parseInt(searchParams.get('offset') || '0');

		const budgets = await getBudgets(userId, {
			category: category || undefined,
			status: status || undefined,
			periodType: periodType || undefined,
			limit,
			offset,
		});

		return NextResponse.json({
			success: true,
			data: budgets,
		});
	} catch (error) {
		return ApiErrorHandler.handle(error);
	}
}

/**
 * @swagger
 * /api/budgets:
 *   post:
 *     summary: Create a new budget
 *     description: Creates a new budget record for the authenticated user
 *     tags:
 *       - Financial
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - category
 *               - budgetedAmount
 *               - periodType
 *               - startDate
 *               - endDate
 *             properties:
 *               name:
 *                 type: string
 *                 example: Marketing Q1 2025
 *               category:
 *                 type: string
 *                 example: Marketing
 *               budgetedAmount:
 *                 type: number
 *                 example: 15000.00
 *               periodType:
 *                 type: string
 *                 enum: [monthly, yearly]
 *                 example: monthly
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Budget created successfully
 *       400:
 *         description: Bad request - Invalid input data
 *       401:
 *         description: Unauthorized - Authentication required
 *       500:
 *         description: Internal server error
 */
export async function POST(req: NextRequest) {
	try {
		const { userId } = await auth();
		if (!userId) {
			return ApiErrorHandler.unauthorized();
		}

		const body = await req.json();
		const validatedData = createBudgetSchema.parse({
			...body,
			userId, // Ensure userId comes from auth, not request body
		});

		// Convert date strings to Date objects
		const budget = await createBudget({
			...validatedData,
			startDate: new Date(validatedData.startDate),
			endDate: new Date(validatedData.endDate),
		});

		return NextResponse.json({
			success: true,
			message: 'Budget created successfully',
			data: budget,
		}, { status: 201 });
	} catch (error) {
		return ApiErrorHandler.handle(error);
	}
}

