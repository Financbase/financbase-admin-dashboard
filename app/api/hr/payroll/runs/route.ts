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
import { createPayrollRunSchema, processPayrollSchema } from "@/lib/validation-schemas";

/**
 * GET /api/hr/payroll/runs
 * List payroll runs
 */
export async function GET(request: NextRequest) {
	const requestId = generateRequestId();
	try {
		const { userId } = await auth();
		if (!userId) return ApiErrorHandler.unauthorized();

		const { searchParams } = new URL(request.url);
		const organizationId = searchParams.get("organizationId") || undefined;
		const filters: any = {};
		if (searchParams.get("status")) filters.status = searchParams.get("status");
		if (searchParams.get("startDate")) filters.startDate = new Date(searchParams.get("startDate")!);
		if (searchParams.get("endDate")) filters.endDate = new Date(searchParams.get("endDate")!);

		const service = new PayrollService();
		const runs = await service.getPayrollRuns(organizationId, filters);
		return NextResponse.json(runs);
	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}

/**
 * POST /api/hr/payroll/runs
 * Create a new payroll run or process payroll
 */
export async function POST(request: NextRequest) {
	const requestId = generateRequestId();
	try {
		const { userId } = await auth();
		if (!userId) return ApiErrorHandler.unauthorized();

		const body = await request.json();
		
		// Check if this is a process request
		if (body.action === "process") {
			const validated = processPayrollSchema.parse(body);
			const service = new PayrollService();
			const result = await service.processPayrollRun(validated);
			return NextResponse.json(result);
		}

		// Otherwise, create a new payroll run
		const validated = createPayrollRunSchema.parse(body);
		const service = new PayrollService();
		const payrollRun = await service.createPayrollRun({
			...validated,
			payPeriodStart: new Date(validated.payPeriodStart),
			payPeriodEnd: new Date(validated.payPeriodEnd),
			payDate: new Date(validated.payDate),
		});
		return NextResponse.json(payrollRun, { status: 201 });
	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}

