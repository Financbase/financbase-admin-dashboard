/**
 * Expense Approval API Route
 * Approves an expense
 */

import { auth } from '@clerk/nextjs/server';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { ExpenseService } from '@/lib/services/expense-service';
import { ApiErrorHandler, generateRequestId } from '@/lib/api-error-handler';

/**
 * POST /api/expenses/[id]/approve
 * Approve an expense
 */
export async function POST(
	_req: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	const requestId = generateRequestId();
	const { id: idParam } = await params;
	try {
		const { userId } = await auth();

		if (!userId) {
			return ApiErrorHandler.unauthorized();
		}

		const id = parseInt(idParam, 10);
		if (Number.isNaN(id)) {
			return ApiErrorHandler.badRequest('Invalid expense ID');
		}
		
		// Get the expense to find the owner
		const expense = await ExpenseService.getById(id, userId);
		if (!expense) {
			return ApiErrorHandler.notFound('Expense not found');
		}

		const approved = await ExpenseService.approve(id, userId, expense.userId);

		return NextResponse.json(approved);
	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}

