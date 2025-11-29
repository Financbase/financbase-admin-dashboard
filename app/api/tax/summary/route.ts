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
import { withRLS } from "@/lib/api/with-rls";
import { createSuccessResponse } from "@/lib/api/standard-response";

/**
 * GET /api/tax/summary
 * Get tax summary, statistics, and alerts
 */
export async function GET(request: NextRequest) {
	const requestId = generateRequestId();
	return withRLS(async (clerkUserId) => {
		try {
			const { searchParams } = new URL(request.url);
			const year = searchParams.get("year")
				? parseInt(searchParams.get("year")!)
				: undefined;

			const service = new TaxService();
			const summary = await service.getTaxSummary(clerkUserId, year);
			const alerts = await service.getTaxAlerts(clerkUserId);

			return createSuccessResponse(
				{
					summary,
					alerts,
				},
				200,
				{ requestId }
			);
		} catch (error) {
			return ApiErrorHandler.handle(error, requestId);
		}
	});
}

