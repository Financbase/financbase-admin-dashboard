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

/**
 * GET /api/tax/obligations
 * Get list of tax obligations with optional filters
 */
export async function GET(request: NextRequest) {
	const requestId = generateRequestId();
	return withRLS(async (clerkUserId) => {
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

			const service = new TaxService();
			const obligations = await service.getObligations(clerkUserId, {
				status: status || undefined,
				year,
				quarter,
				type,
			});

			return NextResponse.json({
				success: true,
				data: obligations,
			});
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
	return withRLS(async (clerkUserId) => {
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

			return NextResponse.json(
				{
					success: true,
					message: "Tax obligation created successfully",
					data: obligation,
				},
				{ status: 201 }
			);
		} catch (error) {
			return ApiErrorHandler.handle(error, requestId);
		}
	});
}

