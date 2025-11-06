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
import { CustomersService } from "@/lib/services/business/customers-service";
import { ApiErrorHandler, generateRequestId } from "@/lib/api-error-handler";

// GET /api/customers/segments - Get customer segments
export async function GET(request: NextRequest) {
	const requestId = generateRequestId();
	try {
		const { userId } = await auth();
		if (!userId) {
			return ApiErrorHandler.unauthorized();
		}

		const service = new CustomersService();
		const segments = await service.getSegments();

		return NextResponse.json(segments);
	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}

