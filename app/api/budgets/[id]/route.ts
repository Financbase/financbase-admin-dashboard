/**
 * Individual Budget API Routes
 * GET, PATCH, DELETE operations for a specific budget
 */

/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { updateBudgetSchema } from '@/lib/validation-schemas';
import { ApiErrorHandler } from '@/lib/api-error-handler';
import {
	getBudgetById,
	updateBudget,
	deleteBudget,
} from '@/lib/services/budget-service';

/**
 * GET /api/budgets/[id]
 * Get a single budget by ID with spending details
 */
export async function GET(
	req: NextRequest,
	{ params }: { params: Promise<{ id: string }> | { id: string } }
) {
	try {
		const { userId } = await auth();
		if (!userId) {
			return ApiErrorHandler.unauthorized();
		}

		const resolvedParams = await Promise.resolve(params);
		const id = parseInt(resolvedParams.id);
		if (isNaN(id)) {
			return NextResponse.json(
				{ success: false, error: 'Invalid budget ID' },
				{ status: 400 }
			);
		}

		const budget = await getBudgetById(id, userId);
		if (!budget) {
			return NextResponse.json(
				{ success: false, error: 'Budget not found' },
				{ status: 404 }
			);
		}

		return NextResponse.json({
			success: true,
			data: budget,
		});
	} catch (error) {
		return ApiErrorHandler.handle(error);
	}
}

/**
 * PATCH /api/budgets/[id]
 * Update a budget
 */
export async function PATCH(
	req: NextRequest,
	{ params }: { params: Promise<{ id: string }> | { id: string } }
) {
	try {
		const { userId } = await auth();
		if (!userId) {
			return ApiErrorHandler.unauthorized();
		}

		const resolvedParams = await Promise.resolve(params);
		const id = parseInt(resolvedParams.id);
		if (isNaN(id)) {
			return NextResponse.json(
				{ success: false, error: 'Invalid budget ID' },
				{ status: 400 }
			);
		}

		const body = await req.json();
		const validatedData = updateBudgetSchema.parse({
			...body,
			id,
			userId,
		});

		// Convert date strings to Date objects if provided
		const updateData: any = { ...validatedData };
		if (validatedData.startDate) {
			updateData.startDate = new Date(validatedData.startDate);
		}
		if (validatedData.endDate) {
			updateData.endDate = new Date(validatedData.endDate);
		}

		const budget = await updateBudget(updateData);

		return NextResponse.json({
			success: true,
			message: 'Budget updated successfully',
			data: budget,
		});
	} catch (error) {
		return ApiErrorHandler.handle(error);
	}
}

/**
 * DELETE /api/budgets/[id]
 * Delete (archive) a budget
 */
export async function DELETE(
	req: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const { userId } = await auth();
		if (!userId) {
			return ApiErrorHandler.unauthorized();
		}

		const id = parseInt(params.id);
		if (isNaN(id)) {
			return NextResponse.json(
				{ success: false, error: 'Invalid budget ID' },
				{ status: 400 }
			);
		}

		await deleteBudget(id, userId);

		return NextResponse.json({
			success: true,
			message: 'Budget deleted successfully',
		});
	} catch (error) {
		return ApiErrorHandler.handle(error);
	}
}

