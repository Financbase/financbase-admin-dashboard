import { type NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { AccountService } from '@/lib/services/account-service';
import { z } from 'zod';

const createAccountSchema = z.object({
	accountName: z.string().min(1, 'Account name is required'),
	accountType: z.enum(['checking', 'savings', 'credit_card', 'investment', 'loan', 'other']),
	bankName: z.string().optional(),
	accountNumber: z.string().optional(),
	lastFourDigits: z.string().optional(),
	routingNumber: z.string().optional(),
	swiftCode: z.string().optional(),
	iban: z.string().optional(),
	currency: z.string().default('USD'),
	openingBalance: z.number().default(0),
	creditLimit: z.number().optional(),
	interestRate: z.number().optional(),
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
		const page = parseInt(searchParams.get('page') || '1');
		const limit = parseInt(searchParams.get('limit') || '20');
		const search = searchParams.get('search') || undefined;
		const accountType = searchParams.get('accountType') || undefined;
		const status = searchParams.get('status') || undefined;

		const result = await AccountService.getPaginatedAccounts(userId, {
			page,
			limit,
			search,
			accountType,
			status,
		});

		return NextResponse.json(result);
	} catch (error) {
		console.error('Error fetching accounts:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch accounts' },
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
		const validatedData = createAccountSchema.parse(body);

		const account = await AccountService.createAccount({
			...validatedData,
			userId,
		});

		return NextResponse.json({ account }, { status: 201 });
	} catch (error) {
		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{ error: 'Validation error', details: error.errors },
				{ status: 400 }
			);
		}

		console.error('Error creating account:', error);
		return NextResponse.json(
			{ error: 'Failed to create account' },
			{ status: 500 }
		);
	}
}
