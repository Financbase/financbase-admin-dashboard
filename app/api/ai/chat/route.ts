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

/**
 * Simple AI chat endpoint for quick messages
 * For full conversation management, use /api/ai/chat/conversations and /api/ai/chat/messages
 */
export async function POST(request: NextRequest) {
  const requestId = generateRequestId();
  try {
    const { userId } = await auth();
    if (!userId) {
      return ApiErrorHandler.unauthorized();
    }

    const body = await request.json();
    const { message } = body;

    if (!message || typeof message !== 'string') {
      return ApiErrorHandler.badRequest('Message is required');
    }

    // For now, return a simple response
    // In production, this would call an AI service
    const response = {
      response: `I received your message: "${message}". This is a placeholder response. For full AI capabilities, please use the AI Assistant page.`,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    return ApiErrorHandler.handle(error, requestId);
  }
}

