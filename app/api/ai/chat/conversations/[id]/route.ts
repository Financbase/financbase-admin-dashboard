import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { AIAssistantService } from '@/lib/services/ai/ai-assistant-service';

export async function GET(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const messages = await AIAssistantService.getConversationMessages(params.id, userId);

		return NextResponse.json({ messages });
	} catch (error) {
		console.error('Error fetching conversation messages:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch conversation messages' },
			{ status: 500 }
		);
	}
}

export async function DELETE(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		await AIAssistantService.deleteConversation(params.id, userId);

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('Error deleting conversation:', error);
		return NextResponse.json(
			{ error: 'Failed to delete conversation' },
			{ status: 500 }
		);
	}
}
