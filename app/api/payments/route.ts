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
