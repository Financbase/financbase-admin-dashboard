/**
 * Enhanced Financbase GPT API Route
 * Handles AI chat requests with comprehensive financial context and analysis
 */

/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */


import { auth } from '@clerk/nextjs/server';
import { NextRequest } from 'next/server';
import OpenAI from 'openai';
import { FinancbaseGPTService } from '@/lib/services/business/financbase-gpt-service';
import { withAIDecisionLogging } from '@/lib/middleware/ai-decision-logger';

// Create OpenAI client
const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});

// Edge runtime for better performance
export const runtime = 'edge';

export async function POST(req: NextRequest) {
	try {
		// Authenticate user
		const { userId, orgId } = await auth();

		if (!userId || !orgId) {
			return new Response('Unauthorized', { status: 401 });
		}

		// Parse request body
		const body = await req.json();
		const { messages, context, analysisType } = body;

		if (!messages || !Array.isArray(messages)) {
			return new Response('Invalid request body', { status: 400 });
		}

		// Use enhanced GPT service for comprehensive analysis
		const gptService = new FinancbaseGPTService();

		// Get last user message
		const lastMessage = messages[messages.length - 1];
		if (!lastMessage || lastMessage.role !== 'user') {
			return new Response('Invalid message format', { status: 400 });
		}

		// Use AI decision logging wrapper
		const response = await withAIDecisionLogging(
			orgId,
			userId,
			'financbase-gpt',
			body,
			async () => {
				// Process query with enhanced service
				return await gptService.query({
					query: lastMessage.content,
					userId,
					analysisType: analysisType || 'general',
					conversationHistory: messages.slice(0, -1).map((msg: any) => ({
						role: msg.role,
						content: msg.content,
						timestamp: new Date().toISOString(),
					})),
				});
			},
			{
				useCase: 'financial_analysis',
				decisionType: 'financial_analysis',
			}
		);

		// Return structured response
		return new Response(JSON.stringify(response), {
			headers: {
				'Content-Type': 'application/json',
			},
		});

	} catch (error) {
		console.error('Error in enhanced Financbase GPT route:', error);

		if (error instanceof Error) {
			return new Response(error.message, { status: 500 });
		}

		return new Response('Internal server error', { status: 500 });
	}
}

export async function GET(req: NextRequest) {
	try {
		// Authenticate user
		const { userId } = await auth();

		if (!userId) {
			return new Response('Unauthorized', { status: 401 });
		}

		// Health check
		const gptService = new FinancbaseGPTService();
		const health = await gptService.health();

		return new Response(JSON.stringify(health), {
			headers: {
				'Content-Type': 'application/json',
			},
		});
	} catch (error) {
		console.error('Error in Financbase GPT health check:', error);

		return new Response('Service unavailable', { status: 503 });
	}
}

