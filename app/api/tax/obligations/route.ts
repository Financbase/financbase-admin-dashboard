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
import { createTaxObligationSchema } from "@/lib/validation-schemas";
import { withRLS } from "@/lib/api/with-rls";
import { createSuccessResponse, type StandardApiResponse } from "@/lib/api/standard-response";

/**
 * GET /api/tax/obligations
 * Get list of tax obligations with optional filters
 */
export async function GET(request: NextRequest) {
	const requestId = generateRequestId();
	return withRLS<StandardApiResponse<unknown>>(async (clerkUserId) => {
		try {
			const { searchParams } = new URL(request.url);
			const status = searchParams.get("status") as
				| "pending"
				| "paid"
				| "overdue"
				| "cancelled"
				| null;
			const year = searchParams.get("year")
				? parseInt(searchParams.get("year")!)
				: undefined;
			const quarter = searchParams.get("quarter") || undefined;
			const type = searchParams.get("type") || undefined;
			
			// Pagination parameters
			const page = searchParams.get("page")
				? parseInt(searchParams.get("page")!)
				: undefined;
			const limit = searchParams.get("limit")
				? parseInt(searchParams.get("limit")!)
				: undefined;
			const offset = page && limit ? (page - 1) * limit : undefined;

			const service = new TaxService();
			const result = await service.getObligations(clerkUserId, {
				status: status || undefined,
				year,
				quarter,
				type,
				limit,
				offset,
			});

			// Check if result is paginated
			if (limit !== undefined && "data" in result) {
				return createSuccessResponse(
					result.data,
					200,
					{
						requestId,
						pagination: {
							page: result.page,
							limit: result.limit,
							total: result.total,
							totalPages: result.totalPages,
						},
					}
				);
			}

			return createSuccessResponse(result, 200, { requestId });
		} catch (error) {
			return ApiErrorHandler.handle(error, requestId);
		}
	});
}

/**
 * POST /api/tax/obligations
 * Create new tax obligation
 */
export async function POST(request: NextRequest) {
	const requestId = generateRequestId();
	return withRLS<StandardApiResponse<unknown>>(async (clerkUserId) => {
		try {
			let body;
			try {
				body = await request.json();
			} catch (error) {
				return ApiErrorHandler.badRequest("Invalid JSON in request body");
			}

			const validatedData = createTaxObligationSchema.parse({
				...body,
				userId: clerkUserId,
			});

			const service = new TaxService();
			const obligation = await service.createObligation(validatedData);

			return createSuccessResponse(
				obligation,
				201,
				{ requestId }
			);
		} catch (error) {
			return ApiErrorHandler.handle(error, requestId);
		}
	});
}

