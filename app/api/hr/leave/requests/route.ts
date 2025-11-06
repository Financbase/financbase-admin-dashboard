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
import { requestLeaveSchema, approveLeaveSchema } from "@/lib/validation-schemas";

/**
 * GET /api/hr/leave/requests
 * List leave requests
 */
export async function GET(request: NextRequest) {
	const requestId = generateRequestId();
	try {
		const { userId } = await auth();
		if (!userId) return ApiErrorHandler.unauthorized();

		const { searchParams } = new URL(request.url);
		const filters: any = {};
		if (searchParams.get("employeeId")) filters.employeeId = searchParams.get("employeeId");
		if (searchParams.get("organizationId")) filters.organizationId = searchParams.get("organizationId");
		if (searchParams.get("status")) filters.status = searchParams.get("status");
		if (searchParams.get("startDate")) filters.startDate = new Date(searchParams.get("startDate")!);
		if (searchParams.get("endDate")) filters.endDate = new Date(searchParams.get("endDate")!);

		const service = new LeaveService();
		const requests = await service.getLeaveRequests(filters);
		return NextResponse.json(requests);
	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}

/**
 * POST /api/hr/leave/requests
 * Submit leave request or approve/reject
 */
export async function POST(request: NextRequest) {
	const requestId = generateRequestId();
	try {
		const { userId } = await auth();
		if (!userId) return ApiErrorHandler.unauthorized();

		const body = await request.json();

		// Check if this is an approval action
		if (body.action === "approve" || body.action === "reject") {
			const validated = approveLeaveSchema.parse({
				requestId: body.requestId,
				approved: body.action === "approve",
				rejectionReason: body.rejectionReason,
			});

			const service = new LeaveService();
			const result = await service.approveLeaveRequest(validated);
			return NextResponse.json(result);
		}

		// Otherwise, submit a new leave request
		const validated = requestLeaveSchema.parse(body);
		const service = new LeaveService();
		const leaveRequest = await service.requestLeave({
			...validated,
			startDate: new Date(validated.startDate),
			endDate: new Date(validated.endDate),
		});
		return NextResponse.json(leaveRequest, { status: 201 });
	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}

