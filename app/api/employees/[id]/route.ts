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

const updateSchema = z.object({
	firstName: z.string().optional(),
	lastName: z.string().optional(),
	email: z.string().email().optional(),
	phone: z.string().optional(),
	position: z.string().optional(),
	department: z.string().optional(),
	managerId: z.string().uuid().optional(),
	salary: z.string().optional(),
	status: z.enum(["active", "on_leave", "terminated", "suspended"]).optional(),
	location: z.string().optional(),
	timezone: z.string().optional(),
	notes: z.string().optional(),
	tags: z.array(z.string()).optional(),
});

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	const requestId = generateRequestId();
	try {
		const { userId } = await auth();
		if (!userId) return ApiErrorHandler.unauthorized();

		const { id } = await params;
		const service = new EmployeesService();
		const employee = await service.getById(id);
		return NextResponse.json(employee);
	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}

export async function PATCH(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	const requestId = generateRequestId();
	try {
		const { userId } = await auth();
		if (!userId) return ApiErrorHandler.unauthorized();

		const { id } = await params;
		const body = await request.json();
		const validated = updateSchema.parse(body);

		const service = new EmployeesService();
		const employee = await service.update({ id, ...validated });
		return NextResponse.json(employee);
	} catch (error) {
		if (error instanceof z.ZodError) {
			return ApiErrorHandler.badRequest(error.errors[0].message);
		}
		return ApiErrorHandler.handle(error, requestId);
	}
}

export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	const requestId = generateRequestId();
	try {
		const { userId } = await auth();
		if (!userId) return ApiErrorHandler.unauthorized();

		const { id } = await params;
		const service = new EmployeesService();
		await service.delete(id);
		return NextResponse.json({ success: true });
	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}

