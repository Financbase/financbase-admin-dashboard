/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { TaxService } from "@/lib/services/business/tax-service";
import { ApiErrorHandler, generateRequestId } from "@/lib/api-error-handler";
import { updateTaxDeductionSchema } from "@/lib/validation-schemas";
import { withRLS } from "@/lib/api/with-rls";
import { createSuccessResponse, type StandardApiResponse } from "@/lib/api/standard-response";

/**
 * PATCH /api/tax/deductions/[id]
 * Update tax deduction
 */
export async function PATCH(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	const requestId = generateRequestId();
	return withRLS<StandardApiResponse<unknown>>(async (clerkUserId) => {
		try {
			const { id } = await params;
			let body;
			try {
				body = await request.json();
			} catch (error) {
				return ApiErrorHandler.badRequest("Invalid JSON in request body") as NextResponse<StandardApiResponse<unknown>>;
			}

			const validatedData = updateTaxDeductionSchema.parse({
				...body,
				id,
			});

			const service = new TaxService();
			const deduction = await service.updateDeduction(
				id,
				validatedData,
				clerkUserId
			);

			return createSuccessResponse(deduction, 200, { requestId });
		} catch (error) {
			return ApiErrorHandler.handle(error, requestId) as NextResponse<StandardApiResponse<unknown>>;
		}
	});
}

/**
 * DELETE /api/tax/deductions/[id]
 * Delete tax deduction
 */
export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	const requestId = generateRequestId();
	return withRLS<StandardApiResponse<unknown>>(async (clerkUserId) => {
		try {
			const { id } = await params;
			const service = new TaxService();
			await service.deleteDeduction(id, clerkUserId);

			return createSuccessResponse(
				{ message: "Tax deduction deleted successfully" },
				200,
				{ requestId }
			);
		} catch (error) {
			return ApiErrorHandler.handle(error, requestId) as NextResponse<StandardApiResponse<unknown>>;
		}
	});
}

