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
import { LeaveService } from "@/lib/services/hr/leave-service";
import { ApiErrorHandler, generateRequestId } from "@/lib/api-error-handler";

/**
 * GET /api/hr/leave/calendar
 * Get leave calendar view
 */
export async function GET(request: NextRequest) {
	const requestId = generateRequestId();
	try {
		const { userId } = await auth();
		if (!userId) return ApiErrorHandler.unauthorized();

		const { searchParams } = new URL(request.url);
		const organizationId = searchParams.get("organizationId");
		const startDate = searchParams.get("startDate");
		const endDate = searchParams.get("endDate");

		if (!organizationId || !startDate || !endDate) {
			return ApiErrorHandler.badRequest("organizationId, startDate, and endDate are required");
		}

		const service = new LeaveService();
		const calendar = await service.getLeaveCalendar(
			organizationId,
			new Date(startDate),
			new Date(endDate)
		);
		return NextResponse.json(calendar);
	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}

