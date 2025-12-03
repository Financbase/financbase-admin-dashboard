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
import { updateTaxObligationSchema } from "@/lib/validation-schemas";
import { withRLS } from "@/lib/api/with-rls";
import { createSuccessResponse, type StandardApiResponse } from "@/lib/api/standard-response";

/**
 * GET /api/tax/obligations/[id]
 * Get single tax obligation by ID
 */
export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	const requestId = generateRequestId();
	return withRLS<StandardApiResponse<unknown>>(async (clerkUserId) => {
		try {
			const { id } = await params;
			const service = new TaxService();
			const obligation = await service.getObligationById(id, clerkUserId);

			return createSuccessResponse(obligation, 200, { requestId });
		} catch (error) {
			return ApiErrorHandler.handle(error, requestId);
		}
	});
}

/**
 * PATCH /api/tax/obligations/[id]
 * Update tax obligation
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
				return ApiErrorHandler.badRequest("Invalid JSON in request body");
			}

			const validatedData = updateTaxObligationSchema.parse({
				...body,
				id,
			});

			const service = new TaxService();
			const obligation = await service.updateObligation(
				id,
				validatedData,
				clerkUserId
			);

			return createSuccessResponse(obligation, 200, { requestId });
		} catch (error) {
			return ApiErrorHandler.handle(error, requestId);
		}
	});
}

/**
 * DELETE /api/tax/obligations/[id]
 * Delete tax obligation
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
			await service.deleteObligation(id, clerkUserId);

			return createSuccessResponse(
				{ message: "Tax obligation deleted successfully" },
				200,
				{ requestId }
			);
		} catch (error) {
			return ApiErrorHandler.handle(error, requestId);
		}
	});
}

