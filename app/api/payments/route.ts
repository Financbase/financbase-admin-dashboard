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
import { PaymentService } from '@/lib/services/payment-service';
import { z } from 'zod';
import { ApiErrorHandler, generateRequestId } from '@/lib/api-error-handler';

const processPaymentSchema = z.object({
	paymentMethodId: z.string().min(1, 'Payment method ID is required'),
	invoiceId: z.string().optional(),
	paymentType: z.enum(['invoice_payment', 'refund', 'chargeback', 'adjustment', 'transfer']),
	amount: z.number().min(0.01, 'Amount must be greater than 0'),
	currency: z.string().default('USD'),
	description: z.string().optional(),
	reference: z.string().optional(),
	metadata: z.record(z.unknown()).optional(),
	notes: z.string().optional(),
});

/**
 * @swagger
 * /api/payments:
 *   get:
 *     summary: Get list of payments
 *     description: Retrieves a paginated list of payments with optional filtering by status, payment method, and date range
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
 *         description: Search term for payment reference or description
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, processing, completed, failed, cancelled, refunded, partially_refunded]
 *         description: Filter payments by status
 *       - in: query
 *         name: paymentMethodId
 *         schema:
 *           type: string
 *         description: Filter payments by payment method ID
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
 *     responses:
 *       200:
 *         description: Payments retrieved successfully
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
 *                         example: payment_123
 *                       amount:
 *                         type: number
 *                         example: 1250.00
 *                       status:
 *                         type: string
 *                         enum: [pending, processing, completed, failed, cancelled, refunded, partially_refunded]
 *                       paymentType:
 *                         type: string
 *                         enum: [invoice_payment, refund, chargeback, adjustment, transfer]
 *                 pagination:
 *                   type: object
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
		const status = searchParams.get('status') || undefined;
		const paymentMethodId = searchParams.get('paymentMethodId') || undefined;
		const startDate = searchParams.get('startDate') || undefined;
		const endDate = searchParams.get('endDate') || undefined;

		const result = await PaymentService.getPaginatedPayments(userId, {
			page,
			limit,
			search,
			status,
			paymentMethodId,
			startDate,
			endDate,
		});

		return NextResponse.json(result);
	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}

/**
 * @swagger
 * /api/payments:
 *   post:
 *     summary: Process a payment
 *     description: Processes a payment transaction (invoice payment, refund, chargeback, adjustment, or transfer)
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
 *               - paymentMethodId
 *               - paymentType
 *               - amount
 *             properties:
 *               paymentMethodId:
 *                 type: string
 *                 example: pm_123
 *                 description: ID of the payment method to use
 *               invoiceId:
 *                 type: string
 *                 description: Optional invoice ID if this is an invoice payment
 *               paymentType:
 *                 type: string
 *                 enum: [invoice_payment, refund, chargeback, adjustment, transfer]
 *                 example: invoice_payment
 *               amount:
 *                 type: number
 *                 example: 1250.00
 *               currency:
 *                 type: string
 *                 default: USD
 *               description:
 *                 type: string
 *                 example: Payment for invoice #123
 *               reference:
 *                 type: string
 *               notes:
 *                 type: string
 *               metadata:
 *                 type: object
 *     responses:
 *       201:
 *         description: Payment processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 payment:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: payment_123
 *                     amount:
 *                       type: number
 *                     status:
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

		const validatedData = processPaymentSchema.parse(body);

		const payment = await PaymentService.processPayment({
			...validatedData,
			userId,
		});

		return NextResponse.json({ payment }, { status: 201 });
	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}
