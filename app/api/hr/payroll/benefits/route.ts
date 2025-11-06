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
import { createPayrollBenefitSchema } from "@/lib/validation-schemas";
import { db } from "@/lib/db";
import { payrollBenefits } from "@/lib/db/schemas";
import { eq, and } from "drizzle-orm";

/**
 * GET /api/hr/payroll/benefits
 * Get benefits
 */
export async function GET(request: NextRequest) {
	const requestId = generateRequestId();
	try {
		const { userId } = await auth();
		if (!userId) return ApiErrorHandler.unauthorized();

		const { searchParams } = new URL(request.url);
		const organizationId = searchParams.get("organizationId");
		const employeeId = searchParams.get("employeeId");
		const contractorId = searchParams.get("contractorId");

		if (!organizationId) {
			return ApiErrorHandler.badRequest("organizationId is required");
		}

		const conditions = [eq(payrollBenefits.organizationId, organizationId)];
		if (employeeId) {
			conditions.push(eq(payrollBenefits.employeeId, employeeId));
		}
		if (contractorId) {
			conditions.push(eq(payrollBenefits.contractorId, contractorId));
		}

		const benefits = await db
			.select()
			.from(payrollBenefits)
			.where(and(...conditions))
			.orderBy(payrollBenefits.name);

		return NextResponse.json(benefits);
	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}

/**
 * POST /api/hr/payroll/benefits
 * Configure benefits
 */
export async function POST(request: NextRequest) {
	const requestId = generateRequestId();
	try {
		const { userId } = await auth();
		if (!userId) return ApiErrorHandler.unauthorized();

		const body = await request.json();
		const validated = createPayrollBenefitSchema.parse(body);

		const service = new PayrollService();
		const result = await service.configureBenefits(validated.organizationId, validated);
		return NextResponse.json(result);
	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}

