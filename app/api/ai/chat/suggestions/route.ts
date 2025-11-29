/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { AIAssistantService } from '@/lib/services/ai/ai-assistant-service';
import { logger } from '@/lib/logger';

export async function GET() {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const suggestions = await AIAssistantService.getConversationSuggestions(userId);

		return NextResponse.json({ suggestions });
	} catch (error) {
		logger.error('Error fetching conversation suggestions:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch conversation suggestions' },
			{ status: 500 }
		);
	}
}
