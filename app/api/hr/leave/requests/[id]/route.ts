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
import { approveLeaveSchema } from "@/lib/validation-schemas";

/**
 * PATCH /api/hr/leave/requests/[id]
 * Approve or reject leave request
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
		const validated = approveLeaveSchema.parse({
			requestId: params.id,
			approved: body.approved,
			rejectionReason: body.rejectionReason,
		});

		const service = new LeaveService();
		const result = await service.approveLeaveRequest(validated);
		return NextResponse.json(result);
	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}

