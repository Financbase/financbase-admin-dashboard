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

const createCategorySchema = z.object({
	name: z.string().min(1),
	description: z.string().optional(),
});

export async function GET(request: NextRequest) {
	const requestId = generateRequestId();
	try {
		const { userId } = await auth();
		if (!userId) return ApiErrorHandler.unauthorized();

		const { searchParams } = new URL(request.url);
		const organizationId = searchParams.get("organizationId");
		if (!organizationId) {
			return ApiErrorHandler.badRequest("organizationId is required");
		}

		const service = new ProductsService();
		const categories = await service.getCategories(organizationId);
		return NextResponse.json(categories);
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
		const { organizationId, ...categoryData } = body;
		if (!organizationId) {
			return ApiErrorHandler.badRequest("organizationId is required");
		}

		const validated = createCategorySchema.parse(categoryData);
		const service = new ProductsService();
		const category = await service.createCategory(organizationId, validated.name, validated.description);
		return NextResponse.json(category, { status: 201 });
	} catch (error) {
		if (error instanceof z.ZodError) {
			return ApiErrorHandler.badRequest(error.issues[0].message);
		}
		return ApiErrorHandler.handle(error, requestId);
	}
}

