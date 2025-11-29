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
    const organizationId = searchParams.get('organizationId') || undefined;
    const isActive = searchParams.get('isActive') === 'true' ? true : searchParams.get('isActive') === 'false' ? false : undefined;
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const alertRules = await MonitoringService.getAlertRules(userId, {
      organizationId,
      isActive,
      limit,
      offset,
    });

    return NextResponse.json(alertRules);
  } catch (error) {
    return ApiErrorHandler.handle(error, requestId);
  }
}

export async function POST(request: NextRequest) {
  const requestId = generateRequestId();
  try {
    const { userId } = await auth();
    if (!userId) {
      return ApiErrorHandler.unauthorized();
    }

    let body;
    try {
      body = await request.json();
    } catch (error) {
      return ApiErrorHandler.badRequest('Invalid JSON in request body');
    }

    const { 
      name, 
      description, 
      metricName, 
      condition, 
      threshold, 
      severity, 
      channels, 
      cooldownPeriod, 
      maxAlertsPerHour,
      organizationId,
      timeWindow,
      labels,
      filters
    } = body;

    if (!name || !metricName || !condition || !threshold || !severity) {
      return ApiErrorHandler.badRequest('Missing required fields: name, metricName, condition, threshold, severity');
    }

    const alertRule = await MonitoringService.createAlertRule(userId, {
      name,
      description,
      organizationId,
      metricName,
      condition,
      threshold,
      timeWindow,
      severity,
      channels,
      cooldownPeriod,
      maxAlertsPerHour,
      labels,
      filters,
    });

    return NextResponse.json(alertRule, { status: 201 });
  } catch (error) {
    return ApiErrorHandler.handle(error, requestId);
  }
}
