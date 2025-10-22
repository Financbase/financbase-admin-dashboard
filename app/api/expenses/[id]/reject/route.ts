/**
 * Expense Rejection API Route
 * Rejects an expense
 */

import { auth } from '@clerk/nextjs/server';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { ExpenseService } from '@/lib/services/expense-service';

/**
 * POST /api/expenses/[id]/reject
 * Reject an expense
 */
export async function POST(
	req: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const { userId } = await auth();

		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const id = parseInt(params.id);
		const body = await req.json();
		const reason = body.reason;

		// Get the expense to find the owner
		const expense = await ExpenseService.getById(id, userId);
		if (!expense) {
			return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
		}

		const rejected = await ExpenseService.reject(id, userId, expense.userId, reason);

		return NextResponse.json(rejected);
	} catch (error) {
		console.error('Error rejecting expense:', error);
		return NextResponse.json(
			{ error: 'Failed to reject expense' },
			{ status: 500 }
		);
	}
}

