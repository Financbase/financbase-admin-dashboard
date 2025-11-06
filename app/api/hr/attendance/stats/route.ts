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
import { AttendanceService } from "@/lib/services/hr/attendance-service";
import { ApiErrorHandler, generateRequestId } from "@/lib/api-error-handler";

/**
 * GET /api/hr/attendance/stats
 * Get attendance statistics
 */
export async function GET(request: NextRequest) {
	const requestId = generateRequestId();
	try {
		const { userId } = await auth();
		if (!userId) return ApiErrorHandler.unauthorized();

		const { searchParams } = new URL(request.url);
		const employeeId = searchParams.get("employeeId") || undefined;
		const contractorId = searchParams.get("contractorId") || undefined;
		const startDate = searchParams.get("startDate") ? new Date(searchParams.get("startDate")!) : undefined;
		const endDate = searchParams.get("endDate") ? new Date(searchParams.get("endDate")!) : undefined;

		if (!employeeId && !contractorId) {
			return ApiErrorHandler.badRequest("Either employeeId or contractorId is required");
		}

		const service = new AttendanceService();
		const stats = await service.getAttendanceStats(employeeId, contractorId, startDate, endDate);
		return NextResponse.json(stats);
	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}

