/**
 * Expenses API Route
 * Handles expense CRUD operations
 */

import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
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
		const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50;
		const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0;

		const startDate = searchParams.get('startDate') 
			? new Date(searchParams.get('startDate')!) 
			: undefined;
		const endDate = searchParams.get('endDate') 
			? new Date(searchParams.get('endDate')!) 
			: undefined;

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

