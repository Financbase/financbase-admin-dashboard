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
import { TransactionService } from '@/lib/services/transaction-service';
import { z } from 'zod';
import { ApiErrorHandler, generateRequestId } from '@/lib/api-error-handler';

const createTransactionSchema = z.object({
	type: z.enum(['income', 'expense', 'transfer', 'payment']),
	amount: z.union([
		z.number().positive('Amount must be positive'),
		z.string().transform((val) => {
			const num = parseFloat(val);
			if (isNaN(num) || num <= 0) {
				throw new Error('Amount must be a positive number');
			}
			return num;
		})
	]),
	currency: z.string().default('USD'),
	description: z.string().optional(),
	category: z.string().optional(),
	paymentMethod: z.string().optional(),
	referenceId: z.string().optional(),
	referenceType: z.string().optional(),
	accountId: z.string().optional(),
	transactionDate: z.union([
		z.string().transform((str) => {
			const date = new Date(str);
			if (isNaN(date.getTime())) {
				throw new Error('Invalid date format');
			}
			return date;
		}),
		z.date()
	]).default(() => new Date()),
	notes: z.string().optional(),
	metadata: z.record(z.string(), z.unknown()).optional(),
});

/**
 * @swagger
 * /api/transactions:
 *   get:
 *     summary: Get list of transactions
 *     description: Retrieves a paginated list of financial transactions with filtering by type, status, category, and date range
 *     tags:
 *       - Financial
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [income, expense, transfer, payment]
 *         description: Filter transactions by type
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter transactions by status
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter transactions by category
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for filtering (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for filtering (YYYY-MM-DD)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for transaction description
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Maximum number of transactions to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of transactions to skip
 *     responses:
 *       200:
 *         description: Transactions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 transactions:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: trans_123
 *                       type:
 *                         type: string
 *                         enum: [income, expense, transfer, payment]
 *                       amount:
 *                         type: number
 *                         example: 1250.00
 *                       currency:
 *                         type: string
 *                         example: USD
 *                       description:
 *                         type: string
 *                       category:
 *                         type: string
 *                       status:
 *                         type: string
 *                         enum: [pending, completed, failed, cancelled]
 *                       transactionDate:
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
		const { userId } = await auth();
		if (!userId) {
			return ApiErrorHandler.unauthorized();
		}

		const { searchParams } = new URL(request.url);
		const type = searchParams.get('type') as 'income' | 'expense' | 'transfer' | 'payment' | undefined;
		const status = searchParams.get('status') || undefined;
		const category = searchParams.get('category') || undefined;
		const startDateParam = searchParams.get('startDate');
		const endDateParam = searchParams.get('endDate');
		
		// Validate date parameters
		let startDate: Date | undefined;
		let endDate: Date | undefined;
		
		if (startDateParam) {
			startDate = new Date(startDateParam);
			if (isNaN(startDate.getTime())) {
				return ApiErrorHandler.badRequest('Invalid startDate format. Expected valid date string (YYYY-MM-DD).', requestId);
			}
		}
		
		if (endDateParam) {
			endDate = new Date(endDateParam);
			if (isNaN(endDate.getTime())) {
				return ApiErrorHandler.badRequest('Invalid endDate format. Expected valid date string (YYYY-MM-DD).', requestId);
			}
		}
		
		const search = searchParams.get('search') || undefined;
		const limitParam = searchParams.get('limit') || '50';
		const offsetParam = searchParams.get('offset') || '0';
		
		const limit = parseInt(limitParam, 10);
		const offset = parseInt(offsetParam, 10);
		
		if (isNaN(limit) || limit < 1) {
			return ApiErrorHandler.badRequest('Invalid limit parameter. Expected a positive integer.', requestId);
		}
		
		if (isNaN(offset) || offset < 0) {
			return ApiErrorHandler.badRequest('Invalid offset parameter. Expected a non-negative integer.', requestId);
		}

		const transactions = await TransactionService.getAll(userId, {
			type,
			status,
			category,
			startDate,
			endDate,
			search,
			limit,
			offset,
		});

		return NextResponse.json({ transactions });
	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}

/**
 * @swagger
 * /api/transactions:
 *   post:
 *     summary: Create a new transaction
 *     description: Creates a new financial transaction record (income, expense, transfer, or payment)
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
 *               - type
 *               - amount
 *               - transactionDate
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [income, expense, transfer, payment]
 *                 example: expense
 *               amount:
 *                 type: number
 *                 example: 1250.00
 *               currency:
 *                 type: string
 *                 default: USD
 *               description:
 *                 type: string
 *                 example: Monthly subscription payment
 *               category:
 *                 type: string
 *                 example: Software
 *               paymentMethod:
 *                 type: string
 *                 example: credit_card
 *               referenceId:
 *                 type: string
 *               referenceType:
 *                 type: string
 *               accountId:
 *                 type: string
 *               transactionDate:
 *                 type: string
 *                 format: date-time
 *               notes:
 *                 type: string
 *               metadata:
 *                 type: object
 *     responses:
 *       201:
 *         description: Transaction created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 transaction:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: trans_123
 *                     type:
 *                       type: string
 *                     amount:
 *                       type: number
 *       400:
 *         description: Bad request - Invalid input data
 *       401:
 *         description: Unauthorized - Authentication required
 *       500:
 *         description: Internal server error
 */
export async function POST(request: NextRequest) {
	const requestId = generateRequestId();
	try {
		const { userId } = await auth();
		if (!userId) {
			return ApiErrorHandler.unauthorized();
		}

		let body;
		try {
			body = await request.json();
		} catch (error) {
			return ApiErrorHandler.badRequest('Invalid JSON in request body', requestId);
		}

		// Validate and convert amount from string to number if needed
		if (typeof body.amount === 'string') {
			const parsedAmount = parseFloat(body.amount);
			if (isNaN(parsedAmount)) {
				return ApiErrorHandler.badRequest('Invalid amount format. Expected a valid number.', requestId);
			}
			if (parsedAmount <= 0) {
				return ApiErrorHandler.badRequest('Amount must be a positive number.', requestId);
			}
			body.amount = parsedAmount;
		} else if (typeof body.amount !== 'number') {
			return ApiErrorHandler.badRequest('Amount must be a number.', requestId);
		} else if (body.amount <= 0) {
			return ApiErrorHandler.badRequest('Amount must be a positive number.', requestId);
		}
		
		// Validate and ensure transactionDate is provided or use current date
		if (!body.transactionDate) {
			body.transactionDate = new Date().toISOString();
		} else if (body.transactionDate instanceof Date) {
			body.transactionDate = body.transactionDate.toISOString();
		} else if (typeof body.transactionDate === 'string') {
			// Validate the date string before passing to schema
			try {
				const testDate = new Date(body.transactionDate);
				if (isNaN(testDate.getTime())) {
					return ApiErrorHandler.badRequest('Invalid transactionDate format. Expected valid ISO 8601 datetime string or valid date string.', requestId);
				}
			} catch (error) {
				return ApiErrorHandler.badRequest('Invalid transactionDate format. Expected valid ISO 8601 datetime string or valid date string.', requestId);
			}
		}

		const validatedData = createTransactionSchema.parse(body);

		const transaction = await TransactionService.create({
			...validatedData,
			userId,
		});

		return NextResponse.json({ transaction }, { status: 201 });
	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}
