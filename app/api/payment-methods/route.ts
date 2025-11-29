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

const createPaymentMethodSchema = z.object({
	accountId: z.string().optional(),
	paymentMethodType: z.enum(['stripe', 'paypal', 'square', 'bank_transfer', 'check', 'cash', 'other']),
	name: z.string().min(1, 'Name is required'),
	description: z.string().optional(),
	
	// Stripe fields
	stripePaymentMethodId: z.string().optional(),
	stripeCustomerId: z.string().optional(),
	stripeAccountId: z.string().optional(),
	
	// PayPal fields
	paypalMerchantId: z.string().optional(),
	paypalEmail: z.string().email().optional(),
	
	// Square fields
	squareApplicationId: z.string().optional(),
	squareLocationId: z.string().optional(),
	
	// Bank transfer fields
	bankName: z.string().optional(),
	bankAccountNumber: z.string().optional(),
	bankRoutingNumber: z.string().optional(),
	
	// Configuration
	isDefault: z.boolean().default(false),
	processingFee: z.number().min(0).max(100).optional(),
	fixedFee: z.number().min(0).optional(),
	currency: z.string().default('USD'),
	isTestMode: z.boolean().default(false),
	metadata: z.record(z.string(), z.unknown()).optional(),
	notes: z.string().optional(),
});

export async function GET(request: NextRequest) {
	const requestId = generateRequestId();
	try {
		const { userId } = await auth();
		if (!userId) {
			return ApiErrorHandler.unauthorized();
		}

		const paymentMethods = await PaymentService.getPaymentMethods(userId);

		return NextResponse.json({ paymentMethods });
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

		const validatedData = createPaymentMethodSchema.parse(body);

		const paymentMethod = await PaymentService.createPaymentMethod({
			...validatedData,
			userId,
		});

		return NextResponse.json({ paymentMethod }, { status: 201 });
	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}
