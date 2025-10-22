import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { TransactionService } from '@/lib/services/transaction-service';
import { z } from 'zod';

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
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { searchParams } = new URL(request.url);
		const type = searchParams.get('type') as 'income' | 'expense' | 'transfer' | 'payment' | null;
		const status = searchParams.get('status') || undefined;
		const category = searchParams.get('category') || undefined;
		const startDateParam = searchParams.get('startDate');
		const endDateParam = searchParams.get('endDate');
		const startDate = startDateParam ? new Date(startDateParam) : undefined;
		const endDate = endDateParam ? new Date(endDateParam) : undefined;
		const search = searchParams.get('search') || undefined;
		const limit = parseInt(searchParams.get('limit') || '50');
		const offset = parseInt(searchParams.get('offset') || '0');

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
		console.error('Error fetching transactions:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch transactions' },
			{ status: 500 }
		);
	}
}

export async function POST(request: NextRequest) {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const body = await request.json();
		const validatedData = createTransactionSchema.parse(body);

		const transaction = await TransactionService.create({
			...validatedData,
			userId,
		});

		return NextResponse.json({ transaction }, { status: 201 });
	} catch (error) {
		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{ error: 'Validation error', details: error.errors },
				{ status: 400 }
			);
		}

		console.error('Error creating transaction:', error);
		return NextResponse.json(
			{ error: 'Failed to create transaction' },
			{ status: 500 }
		);
	}
}
