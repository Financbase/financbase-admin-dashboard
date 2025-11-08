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
import { RealTimeAlertingService } from '@/lib/services/monitoring/real-time-alerting-service';
import { ApiErrorHandler, generateRequestId } from '@/lib/api-error-handler';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const requestId = generateRequestId();
  try {
    const { userId, orgId } = await auth();
    if (!userId || !orgId) {
      return ApiErrorHandler.unauthorized();
    }

    const alertId = parseInt(params.id);
    if (isNaN(alertId)) {
      return ApiErrorHandler.badRequest('Invalid alert ID');
    }

    const body = await request.json();
    const { action, resolutionNotes } = body;

    if (action === 'acknowledge') {
      await RealTimeAlertingService.acknowledgeAlert(alertId, userId);
    } else if (action === 'resolve') {
      await RealTimeAlertingService.resolveAlert(alertId, userId, resolutionNotes);
    } else {
      return ApiErrorHandler.badRequest('Invalid action. Use "acknowledge" or "resolve"');
    }

    return NextResponse.json({ success: true, message: `Alert ${action}d`, requestId }, { status: 200 });
  } catch (error: any) {
    console.error('Error updating alert:', error);
    return ApiErrorHandler.handle(error, requestId);
  }
}

