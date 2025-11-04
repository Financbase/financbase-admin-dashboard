/**
 * Payment Methods API Routes
 * Handles payment method management
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { userPaymentMethods } from '@/lib/db/schemas';
import { eq, desc } from 'drizzle-orm';
import { ApiErrorHandler, generateRequestId } from '@/lib/api-error-handler';

// GET /api/settings/billing/payment-methods
// Get user's payment methods
export async function GET() {
	const requestId = generateRequestId();
	try {
		const { userId } = await auth();

		if (!userId) {
			return ApiErrorHandler.unauthorized();
		}

		const paymentMethods = await db
			.select({
				id: userPaymentMethods.id,
				type: userPaymentMethods.type,
				stripePaymentMethodId: userPaymentMethods.stripePaymentMethodId,
				last4: userPaymentMethods.last4,
				brand: userPaymentMethods.brand,
				expiryMonth: userPaymentMethods.expiryMonth,
				expiryYear: userPaymentMethods.expiryYear,
				isDefault: userPaymentMethods.isDefault,
				status: userPaymentMethods.status,
				createdAt: userPaymentMethods.createdAt,
				updatedAt: userPaymentMethods.updatedAt,
			})
			.from(userPaymentMethods)
			.where(eq(userPaymentMethods.userId, userId))
			.orderBy(desc(userPaymentMethods.isDefault), desc(userPaymentMethods.createdAt));

		return NextResponse.json({ paymentMethods });
	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}

// POST /api/settings/billing/payment-methods
// Add a new payment method
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

		const {
			type,
			stripePaymentMethodId,
			last4,
			brand,
			expiryMonth,
			expiryYear,
			isDefault,
			metadata
		} = body;

		if (!type || !stripePaymentMethodId) {
			return ApiErrorHandler.badRequest('Type and Stripe payment method ID are required');
		}

		// If this is set as default, unset other defaults
		if (isDefault) {
			await db
				.update(userPaymentMethods)
				.set({ isDefault: false })
				.where(eq(userPaymentMethods.userId, userId));
		}

		const newPaymentMethod = await db
			.insert(userPaymentMethods)
			.values({
				userId,
				type,
				stripePaymentMethodId,
				last4,
				brand,
				expiryMonth,
				expiryYear,
				isDefault: isDefault || false,
				status: 'active',
				metadata: metadata || {},
			})
			.returning({
				id: userPaymentMethods.id,
				type: userPaymentMethods.type,
				last4: userPaymentMethods.last4,
				brand: userPaymentMethods.brand,
				expiryMonth: userPaymentMethods.expiryMonth,
				expiryYear: userPaymentMethods.expiryYear,
				isDefault: userPaymentMethods.isDefault,
				status: userPaymentMethods.status,
				createdAt: userPaymentMethods.createdAt,
			});

		return NextResponse.json({ paymentMethod: newPaymentMethod[0] });
	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}
