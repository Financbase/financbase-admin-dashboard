/**
 * Billing History API Routes
 * Handles billing history and invoice management
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
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { billingHistory } from '@/lib/db/schemas';
import { eq, desc } from 'drizzle-orm';
import { ApiErrorHandler, generateRequestId } from '@/lib/api-error-handler';

// GET /api/settings/billing/history
// Get user's billing history
export async function GET(request: NextRequest) {
	const requestId = generateRequestId();
	try {
		const { userId } = await auth();

		if (!userId) {
			return ApiErrorHandler.unauthorized();
		}

		const { searchParams } = new URL(request.url);
		const limit = parseInt(searchParams.get('limit') || '20');
		const offset = parseInt(searchParams.get('offset') || '0');

		const history = await db
			.select({
				id: billingHistory.id,
				amount: billingHistory.amount,
				currency: billingHistory.currency,
				status: billingHistory.status,
				description: billingHistory.description,
				invoiceUrl: billingHistory.invoiceUrl,
				stripeInvoiceId: billingHistory.stripeInvoiceId,
				paymentMethod: billingHistory.paymentMethod,
				billedAt: billingHistory.billedAt,
				createdAt: billingHistory.createdAt,
			})
			.from(billingHistory)
			.where(eq(billingHistory.userId, userId))
			.orderBy(desc(billingHistory.createdAt))
			.limit(limit)
			.offset(offset);

		// Get total count for pagination
		const totalCount = await db
			.select({ count: billingHistory.id })
			.from(billingHistory)
			.where(eq(billingHistory.userId, userId));

		return NextResponse.json({
			history,
			pagination: {
				total: totalCount.length,
				limit,
				offset,
			},
		});
	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}
