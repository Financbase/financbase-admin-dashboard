/**
 * Expense Detail API Route
 * Handles single expense operations
 */

import { auth } from '@clerk/nextjs/server';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { ExpenseService } from '@/lib/services/expense-service';

/**
 * GET /api/expenses/[id]
 * Fetch a single expense
 */
export async function GET(
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
		const expense = await ExpenseService.getById(id, userId);

		if (!expense) {
			return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
		}

		return NextResponse.json(expense);
	} catch (error) {
		 
    // eslint-disable-next-line no-console
    console.error('Error fetching expense:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch expense' },
			{ status: 500 }
		);
	}
}

/**
 * PUT /api/expenses/[id]
 * Update an expense
 */
export async function PUT(
	_req: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const { userId } = await auth();

		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { id: idParam } = await params;
		const id = parseInt(idParam, 10);
		const body = await _req.json();

		const expense = await ExpenseService.update({
			id,
			userId,
			...body,
			...(body.amount && { amount: parseFloat(body.amount) }),
			...(body.date && { date: new Date(body.date) }),
		});

		return NextResponse.json(expense);
	} catch (error) {
		 
    // eslint-disable-next-line no-console
    console.error('Error updating expense:', error);
		return NextResponse.json(
			{ error: 'Failed to update expense' },
			{ status: 500 }
		);
	}
}

/**
 * DELETE /api/expenses/[id]
 * Delete an expense
 */
export async function DELETE(
	_req: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const { userId } = await auth();

		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { id: idParam } = await params;
		const id = parseInt(idParam, 10);
		await ExpenseService.delete(id, userId);

		return NextResponse.json({ success: true });
	} catch (error) {
		 
    // eslint-disable-next-line no-console
    console.error('Error deleting expense:', error);
		return NextResponse.json(
			{ error: 'Failed to delete expense' },
			{ status: 500 }
		);
	}
}

