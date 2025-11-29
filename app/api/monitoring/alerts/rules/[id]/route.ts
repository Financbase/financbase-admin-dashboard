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

    const ruleId = parseInt(id);
    if (isNaN(ruleId)) {
      return ApiErrorHandler.badRequest('Invalid rule ID');
    }

    const rule = await MonitoringService.getAlertRule(ruleId, userId);
    if (!rule) {
      return ApiErrorHandler.notFound('Alert rule not found');
    }

    return NextResponse.json(rule);
  } catch (error) {
    return ApiErrorHandler.handle(error, requestId);
  }
}

export async function PUT(
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

    const ruleId = parseInt(id);
    if (isNaN(ruleId)) {
      return ApiErrorHandler.badRequest('Invalid rule ID');
    }

    let body;
    try {
      body = await request.json();
    } catch (error) {
      return ApiErrorHandler.badRequest('Invalid JSON in request body');
    }

    const rule = await MonitoringService.updateAlertRule(ruleId, userId, body);
    if (!rule) {
      return ApiErrorHandler.notFound('Alert rule not found');
    }

    return NextResponse.json(rule);
  } catch (error) {
    return ApiErrorHandler.handle(error, requestId);
  }
}
