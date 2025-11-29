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

const createCustomerSchema = z.object({
	name: z.string().min(1, "Name is required"),
	email: z.string().email("Invalid email"),
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

// GET /api/customers - List all customers
export async function GET(request: NextRequest) {
	const requestId = generateRequestId();
	try {
		const { userId } = await auth();
		if (!userId) {
			return ApiErrorHandler.unauthorized();
		}

		const { searchParams } = new URL(request.url);
		const search = searchParams.get("search");
		const status = searchParams.get("status");

		const filters: any = {};
		if (search) filters.search = search;
		if (status) filters.status = status;

		const service = new CustomersService();
		const customers = await service.getAll(filters);

		return NextResponse.json(customers);
	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}

// POST /api/customers - Create a new customer
export async function POST(request: NextRequest) {
	const requestId = generateRequestId();
	try {
		const { userId } = await auth();
		if (!userId) {
			return ApiErrorHandler.unauthorized();
		}

		const body = await request.json();
		const validated = createCustomerSchema.parse(body);

		const service = new CustomersService();
		const customer = await service.create(validated);

		return NextResponse.json(customer, { status: 201 });
	} catch (error) {
		if (error instanceof z.ZodError) {
			return ApiErrorHandler.badRequest(error.issues[0]?.message || 'Validation error');
		}
		return ApiErrorHandler.handle(error, requestId);
	}
}

