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
import { DocumentationService } from '@/lib/services/documentation-service';
import { ApiErrorHandler, generateRequestId } from '@/lib/api-error-handler';

export async function GET(request: NextRequest) {
  const requestId = generateRequestId();
  try {
    const { userId } = await auth();
    if (!userId) {
      return ApiErrorHandler.unauthorized();
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query') || '';
    const category = searchParams.get('category') || 'all';
    const sort = searchParams.get('sort') || 'relevance';

    if (!query.trim()) {
      return NextResponse.json([]);
    }

    const filters = {
      category: category !== 'all' ? category : undefined,
    };

    const results = await DocumentationService.searchHelpContent(
      query,
      filters,
      userId,
      'session-id' // In a real implementation, get from session
    );

    return NextResponse.json(results);
  } catch (error) {
    return ApiErrorHandler.handle(error, requestId);
  }
}
