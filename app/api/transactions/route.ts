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
	amount: z.number().positive('Amount must be positive'),
	currency: z.string().default('USD'),
	description: z.string().optional(),
	category: z.string().optional(),
	paymentMethod: z.string().optional(),
	referenceId: z.string().optional(),
	referenceType: z.string().optional(),
	accountId: z.string().optional(),
	transactionDate: z.string().transform(str => new Date(str)),
	notes: z.string().optional(),
	metadata: z.record(z.unknown()).optional(),
});

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
		const startDate = startDateParam ? new Date(startDateParam) : undefined;
		const endDate = endDateParam ? new Date(endDateParam) : undefined;
		const search = searchParams.get('search') || undefined;
		const limit = parseInt(searchParams.get('limit') || '50', 10);
		const offset = parseInt(searchParams.get('offset') || '0', 10);

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
