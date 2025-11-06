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
import { createTimeCardSchema, updateTimeCardSchema } from "@/lib/validation-schemas";

/**
 * GET /api/hr/attendance/time-cards
 * List time cards
 */
export async function GET(request: NextRequest) {
	const requestId = generateRequestId();
	try {
		const { userId } = await auth();
		if (!userId) return ApiErrorHandler.unauthorized();

		const { searchParams } = new URL(request.url);
		const filters: any = {};
		if (searchParams.get("employeeId")) filters.employeeId = searchParams.get("employeeId");
		if (searchParams.get("contractorId")) filters.contractorId = searchParams.get("contractorId");
		if (searchParams.get("organizationId")) filters.organizationId = searchParams.get("organizationId");
		if (searchParams.get("status")) filters.status = searchParams.get("status");
		if (searchParams.get("payPeriodStart")) filters.payPeriodStart = new Date(searchParams.get("payPeriodStart")!);
		if (searchParams.get("payPeriodEnd")) filters.payPeriodEnd = new Date(searchParams.get("payPeriodEnd")!);

		const service = new AttendanceService();
		const timeCards = await service.getTimeCards(filters);
		return NextResponse.json(timeCards);
	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}

/**
 * POST /api/hr/attendance/time-cards
 * Create time card or submit/approve
 */
export async function POST(request: NextRequest) {
	const requestId = generateRequestId();
	try {
		const { userId } = await auth();
		if (!userId) return ApiErrorHandler.unauthorized();

		const body = await request.json();

		// Check if this is a submit/approve action
		if (body.action === "submit" || body.action === "approve" || body.action === "reject") {
			const timeCardId = body.timeCardId || body.id;
			if (!timeCardId) {
				return ApiErrorHandler.badRequest("timeCardId is required");
			}

			const service = new AttendanceService();
			if (body.action === "submit") {
				const result = await service.submitTimeCard(timeCardId);
				return NextResponse.json(result);
			} else {
				const result = await service.approveTimeCard(
					timeCardId,
					body.action === "reject",
					body.rejectionReason
				);
				return NextResponse.json(result);
			}
		}

		// Otherwise, create a new time card
		const validated = createTimeCardSchema.parse(body);
		const service = new AttendanceService();
		const timeCard = await service.createTimeCard({
			...validated,
			payPeriodStart: new Date(validated.payPeriodStart),
			payPeriodEnd: new Date(validated.payPeriodEnd),
		});
		return NextResponse.json(timeCard, { status: 201 });
	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}

