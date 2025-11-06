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
import { updateContractorSchema } from "@/lib/validation-schemas";

/**
 * GET /api/hr/contractors/[id]
 * Get contractor by ID
 */
export async function GET(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	const requestId = generateRequestId();
	try {
		const { userId } = await auth();
		if (!userId) return ApiErrorHandler.unauthorized();

		const service = new ContractorsService();
		const contractor = await service.getById(params.id);
		return NextResponse.json(contractor);
	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}

/**
 * PATCH /api/hr/contractors/[id]
 * Update contractor
 */
export async function PATCH(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	const requestId = generateRequestId();
	try {
		const { userId } = await auth();
		if (!userId) return ApiErrorHandler.unauthorized();

		const body = await request.json();
		const validated = updateContractorSchema.parse({
			...body,
			id: params.id,
		});

		const service = new ContractorsService();
		const contractor = await service.update({
			...validated,
			contractStartDate: validated.contractStartDate ? new Date(validated.contractStartDate) : undefined,
			contractEndDate: validated.contractEndDate ? new Date(validated.contractEndDate) : undefined,
		});
		return NextResponse.json(contractor);
	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}

/**
 * DELETE /api/hr/contractors/[id]
 * Delete contractor
 */
export async function DELETE(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	const requestId = generateRequestId();
	try {
		const { userId } = await auth();
		if (!userId) return ApiErrorHandler.unauthorized();

		const service = new ContractorsService();
		await service.delete(params.id);
		return NextResponse.json({ success: true });
	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}

