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
import { clockInSchema } from "@/lib/validation-schemas";

/**
 * POST /api/hr/attendance/clock-in
 * Clock in
 */
export async function POST(request: NextRequest) {
	const requestId = generateRequestId();
	try {
		const { userId } = await auth();
		if (!userId) return ApiErrorHandler.unauthorized();

		const body = await request.json();
		const validated = clockInSchema.parse(body);

		const service = new AttendanceService();
		const record = await service.clockIn({
			...validated,
			location: validated.location,
		});
		return NextResponse.json(record, { status: 201 });
	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}

