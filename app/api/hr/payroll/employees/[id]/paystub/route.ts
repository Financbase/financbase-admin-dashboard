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
 * GET /api/hr/payroll/employees/[id]/paystub
 * Generate pay stub for employee (latest entry)
 */
export async function GET(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	const requestId = generateRequestId();
	try {
		const { userId } = await auth();
		if (!userId) return ApiErrorHandler.unauthorized();

		const { searchParams } = new URL(request.url);
		const entryId = searchParams.get("entryId");

		const service = new PayrollService();
		
		// If entryId provided, generate for that specific entry
		if (entryId) {
			const paystub = await service.generatePayStub(entryId);
			return NextResponse.json(paystub);
		}

		// Otherwise, get latest entry for employee
		const history = await service.getEmployeePayrollHistory(params.id, 1);
		if (history.length === 0) {
			return ApiErrorHandler.notFound("No payroll entries found for employee");
		}

		const paystub = await service.generatePayStub(history[0].id);
		return NextResponse.json(paystub);
	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}

