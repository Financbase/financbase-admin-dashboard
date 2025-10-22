import { type NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { AccountService } from '@/lib/services/account-service';
import { z } from 'zod';

const reconcileSchema = z.object({
	accountId: z.string().min(1, 'Account ID is required'),
	bankBalance: z.number().min(0, 'Bank balance must be positive'),
});

export async function GET() {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const reconciliationStatus = await AccountService.getReconciliationStatus(userId);

		return NextResponse.json({ reconciliationStatus });
	} catch (error) {
		console.error('Error fetching reconciliation status:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch reconciliation status' },
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
		const validatedData = reconcileSchema.parse(body);

		const account = await AccountService.reconcileAccount(
			validatedData.accountId,
			userId,
			validatedData.bankBalance
		);

		return NextResponse.json({ account });
	} catch (error) {
		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{ error: 'Validation error', details: error.errors },
				{ status: 400 }
			);
		}

		console.error('Error reconciling account:', error);
		return NextResponse.json(
			{ error: 'Failed to reconcile account' },
			{ status: 500 }
		);
	}
}
