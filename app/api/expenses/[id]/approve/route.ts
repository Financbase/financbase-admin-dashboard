/**
 * Expense Approval API Route
 * Approves an expense
 */

import { auth } from '@clerk/nextjs/server';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { ExpenseService } from '@/lib/services/expense-service';

/**
 * POST /api/expenses/[id]/approve
 * Approve an expense
 */
export async function POST(
	_req: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { userId } = await auth();

		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { id: idParam } = await params;
		const id = parseInt(idParam, 10);
		
		// Get the expense to find the owner
		const expense = await ExpenseService.getById(id, userId);
		if (!expense) {
			return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
		}

		const approved = await ExpenseService.approve(id, userId, expense.userId);

		return NextResponse.json(approved);
	} catch (error) {
		 
    // eslint-disable-next-line no-console
    console.error('Error approving expense:', error);
		return NextResponse.json(
			{ error: 'Failed to approve expense' },
			{ status: 500 }
		);
	}
}

