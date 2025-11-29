/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { BYOKService } from '@/lib/services/byok-service';
import { logger } from '@/lib/logger';

/**
 * GET /api/byok/usage
 * Get user's AI usage statistics
 */
export async function GET(request: NextRequest) {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { searchParams } = new URL(request.url);
		const provider = searchParams.get('provider');

		const byokService = new BYOKService();
		const usage = await byokService.getUserUsage(userId, provider || undefined);

		return NextResponse.json({ usage });

	} catch (error) {
		logger.error('Error fetching AI usage:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch AI usage' },
			{ status: 500 }
		);
	}
}

/**
 * POST /api/byok/usage/track
 * Track AI usage for cost monitoring
 */
export async function POST(request: NextRequest) {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const body = await request.json();
		const {
			provider,
			model,
			tokensUsed,
			tokensInput,
			tokensOutput,
			responseTime,
			requestType = 'chat',
			success = true,
			requestId,
			sessionId
		} = body;

		if (!provider || !model || tokensUsed === undefined) {
			return NextResponse.json(
				{ error: 'Provider, model, and tokensUsed are required' },
				{ status: 400 }
			);
		}

		const byokService = new BYOKService();
		await byokService.trackUsage(
			userId,
			provider,
			model,
			tokensUsed,
			tokensInput || 0,
			tokensOutput || 0,
			responseTime || 0,
			requestType,
			success,
			requestId,
			sessionId
		);

		return NextResponse.json({
			success: true,
			message: 'Usage tracked successfully'
		});

	} catch (error) {
		logger.error('Error tracking AI usage:', error);
		return NextResponse.json(
			{ error: 'Failed to track AI usage' },
			{ status: 500 }
		);
	}
}
