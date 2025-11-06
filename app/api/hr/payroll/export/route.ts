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
import { PayrollService } from "@/lib/services/hr/payroll-service";
import { ApiErrorHandler, generateRequestId } from "@/lib/api-error-handler";

/**
 * POST /api/hr/payroll/export
 * Export payroll data
 */
export async function POST(request: NextRequest) {
	const requestId = generateRequestId();
	try {
		const { userId } = await auth();
		if (!userId) return ApiErrorHandler.unauthorized();

		const body = await request.json();
		const { payrollRunId, format = "csv" } = body;

		if (!payrollRunId) {
			return ApiErrorHandler.badRequest("payrollRunId is required");
		}

		const service = new PayrollService();
		const exportData = await service.exportPayroll(payrollRunId, format);
		return NextResponse.json(exportData);
	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}

