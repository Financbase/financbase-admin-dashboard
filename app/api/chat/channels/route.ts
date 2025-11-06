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
import { ChatService } from "@/lib/services/communication/chat-service";
import { ApiErrorHandler, generateRequestId } from "@/lib/api-error-handler";
import { z } from "zod";

const createChannelSchema = z.object({
	name: z.string().min(1),
	description: z.string().optional(),
	type: z.enum(["public", "private", "direct"]),
	members: z.array(z.string()).optional(),
	settings: z.record(z.any()).optional(),
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

		const service = new ChatService();
		const channels = await service.getChannels(organizationId);
		return NextResponse.json(channels);
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
		const { organizationId, ...channelData } = body;
		if (!organizationId) {
			return ApiErrorHandler.badRequest("organizationId is required");
		}

		const validated = createChannelSchema.parse(channelData);
		const service = new ChatService();
		const channel = await service.createChannel(organizationId, validated);
		return NextResponse.json(channel, { status: 201 });
	} catch (error) {
		if (error instanceof z.ZodError) {
			return ApiErrorHandler.badRequest(error.errors[0].message);
		}
		return ApiErrorHandler.handle(error, requestId);
	}
}

