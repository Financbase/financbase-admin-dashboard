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
import { clockOutSchema } from "@/lib/validation-schemas";

/**
 * POST /api/hr/attendance/clock-out
 * Clock out
 */
export async function POST(request: NextRequest) {
	const requestId = generateRequestId();
	try {
		const { userId } = await auth();
		if (!userId) return ApiErrorHandler.unauthorized();

		const body = await request.json();
		const validated = clockOutSchema.parse(body);

		const service = new AttendanceService();
		const record = await service.clockOut({
			...validated,
			location: validated.location,
		});
		return NextResponse.json(record);
	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}

