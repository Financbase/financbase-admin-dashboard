/**
 * Expenses API Route
 * Handles expense CRUD operations
 */

import { auth } from '@clerk/nextjs/server';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { ExpenseService } from '@/lib/services/expense-service';

/**
 * GET /api/expenses
 * Fetch all expenses for the authenticated user
 */
export async function GET(req: NextRequest) {
	try {
		const { userId } = await auth();

		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		// Parse query parameters
		const searchParams = req.nextUrl.searchParams;
		const status = searchParams.get('status') || undefined;
		const category = searchParams.get('category') || undefined;
		const billable = searchParams.get('billable') === 'true' ? true : 
		                 searchParams.get('billable') === 'false' ? false : undefined;
		const limitStr = searchParams.get('limit');
		const limit = limitStr ? parseInt(limitStr) : 50;
		const offsetStr = searchParams.get('offset');
		const offset = offsetStr ? parseInt(offsetStr) : 0;

		const startDateStr = searchParams.get('startDate');
		const startDate = startDateStr ? new Date(startDateStr) : undefined;
		const endDateStr = searchParams.get('endDate');
		const endDate = endDateStr ? new Date(endDateStr) : undefined;

		const expenses = await ExpenseService.getAll(userId, {
			status,
			category,
			billable,
			startDate,
			endDate,
			limit,
			offset,
		});

		return NextResponse.json(expenses);
	} catch (error) {
		console.error('Error fetching expenses:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch expenses' },
			{ status: 500 }
		);
	}
}

/**
 * POST /api/expenses
 * Create a new expense
 */
export async function POST(req: NextRequest) {
	try {
		const { userId } = await auth();

		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const body = await req.json();

		// Validate required fields
		if (!body.description || !body.amount || !body.date || !body.category) {
			return NextResponse.json(
				{ error: 'Missing required fields' },
				{ status: 400 }
			);
		}

		const expense = await ExpenseService.create({
			userId,
			description: body.description,
			amount: parseFloat(body.amount),
			date: new Date(body.date),
			category: body.category,
			vendor: body.vendor,
			paymentMethod: body.paymentMethod,
			receiptUrl: body.receiptUrl,
			notes: body.notes,
			taxDeductible: body.taxDeductible,
			billable: body.billable,
			projectId: body.projectId,
			clientId: body.clientId,
			currency: body.currency,
		});

		return NextResponse.json(expense, { status: 201 });
	} catch (error) {
		console.error('Error creating expense:', error);
		return NextResponse.json(
			{ error: 'Failed to create expense' },
			{ status: 500 }
		);
	}
}

