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
import { MonitoringService } from '@/lib/services/monitoring-service';

export async function GET(request: NextRequest) {
  const requestId = generateRequestId();
  try {
    const { userId } = await auth();
    if (!userId) {
      return ApiErrorHandler.unauthorized();
    }

    const { searchParams } = new URL(request.url);
    const ruleId = searchParams.get('ruleId') ? parseInt(searchParams.get('ruleId')!) : undefined;
    const status = searchParams.get('status') as 'triggered' | 'resolved' | 'acknowledged' | null;
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!ruleId) {
      return ApiErrorHandler.badRequest('ruleId is required');
    }

    try {
      const alerts = await MonitoringService.getAlertHistory(ruleId, userId, {
        status: status || undefined,
        limit,
        offset,
      });

      return NextResponse.json(alerts);
    } catch (error) {
      if (error instanceof Error && error.message === 'Alert rule not found') {
        return ApiErrorHandler.notFound('Alert rule not found');
      }
      return ApiErrorHandler.handle(error, requestId);
    }
  } catch (error) {
    return ApiErrorHandler.handle(error, requestId);
  }
}

