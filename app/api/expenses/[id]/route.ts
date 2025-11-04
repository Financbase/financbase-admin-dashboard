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

		const expense = await ExpenseService.getById(id, userId);

		if (!expense) {
			return ApiErrorHandler.notFound('Expense not found');
		}

		return NextResponse.json(expense);
	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}

/**
 * PUT /api/expenses/[id]
 * Update an expense
 */
export async function PUT(
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

		let body;
		try {
			body = await _req.json();
		} catch (error) {
			return ApiErrorHandler.badRequest('Invalid JSON in request body');
		}

		const expense = await ExpenseService.update({
			id,
			userId,
			...body,
			...(body.amount && { amount: parseFloat(body.amount) }),
			...(body.date && { date: new Date(body.date) }),
		});

		return NextResponse.json(expense);
	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}

/**
 * DELETE /api/expenses/[id]
 * Delete an expense
 */
export async function DELETE(
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

		await ExpenseService.delete(id, userId);

		return NextResponse.json({ success: true });
	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}

