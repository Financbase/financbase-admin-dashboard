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
import { CustomersService } from "@/lib/services/business/customers-service";
import { ApiErrorHandler, generateRequestId } from "@/lib/api-error-handler";
import { z } from "zod";

const updateCustomerSchema = z.object({
	name: z.string().min(1).optional(),
	email: z.string().email().optional(),
	phone: z.string().optional(),
	company: z.string().optional(),
	address: z.string().optional(),
	city: z.string().optional(),
	state: z.string().optional(),
	zipCode: z.string().optional(),
	country: z.string().optional(),
	taxId: z.string().optional(),
	currency: z.string().optional(),
	paymentTerms: z.string().optional(),
	status: z.enum(["active", "inactive", "suspended"]).optional(),
	notes: z.string().optional(),
	tags: z.array(z.string()).optional(),
});

// GET /api/customers/[id] - Get customer by ID
export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	const requestId = generateRequestId();
	try {
		const { userId } = await auth();
		if (!userId) {
			return ApiErrorHandler.unauthorized();
		}

		const { id } = await params;
		const customerId = parseInt(id);
		if (Number.isNaN(customerId)) {
			return ApiErrorHandler.badRequest("Invalid customer ID");
		}

		const service = new CustomersService();
		const customer = await service.getById(customerId);

		return NextResponse.json(customer);
	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}

// PATCH /api/customers/[id] - Update customer
export async function PATCH(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	const requestId = generateRequestId();
	try {
		const { userId } = await auth();
		if (!userId) {
			return ApiErrorHandler.unauthorized();
		}

		const { id } = await params;
		const customerId = parseInt(id);
		if (Number.isNaN(customerId)) {
			return ApiErrorHandler.badRequest("Invalid customer ID");
		}

		const body = await request.json();
		const validated = updateCustomerSchema.parse(body);

		const service = new CustomersService();
		const customer = await service.update({ id: customerId, ...validated });

		return NextResponse.json(customer);
	} catch (error) {
		if (error instanceof z.ZodError) {
			return ApiErrorHandler.badRequest(error.issues[0]?.message || 'Validation error');
		}
		return ApiErrorHandler.handle(error, requestId);
	}
}

// DELETE /api/customers/[id] - Delete customer
export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	const requestId = generateRequestId();
	try {
		const { userId } = await auth();
		if (!userId) {
			return ApiErrorHandler.unauthorized();
		}

		const { id } = await params;
		const customerId = parseInt(id);
		if (Number.isNaN(customerId)) {
			return ApiErrorHandler.badRequest("Invalid customer ID");
		}

		const service = new CustomersService();
		await service.delete(customerId);

		return NextResponse.json({ success: true });
	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}

