import { type NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { AccountService } from '@/lib/services/account-service';
import { z } from 'zod';
import { ApiErrorHandler, generateRequestId } from '@/lib/api-error-handler';

const reconcileSchema = z.object({
	accountId: z.string().min(1, 'Account ID is required'),
	bankBalance: z.number().min(0, 'Bank balance must be positive'),
});

export async function GET() {
	const requestId = generateRequestId();
	try {
		const { userId } = await auth();
		if (!userId) {
			return ApiErrorHandler.unauthorized();
		}

		const reconciliationStatus = await AccountService.getReconciliationStatus(userId);

		return NextResponse.json({ reconciliationStatus });
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

		const validatedData = reconcileSchema.parse(body);

		const account = await AccountService.reconcileAccount(
			validatedData.accountId,
			userId,
			validatedData.bankBalance
		);

		return NextResponse.json({ account });
	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}
