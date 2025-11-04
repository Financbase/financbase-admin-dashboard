/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { AIAssistantService } from '@/lib/services/ai/ai-assistant-service';

export async function GET(request: NextRequest) {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { searchParams } = new URL(request.url);
		const limit = parseInt(searchParams.get('limit') || '20');

		const conversations = await AIAssistantService.getConversations(userId, limit);

		return NextResponse.json({ conversations });
	} catch (error) {
		console.error('Error fetching conversations:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch conversations' },
			{ status: 500 }
		);
	}
}

export async function POST(request: NextRequest) {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const body = await request.json();
		const { title } = body;

		const conversation = await AIAssistantService.createConversation(userId, title);

		return NextResponse.json({ conversation }, { status: 201 });
	} catch (error) {
		console.error('Error creating conversation:', error);
		return NextResponse.json(
			{ error: 'Failed to create conversation' },
			{ status: 500 }
		);
	}
}
