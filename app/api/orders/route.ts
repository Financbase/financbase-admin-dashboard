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
import { OrdersService } from "@/lib/services/business/orders-service";
import { ApiErrorHandler, generateRequestId } from "@/lib/api-error-handler";
import { z } from "zod";

const createOrderSchema = z.object({
	customerId: z.string().uuid().optional(),
	orderNumber: z.string().optional(),
	products: z.array(
		z.object({
			productId: z.string(),
			name: z.string(),
			quantity: z.number(),
			price: z.string(),
			total: z.string(),
		})
	),
	status: z.enum(["pending", "processing", "shipped", "delivered", "cancelled", "refunded"]).optional(),
	priority: z.enum(["low", "normal", "high", "urgent"]).optional(),
	shippingAddress: z.record(z.string(), z.unknown()).optional(),
	billingAddress: z.record(z.string(), z.unknown()).optional(),
	shippingMethod: z.string().optional(),
	dueDate: z.string().transform((s) => new Date(s)).optional(),
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
		if (searchParams.get("status")) filters.status = searchParams.get("status");
		if (searchParams.get("customerId")) filters.customerId = searchParams.get("customerId");

		const service = new OrdersService();
		const orders = await service.getAll(filters);
		return NextResponse.json(orders);
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
		const validated = createOrderSchema.parse(body);

		const service = new OrdersService();
		const order = await service.create(validated);
		return NextResponse.json(order, { status: 201 });
	} catch (error) {
		if (error instanceof z.ZodError) {
			return ApiErrorHandler.badRequest(error.issues[0].message);
		}
		return ApiErrorHandler.handle(error, requestId);
	}
}

