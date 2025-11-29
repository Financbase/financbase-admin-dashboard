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

const createMessageSchema = z.object({
	message: z.string().min(1),
	type: z.enum(["message", "file", "system", "reply"]).optional(),
	replyTo: z.string().optional(),
	mentions: z.array(z.string()).optional(),
	attachments: z
		.array(
			z.object({
				url: z.string(),
				name: z.string(),
				type: z.string(),
				size: z.number(),
			})
		)
		.optional(),
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
		const { searchParams } = new URL(request.url);
		const limit = parseInt(searchParams.get("limit") || "50");
		const offset = parseInt(searchParams.get("offset") || "0");

		const service = new ChatService();
		const messages = await service.getChannelMessages(id, limit, offset);
		return NextResponse.json(messages);
	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}

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
		const { organizationId, ...messageData } = body;

		if (!organizationId) {
			return ApiErrorHandler.badRequest("organizationId is required");
		}

		const validated = createMessageSchema.parse(messageData);
		const service = new ChatService();
		const message = await service.sendMessage(organizationId, {
			channelId: id,
			...validated,
		});
		return NextResponse.json(message, { status: 201 });
	} catch (error) {
		if (error instanceof z.ZodError) {
			return ApiErrorHandler.badRequest(error.issues[0]?.message || 'Validation error');
		}
		return ApiErrorHandler.handle(error, requestId);
	}
}

