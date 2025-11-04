import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { TransactionService } from '@/lib/services/transaction-service';
import { z } from 'zod';
import { ApiErrorHandler, generateRequestId } from '@/lib/api-error-handler';

const updateTransactionSchema = z.object({
	type: z.enum(['income', 'expense', 'transfer', 'payment']).optional(),
	amount: z.number().positive().optional(),
	currency: z.string().optional(),
	description: z.string().optional().transform(val => val === '' ? undefined : val),
	category: z.string().optional().transform(val => val === '' ? undefined : val),
	paymentMethod: z.string().optional(),
	referenceId: z.string().optional(),
	referenceType: z.string().optional(),
	accountId: z.string().optional(),
	transactionDate: z.string().transform(str => new Date(str)).refine(d => !isNaN(d.getTime()), { message: 'Invalid date' }).optional(),
	notes: z.string().optional(),
	metadata: z.record(z.unknown()).optional(),
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

		const transaction = await TransactionService.getById(id, userId);
		if (!transaction) {
			return ApiErrorHandler.notFound('Transaction not found');
		}

		return NextResponse.json({ transaction });
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
			return ApiErrorHandler.badRequest('Invalid JSON in request body');
		}

		const validatedData = updateTransactionSchema.parse(body);

		const transaction = await TransactionService.update({
			id,
			userId,
			...validatedData,
		});

		return NextResponse.json({ transaction });
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

		await TransactionService.delete(id, userId);

		return NextResponse.json({ success: true });
	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}
