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
import { AttendanceService } from "@/lib/services/hr/attendance-service";
import { ApiErrorHandler, generateRequestId } from "@/lib/api-error-handler";
import { updateTimeCardSchema } from "@/lib/validation-schemas";

/**
 * PATCH /api/hr/attendance/time-cards/[id]
 * Update time card (submit/approve/reject)
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
		const validated = updateTimeCardSchema.parse({
			...body,
			id: params.id,
		});

		const service = new AttendanceService();

		if (validated.status === "submitted") {
			const result = await service.submitTimeCard(params.id);
			return NextResponse.json(result);
		} else if (validated.status === "approved" || validated.status === "rejected") {
			const result = await service.approveTimeCard(
				params.id,
				validated.status === "rejected",
				body.rejectionReason
			);
			return NextResponse.json(result);
		}

		return ApiErrorHandler.badRequest("Invalid status update");
	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}

