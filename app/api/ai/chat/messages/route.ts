import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { AIAssistantService } from '@/lib/services/ai/ai-assistant-service';
import { z } from 'zod';

const sendMessageSchema = z.object({
	conversationId: z.string().min(1, 'Conversation ID is required'),
	message: z.string().min(1, 'Message is required'),
});

export async function POST(request: NextRequest) {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const body = await request.json();
		const validatedData = sendMessageSchema.parse(body);

		const result = await AIAssistantService.sendMessage(
			validatedData.conversationId,
			userId,
			validatedData.message
		);

		return NextResponse.json({ result });
	} catch (error) {
		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{ error: 'Validation error', details: error.errors },
				{ status: 400 }
			);
		}

		console.error('Error sending message:', error);
		return NextResponse.json(
			{ error: 'Failed to send message' },
			{ status: 500 }
		);
	}
}
