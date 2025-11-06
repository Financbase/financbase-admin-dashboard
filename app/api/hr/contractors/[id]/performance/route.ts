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
import { ContractorsService } from "@/lib/services/hr/contractors-service";
import { ApiErrorHandler, generateRequestId } from "@/lib/api-error-handler";

/**
 * GET /api/hr/contractors/[id]/performance
 * Get contractor performance metrics
 */
export async function GET(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	const requestId = generateRequestId();
	try {
		const { userId } = await auth();
		if (!userId) return ApiErrorHandler.unauthorized();

		const service = new ContractorsService();
		const performance = await service.getPerformance(params.id);
		return NextResponse.json(performance);
	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}

