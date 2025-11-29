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
import { EmployeesService } from "@/lib/services/hr/employees-service";
import { ApiErrorHandler, generateRequestId } from "@/lib/api-error-handler";
import { z } from "zod";

const createEmployeeSchema = z.object({
	userId: z.string(),
	organizationId: z.string().uuid(),
	firstName: z.string().min(1),
	lastName: z.string().min(1),
	email: z.string().email(),
	phone: z.string().optional(),
	position: z.string().min(1),
	department: z.string().min(1),
	managerId: z.string().uuid().optional(),
	salary: z.string().optional(),
	startDate: z.string().transform((s) => new Date(s)),
	status: z.enum(["active", "on_leave", "terminated", "suspended"]).optional(),
	location: z.string().optional(),
	timezone: z.string().optional(),
	notes: z.string().optional(),
	tags: z.array(z.string()).optional(),
});

export async function GET(request: NextRequest) {
	const requestId = generateRequestId();
	try {
		const { userId } = await auth();
		if (!userId) return ApiErrorHandler.unauthorized();

		const { searchParams } = new URL(request.url);
		const filters: any = {};
		if (searchParams.get("search")) filters.search = searchParams.get("search");
		if (searchParams.get("department")) filters.department = searchParams.get("department");
		if (searchParams.get("status")) filters.status = searchParams.get("status");

		const service = new EmployeesService();
		const employees = await service.getAll(filters);
		return NextResponse.json(employees);
	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}

export async function POST(request: NextRequest) {
	const requestId = generateRequestId();
	try {
		const { userId } = await auth();
		if (!userId) return ApiErrorHandler.unauthorized();

		const body = await request.json();
		const validated = createEmployeeSchema.parse(body);

		const service = new EmployeesService();
		const employee = await service.create(validated);
		return NextResponse.json(employee, { status: 201 });
	} catch (error) {
		if (error instanceof z.ZodError) {
			return ApiErrorHandler.badRequest(error.issues[0]?.message || 'Validation error');
		}
		return ApiErrorHandler.handle(error, requestId);
	}
}

