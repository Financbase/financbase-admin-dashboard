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

export async function POST(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	const requestId = generateRequestId();
	try {
		const { userId } = await auth();
		if (!userId) return ApiErrorHandler.unauthorized();

		const { id } = await params;
		const body = await request.json();
		const { trackingNumber, carrier } = body;

		const service = new OrdersService();
		const order = await service.fulfill(id, trackingNumber, carrier);
		return NextResponse.json(order);
	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}

