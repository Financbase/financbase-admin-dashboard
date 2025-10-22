import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { AIAssistantService } from '@/lib/services/ai/ai-assistant-service';

export async function GET() {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const suggestions = await AIAssistantService.getConversationSuggestions(userId);

		return NextResponse.json({ suggestions });
	} catch (error) {
		console.error('Error fetching conversation suggestions:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch conversation suggestions' },
			{ status: 500 }
		);
	}
}
