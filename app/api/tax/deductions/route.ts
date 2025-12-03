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
import { createTaxDeductionSchema } from "@/lib/validation-schemas";
import { withRLS } from "@/lib/api/with-rls";
import { createSuccessResponse, type StandardApiResponse } from "@/lib/api/standard-response";

/**
 * GET /api/tax/deductions
 * Get list of tax deductions with optional filters
 */
export async function GET(request: NextRequest) {
	const requestId = generateRequestId();
	return withRLS<StandardApiResponse<unknown>>(async (clerkUserId) => {
		try {
			const { searchParams } = new URL(request.url);
			const year = searchParams.get("year")
				? parseInt(searchParams.get("year")!)
				: undefined;
			const category = searchParams.get("category") || undefined;
			
			// Pagination parameters
			const page = searchParams.get("page")
				? parseInt(searchParams.get("page")!)
				: undefined;
			const limit = searchParams.get("limit")
				? parseInt(searchParams.get("limit")!)
				: undefined;
			const offset = page && limit ? (page - 1) * limit : undefined;

			const service = new TaxService();
			const result = await service.getDeductions(clerkUserId, year, {
				category,
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

			// Filter by category if provided and not paginated
			let deductions = Array.isArray(result) ? result : result.data;
			if (category && !limit) {
				deductions = deductions.filter((d) => d.category === category);
			}

			return createSuccessResponse(deductions, 200, { requestId });
		} catch (error) {
			return ApiErrorHandler.handle(error, requestId);
		}
	});
}

/**
 * POST /api/tax/deductions
 * Create new tax deduction
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

			const validatedData = createTaxDeductionSchema.parse({
				...body,
				userId: clerkUserId,
			});

			const service = new TaxService();
			const deduction = await service.createDeduction(validatedData);

			return createSuccessResponse(deduction, 201, { requestId });
		} catch (error) {
			return ApiErrorHandler.handle(error, requestId);
		}
	});
}

