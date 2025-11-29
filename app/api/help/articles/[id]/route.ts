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

export async function GET(
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

    // Try as number first, then as slug
    const articleId = parseInt(id);
    const article = isNaN(articleId)
      ? await HelpService.getArticle(id)
      : await HelpService.getArticle(articleId);

    if (!article) {
      return ApiErrorHandler.notFound('Article not found');
    }

    // Record view
    if (typeof articleId === 'number') {
      await HelpService.recordArticleView(articleId);
    } else {
      const articleById = await HelpService.getArticle(id);
      if (articleById) {
        await HelpService.recordArticleView(articleById.id);
      }
    }

    return NextResponse.json(article);
  } catch (error) {
    return ApiErrorHandler.handle(error, requestId);
  }
}

