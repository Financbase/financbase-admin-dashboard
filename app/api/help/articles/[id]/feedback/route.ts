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
import { HelpService } from '@/lib/services/help-service';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = generateRequestId();
  const { id } = await params;
  try {
    const { userId } = await auth();
    if (!userId) {
      return ApiErrorHandler.unauthorized();
    }

    const articleId = parseInt(id);
    if (isNaN(articleId)) {
      return ApiErrorHandler.badRequest('Invalid article ID');
    }

    let body;
    try {
      body = await request.json();
    } catch (error) {
      return ApiErrorHandler.badRequest('Invalid JSON in request body');
    }

    const { helpful, comment } = body;

    if (typeof helpful !== 'boolean') {
      return ApiErrorHandler.badRequest('helpful field is required and must be a boolean');
    }

    const feedback = await HelpService.submitFeedback(articleId, userId, {
      helpful,
      comment,
    });

    return NextResponse.json(feedback, { status: 201 });
  } catch (error) {
    return ApiErrorHandler.handle(error, requestId);
  }
}

