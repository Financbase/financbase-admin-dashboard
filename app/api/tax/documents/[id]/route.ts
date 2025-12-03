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
import { TaxService } from "@/lib/services/business/tax-service";
import { ApiErrorHandler, generateRequestId } from "@/lib/api-error-handler";
import { withRLS } from "@/lib/api/with-rls";
import { createSuccessResponse, type StandardApiResponse } from "@/lib/api/standard-response";

/**
 * DELETE /api/tax/documents/[id]
 * Delete tax document
 */
export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	const requestId = generateRequestId();
	return withRLS<StandardApiResponse<unknown>>(async (clerkUserId) => {
		try {
			const { id } = await params;
			const service = new TaxService();
			await service.deleteDocument(id, clerkUserId);

			return createSuccessResponse(
				{ message: "Tax document deleted successfully" },
				200,
				{ requestId }
			);
		} catch (error) {
			return ApiErrorHandler.handle(error, requestId);
		}
	});
}

