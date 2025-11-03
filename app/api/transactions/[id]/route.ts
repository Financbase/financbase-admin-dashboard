import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { TransactionService } from '@/lib/services/transaction-service';
import { z } from 'zod';

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
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { id } = await params;
		const transaction = await TransactionService.getById(id, userId);
		if (!transaction) {
			return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
		}

		return NextResponse.json({ transaction });
	} catch (error) {
		 
    // eslint-disable-next-line no-console
    console.error('Error fetching transaction:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch transaction' },
			{ status: 500 }
		);
	}
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { id } = await params;
		const body = await request.json();
		const validatedData = updateTransactionSchema.parse(body);

		const transaction = await TransactionService.update({
			id,
			userId,
			...validatedData,
		});

		return NextResponse.json({ transaction });
	} catch (error) {
		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{ error: 'Validation error', details: error.issues },
				{ status: 400 }
			);
		}

		 
    // eslint-disable-next-line no-console
    console.error('Error updating transaction:', error);
		return NextResponse.json(
			{ error: 'Failed to update transaction' },
			{ status: 500 }
		);
	}
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { id } = await params;
		await TransactionService.delete(id, userId);

		return NextResponse.json({ success: true });
	} catch (error) {
		 
    // eslint-disable-next-line no-console
    console.error('Error deleting transaction:', error);
		return NextResponse.json(
			{ error: 'Failed to delete transaction' },
			{ status: 500 }
		);
	}
}
