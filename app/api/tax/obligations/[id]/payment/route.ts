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
import { recordTaxPaymentSchema } from "@/lib/validation-schemas";
import { withRLS } from "@/lib/api/with-rls";
import { createSuccessResponse, type StandardApiResponse } from "@/lib/api/standard-response";

/**
 * POST /api/tax/obligations/[id]/payment
 * Record payment for tax obligation
 */
export async function POST(
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

			const validatedData = recordTaxPaymentSchema.parse({
				...body,
				obligationId: id,
			});

			const service = new TaxService();
			const obligation = await service.recordPayment(validatedData, clerkUserId);

			return createSuccessResponse(obligation, 200, { requestId });
		} catch (error) {
			return ApiErrorHandler.handle(error, requestId) as NextResponse<StandardApiResponse<unknown>>;
		}
	});
}

