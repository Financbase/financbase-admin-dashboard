import { type NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { AccountService } from '@/lib/services/account-service';
import { z } from 'zod';
import { ApiErrorHandler, generateRequestId } from '@/lib/api-error-handler';

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
	metadata: z.record(z.string(), z.unknown()).optional(),
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

		const account = await AccountService.getAccountById(id, userId);

		if (!account) {
			return ApiErrorHandler.notFound('Account not found');
		}

		return NextResponse.json({ account });
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

		const validatedData = updateAccountSchema.parse(body);

		const account = await AccountService.updateAccount(id, userId, validatedData);

		return NextResponse.json({ account });
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

		await AccountService.deleteAccount(id, userId);

		return NextResponse.json({ success: true });
	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}
