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
 * GET /api/hr/leave/balances/[employeeId]
 * Get leave balance for employee
 */
export async function GET(
	request: NextRequest,
	{ params }: { params: { employeeId: string } }
) {
	const requestId = generateRequestId();
	try {
		const { userId } = await auth();
		if (!userId) return ApiErrorHandler.unauthorized();

		const { searchParams } = new URL(request.url);
		const leaveTypeId = searchParams.get("leaveTypeId") || undefined;

		const service = new LeaveService();
		const balance = await service.getLeaveBalance(params.employeeId, leaveTypeId);
		return NextResponse.json(balance);
	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}

