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

export async function GET(request: NextRequest) {
  const requestId = generateRequestId();
  try {
    const { userId } = await auth();
    if (!userId) {
      return ApiErrorHandler.unauthorized();
    }

    const { searchParams } = new URL(request.url);
    const parentId = searchParams.get('parentId') ? parseInt(searchParams.get('parentId')!) : searchParams.get('parentId') === 'null' ? null : undefined;
    const isActive = searchParams.get('isActive') === 'true' ? true : searchParams.get('isActive') === 'false' ? false : undefined;
    const isPublic = searchParams.get('isPublic') === 'true' ? true : searchParams.get('isPublic') === 'false' ? false : undefined;

    const categories = await HelpService.getCategories({
      parentId,
      isActive,
      isPublic,
    });

    return NextResponse.json(categories);
  } catch (error) {
    return ApiErrorHandler.handle(error, requestId);
  }
}
