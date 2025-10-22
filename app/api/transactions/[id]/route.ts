import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { TransactionService } from '@/lib/services/transaction-service';
import { z } from 'zod';

const updateTransactionSchema = z.object({
	type: z.enum(['credit', 'debit']).optional(),
	amount: z.number().positive().optional(),
	currency: z.string().optional(),
	description: z.string().min(1).optional(),
	category: z.string().min(1).optional(),
	paymentMethod: z.string().optional(),
	referenceId: z.string().optional(),
	referenceType: z.string().optional(),
	accountId: z.string().optional(),
	transactionDate: z.string().transform(str => new Date(str)).optional(),
	notes: z.string().optional(),
	metadata: z.record(z.unknown()).optional(),
});

export async function GET(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const transaction = await TransactionService.getById(params.id, userId);
		if (!transaction) {
			return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
		}

		return NextResponse.json({ transaction });
	} catch (error) {
		console.error('Error fetching transaction:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch transaction' },
			{ status: 500 }
		);
	}
}

export async function PUT(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const body = await request.json();
		const validatedData = updateTransactionSchema.parse(body);

		const transaction = await TransactionService.update({
			id: params.id,
			userId,
			...validatedData,
		});

		return NextResponse.json({ transaction });
	} catch (error) {
		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{ error: 'Validation error', details: error.errors },
				{ status: 400 }
			);
		}

		console.error('Error updating transaction:', error);
		return NextResponse.json(
			{ error: 'Failed to update transaction' },
			{ status: 500 }
		);
	}
}

export async function DELETE(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		await TransactionService.delete(params.id, userId);

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('Error deleting transaction:', error);
		return NextResponse.json(
			{ error: 'Failed to delete transaction' },
			{ status: 500 }
		);
	}
}
