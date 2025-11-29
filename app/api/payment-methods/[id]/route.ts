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

const updatePaymentMethodSchema = z.object({
	name: z.string().min(1).optional(),
	description: z.string().optional(),
	processingFee: z.number().min(0).max(100).optional(),
	fixedFee: z.number().min(0).optional(),
	isDefault: z.boolean().optional(),
	metadata: z.record(z.string(), z.unknown()).optional(),
	notes: z.string().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
	const requestId = generateRequestId();
	const { id } = await params;
	try {
		const { userId } = await auth();
		if (!userId) {
			return ApiErrorHandler.unauthorized();
		}

		const paymentMethod = await PaymentService.getPaymentMethodById(id, userId);

		if (!paymentMethod) {
			return ApiErrorHandler.notFound('Payment method not found');
		}

		return NextResponse.json({ paymentMethod });
	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
	const requestId = generateRequestId();
	const { id } = await params;
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

		const validatedData = updatePaymentMethodSchema.parse(body);

		const paymentMethod = await PaymentService.updatePaymentMethod(id, userId, validatedData);

		return NextResponse.json({ paymentMethod });
	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
	const requestId = generateRequestId();
	const { id } = await params;
	try {
		const { userId } = await auth();
		if (!userId) {
			return ApiErrorHandler.unauthorized();
		}

		await PaymentService.deletePaymentMethod(id, userId);

		return NextResponse.json({ success: true });
	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}
