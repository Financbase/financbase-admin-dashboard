/**
 * Expense Categories API Route
 * Manages expense categories
 */

import { auth } from '@clerk/nextjs/server';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { ExpenseService } from '@/lib/services/expense-service';

/**
 * GET /api/expenses/categories
 * Get all expense categories
 */
export async function GET() {
	try {
		const { userId } = await auth();

		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const categories = await ExpenseService.getCategories(userId);

		return NextResponse.json(categories);
	} catch (error) {
		console.error('Error fetching categories:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch categories' },
			{ status: 500 }
		);
	}
}

/**
 * POST /api/expenses/categories
 * Create a new category
 */
export async function POST(req: NextRequest) {
	try {
		const { userId } = await auth();

		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const body = await req.json();

		if (!body.name) {
			return NextResponse.json(
				{ error: 'Category name is required' },
				{ status: 400 }
			);
		}

		const category = await ExpenseService.createCategory(userId, body.name, {
			description: body.description,
			color: body.color,
			monthlyBudget: body.monthlyBudget ? parseFloat(body.monthlyBudget) : undefined,
			taxDeductible: body.taxDeductible,
			requiresApproval: body.requiresApproval,
		});

		return NextResponse.json(category, { status: 201 });
	} catch (error) {
		console.error('Error creating category:', error);
		return NextResponse.json(
			{ error: 'Failed to create category' },
			{ status: 500 }
		);
	}
}

