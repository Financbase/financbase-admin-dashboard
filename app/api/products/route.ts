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
import { ProductsService } from "@/lib/services/business/products-service";
import { ApiErrorHandler, generateRequestId } from "@/lib/api-error-handler";
import { z } from "zod";

const createProductSchema = z.object({
	name: z.string().min(1),
	sku: z.string().min(1),
	description: z.string().optional(),
	category: z.string().min(1),
	price: z.string(),
	cost: z.string().optional(),
	stockQuantity: z.number().optional(),
	lowStockThreshold: z.number().optional(),
	status: z.enum(["active", "inactive", "low_stock", "discontinued", "out_of_stock"]).optional(),
	images: z.array(z.string()).optional(),
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
		if (searchParams.get("category")) filters.category = searchParams.get("category");
		if (searchParams.get("status")) filters.status = searchParams.get("status");
		if (searchParams.get("lowStock") === "true") filters.lowStock = true;

		const service = new ProductsService();
		const products = await service.getAll(filters);
		return NextResponse.json(products);
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
		const validated = createProductSchema.parse(body);

		const service = new ProductsService();
		const product = await service.create(validated);
		return NextResponse.json(product, { status: 201 });
	} catch (error) {
		if (error instanceof z.ZodError) {
			return ApiErrorHandler.badRequest(error.errors[0].message);
		}
		return ApiErrorHandler.handle(error, requestId);
	}
}

