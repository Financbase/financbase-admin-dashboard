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
import { IntegrationService } from '@/lib/services/integration-service';

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

    const connectionId = parseInt(id);
    if (isNaN(connectionId)) {
      return ApiErrorHandler.badRequest('Invalid connection ID');
    }

    try {
      const health = await IntegrationService.checkConnectionHealth(connectionId, userId);
      return NextResponse.json(health);
    } catch (error) {
      if (error instanceof Error && error.message === 'Connection not found') {
        return ApiErrorHandler.notFound('Connection not found');
      }
      return ApiErrorHandler.handle(error, requestId);
    }
  } catch (error) {
    return ApiErrorHandler.handle(error, requestId);
  }
}

