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
import { GalleryService } from "@/lib/services/media/gallery-service";
import { ApiErrorHandler, generateRequestId } from "@/lib/api-error-handler";
import { z } from "zod";

const createImageSchema = z.object({
	url: z.string().url(),
	name: z.string().min(1),
	size: z.number().min(0),
	type: z.string().min(1),
	category: z.string().optional(),
	tags: z.array(z.string()).optional(),
	metadata: z.record(z.any()).optional(),
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
		if (searchParams.get("favorite") === "true") filters.favorite = true;
		if (searchParams.get("archived") === "true") filters.archived = true;

		const service = new GalleryService();
		const images = await service.getAll(filters);
		return NextResponse.json(images);
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
		const { organizationId, ...imageData } = body;

		if (!organizationId) {
			return ApiErrorHandler.badRequest("organizationId is required");
		}

		const validated = createImageSchema.parse(imageData);
		const service = new GalleryService();
		const image = await service.create(organizationId, validated);
		return NextResponse.json(image, { status: 201 });
	} catch (error) {
		if (error instanceof z.ZodError) {
			return ApiErrorHandler.badRequest(error.errors[0].message);
		}
		return ApiErrorHandler.handle(error, requestId);
	}
}

