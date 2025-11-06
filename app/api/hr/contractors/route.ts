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
import { ContractorsService } from "@/lib/services/hr/contractors-service";
import { ApiErrorHandler, generateRequestId } from "@/lib/api-error-handler";
import { createContractorSchema } from "@/lib/validation-schemas";

/**
 * GET /api/hr/contractors
 * List all contractors
 */
export async function GET(request: NextRequest) {
	const requestId = generateRequestId();
	try {
		const { userId } = await auth();
		if (!userId) return ApiErrorHandler.unauthorized();

		const { searchParams } = new URL(request.url);
		const filters: any = {};
		if (searchParams.get("search")) filters.search = searchParams.get("search");
		if (searchParams.get("contractorType")) filters.contractorType = searchParams.get("contractorType");
		if (searchParams.get("status")) filters.status = searchParams.get("status");
		if (searchParams.get("organizationId")) filters.organizationId = searchParams.get("organizationId");

		const service = new ContractorsService();
		const contractors = await service.getAll(filters);
		return NextResponse.json(contractors);
	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}

/**
 * POST /api/hr/contractors
 * Create a new contractor
 */
export async function POST(request: NextRequest) {
	const requestId = generateRequestId();
	try {
		const { userId } = await auth();
		if (!userId) return ApiErrorHandler.unauthorized();

		const body = await request.json();
		const validated = createContractorSchema.parse({
			...body,
			userId,
		});

		const service = new ContractorsService();
		const contractor = await service.create({
			...validated,
			contractStartDate: new Date(validated.contractStartDate),
			contractEndDate: validated.contractEndDate ? new Date(validated.contractEndDate) : undefined,
		});
		return NextResponse.json(contractor, { status: 201 });
	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}

