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
 * GET /api/hr/attendance/records
 * List attendance records
 */
export async function GET(request: NextRequest) {
	const requestId = generateRequestId();
	try {
		const { userId } = await auth();
		if (!userId) return ApiErrorHandler.unauthorized();

		const { searchParams } = new URL(request.url);
		const filters: any = {};
		if (searchParams.get("employeeId")) filters.employeeId = searchParams.get("employeeId");
		if (searchParams.get("contractorId")) filters.contractorId = searchParams.get("contractorId");
		if (searchParams.get("organizationId")) filters.organizationId = searchParams.get("organizationId");
		if (searchParams.get("status")) filters.status = searchParams.get("status");
		if (searchParams.get("startDate")) filters.startDate = new Date(searchParams.get("startDate")!);
		if (searchParams.get("endDate")) filters.endDate = new Date(searchParams.get("endDate")!);

		const service = new AttendanceService();
		const records = await service.getAttendanceRecords(filters);
		return NextResponse.json(records);
	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}

