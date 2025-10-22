import { type NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { AccountService } from '@/lib/services/account-service';
import { z } from 'zod';

const updateAccountSchema = z.object({
	accountName: z.string().min(1).optional(),
	accountType: z.enum(['checking', 'savings', 'credit_card', 'investment', 'loan', 'other']).optional(),
	bankName: z.string().optional(),
	accountNumber: z.string().optional(),
	lastFourDigits: z.string().optional(),
	routingNumber: z.string().optional(),
	swiftCode: z.string().optional(),
	iban: z.string().optional(),
	currency: z.string().optional(),
	creditLimit: z.number().optional(),
	interestRate: z.number().optional(),
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

		const account = await AccountService.getAccountById(params.id, userId);

		if (!account) {
			return NextResponse.json({ error: 'Account not found' }, { status: 404 });
		}

		return NextResponse.json({ account });
	} catch (error) {
		console.error('Error fetching account:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch account' },
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
		const validatedData = updateAccountSchema.parse(body);

		const account = await AccountService.updateAccount(params.id, userId, validatedData);

		return NextResponse.json({ account });
	} catch (error) {
		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{ error: 'Validation error', details: error.errors },
				{ status: 400 }
			);
		}

		console.error('Error updating account:', error);
		return NextResponse.json(
			{ error: 'Failed to update account' },
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

		await AccountService.deleteAccount(params.id, userId);

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('Error deleting account:', error);
		return NextResponse.json(
			{ error: 'Failed to delete account' },
			{ status: 500 }
		);
	}
}
