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
import { EmployeesService } from "@/lib/services/hr/employees-service";
import { ApiErrorHandler, generateRequestId } from "@/lib/api-error-handler";

/**
 * GET /api/employees/[id]/payroll
 * Get payroll summary for employee
 */
export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	const requestId = generateRequestId();
	try {
		const { userId } = await auth();
		if (!userId) return ApiErrorHandler.unauthorized();

		const { id } = await params;
		const { searchParams } = new URL(request.url);
		const limit = parseInt(searchParams.get("limit") || "12");

		const service = new EmployeesService();
		const payroll = await service.getPayrollSummary(id, limit);
		return NextResponse.json(payroll);
	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}

