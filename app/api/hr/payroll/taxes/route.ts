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
import { createPayrollTaxSchema } from "@/lib/validation-schemas";
import { db } from "@/lib/db";
import { payrollTaxes } from "@/lib/db/schemas";
import { eq } from "drizzle-orm";

/**
 * GET /api/hr/payroll/taxes
 * Get tax configuration
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

		const taxes = await db
			.select()
			.from(payrollTaxes)
			.where(eq(payrollTaxes.organizationId, organizationId))
			.orderBy(payrollTaxes.name);

		return NextResponse.json(taxes);
	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}

/**
 * POST /api/hr/payroll/taxes
 * Configure taxes
 */
export async function POST(request: NextRequest) {
	const requestId = generateRequestId();
	try {
		const { userId } = await auth();
		if (!userId) return ApiErrorHandler.unauthorized();

		const body = await request.json();
		const validated = createPayrollTaxSchema.parse(body);

		const service = new PayrollService();
		const result = await service.configureTaxes(validated.organizationId, validated);
		return NextResponse.json(result);
	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}

