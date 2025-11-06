/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { type NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { AccountService } from '@/lib/services/account-service';
import { z } from 'zod';
import { ApiErrorHandler, generateRequestId } from '@/lib/api-error-handler';

const createAccountSchema = z.object({
	accountName: z.string().min(1, 'Account name is required'),
	accountType: z.enum(['checking', 'savings', 'credit_card', 'investment', 'loan', 'other']),
	bankName: z.string().optional(),
	accountNumber: z.string().optional(),
	lastFourDigits: z.string().optional(),
	routingNumber: z.string().optional(),
	swiftCode: z.string().optional(),
	iban: z.string().optional(),
	currency: z.string().default('USD'),
	openingBalance: z.number().default(0),
	creditLimit: z.number().optional(),
	interestRate: z.number().optional(),
	notes: z.string().optional(),
	metadata: z.record(z.unknown()).optional(),
});

/**
 * @swagger
 * /api/accounts:
 *   get:
 *     summary: Get list of financial accounts
 *     description: Retrieves a paginated list of financial accounts (checking, savings, credit cards, etc.) with optional filtering
 *     tags:
 *       - Financial
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for account name or bank name
 *       - in: query
 *         name: accountType
 *         schema:
 *           type: string
 *           enum: [checking, savings, credit_card, investment, loan, other]
 *         description: Filter accounts by type
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, closed, suspended]
 *         description: Filter accounts by status
 *     responses:
 *       200:
 *         description: Accounts retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: account_123
 *                       accountName:
 *                         type: string
 *                         example: Business Checking
 *                       accountType:
 *                         type: string
 *                         enum: [checking, savings, credit_card, investment, loan, other]
 *                       balance:
 *                         type: number
 *                         example: 12500.00
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     pages:
 *                       type: integer
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
		const page = parseInt(searchParams.get('page') || '1');
		const limit = parseInt(searchParams.get('limit') || '20');
		const search = searchParams.get('search') || undefined;
		const accountType = searchParams.get('accountType') || undefined;
		const status = searchParams.get('status') || undefined;

		const result = await AccountService.getPaginatedAccounts(userId, {
			page,
			limit,
			search,
			accountType,
			status,
		});

		return NextResponse.json(result);
	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}

/**
 * @swagger
 * /api/accounts:
 *   post:
 *     summary: Create a new financial account
 *     description: Creates a new financial account (checking, savings, credit card, investment, loan, etc.)
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
 *               - accountName
 *               - accountType
 *             properties:
 *               accountName:
 *                 type: string
 *                 example: Business Checking Account
 *               accountType:
 *                 type: string
 *                 enum: [checking, savings, credit_card, investment, loan, other]
 *                 example: checking
 *               bankName:
 *                 type: string
 *                 example: First National Bank
 *               accountNumber:
 *                 type: string
 *               lastFourDigits:
 *                 type: string
 *                 example: "1234"
 *               routingNumber:
 *                 type: string
 *               currency:
 *                 type: string
 *                 default: USD
 *               openingBalance:
 *                 type: number
 *                 default: 0
 *               creditLimit:
 *                 type: number
 *                 description: Credit limit for credit cards
 *               interestRate:
 *                 type: number
 *                 description: Interest rate for loans or savings
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Account created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 account:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: account_123
 *                     accountName:
 *                       type: string
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
			return ApiErrorHandler.badRequest('Invalid JSON in request body');
		}

		const validatedData = createAccountSchema.parse(body);

		const account = await AccountService.createAccount({
			...validatedData,
			userId,
		});

		return NextResponse.json({ account }, { status: 201 });
	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}
