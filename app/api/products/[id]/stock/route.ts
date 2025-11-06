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
		const { quantity, operation = "set" } = body;

		if (typeof quantity !== "number") {
			return ApiErrorHandler.badRequest("Quantity is required");
		}

		const service = new ProductsService();
		const product = await service.updateStock(id, quantity, operation);
		return NextResponse.json(product);
	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}

