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
import { ApiErrorHandler, generateRequestId } from '@/lib/api-error-handler';
import { withAIDecisionLogging } from '@/lib/middleware/ai-decision-logger';

/**
 * Simple AI chat endpoint for quick messages
 * For full conversation management, use /api/ai/chat/conversations and /api/ai/chat/messages
 */
export async function POST(request: NextRequest) {
  const requestId = generateRequestId();
  try {
    const { userId, orgId } = await auth();
    if (!userId || !orgId) {
      return ApiErrorHandler.unauthorized();
    }

    const body = await request.json();
    const { message } = body;

    if (!message || typeof message !== 'string') {
      return ApiErrorHandler.badRequest('Message is required');
    }

    // Use AI decision logging wrapper
    const response = await withAIDecisionLogging(
      orgId,
      userId,
      'chat-model',
      body,
      async () => {
        // For now, return a simple response
        // In production, this would call an AI service
        return {
          response: `I received your message: "${message}". This is a placeholder response. For full AI capabilities, please use the AI Assistant page.`,
          timestamp: new Date().toISOString(),
        };
      },
      {
        useCase: 'chat',
        decisionType: 'recommendation',
      }
    );

    return NextResponse.json(response);
  } catch (error) {
    return ApiErrorHandler.handle(error, requestId);
  }
}

