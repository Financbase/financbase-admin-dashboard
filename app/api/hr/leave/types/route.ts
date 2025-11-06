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
import { createLeaveTypeSchema } from "@/lib/validation-schemas";

/**
 * GET /api/hr/leave/types
 * List leave types
 */
export async function GET(request: NextRequest) {
	const requestId = generateRequestId();
	try {
		const { userId } = await auth();
		if (!userId) return ApiErrorHandler.unauthorized();

		const { searchParams } = new URL(request.url);
		const organizationId = searchParams.get("organizationId");

		if (!organizationId) {
			return ApiErrorHandler.badRequest("organizationId is required");
		}

		const service = new LeaveService();
		const leaveTypes = await service.getLeaveTypes(organizationId);
		return NextResponse.json(leaveTypes);
	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}

/**
 * POST /api/hr/leave/types
 * Create leave type
 */
export async function POST(request: NextRequest) {
	const requestId = generateRequestId();
	try {
		const { userId } = await auth();
		if (!userId) return ApiErrorHandler.unauthorized();

		const body = await request.json();
		const validated = createLeaveTypeSchema.parse(body);

		const service = new LeaveService();
		const leaveType = await service.createLeaveType(validated);
		return NextResponse.json(leaveType, { status: 201 });
	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}

