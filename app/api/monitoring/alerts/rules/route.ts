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
import { AlertService } from '@/lib/services/alert-service';
import { ApiErrorHandler, generateRequestId } from '@/lib/api-error-handler';

export async function GET(request: NextRequest) {
  const requestId = generateRequestId();
  try {
    const { userId } = await auth();
    if (!userId) {
      return ApiErrorHandler.unauthorized();
    }

    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');

    const alertRules = await AlertService.getAlertRules(userId, organizationId || undefined);
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
      labels,
      filters
    } = body;

    if (!name || !metricName || !condition || !threshold || !severity) {
      return ApiErrorHandler.badRequest('Missing required fields: name, metricName, condition, threshold, severity');
    }

    const alertRule = await AlertService.createAlertRule(userId, organizationId, {
      name,
      description: description || '',
      metricName,
      condition,
      threshold,
      severity,
      channels: channels || ['email'],
      cooldownPeriod: cooldownPeriod || 3600,
      maxAlertsPerHour: maxAlertsPerHour || 10,
      labels: labels || {},
      filters: filters || {},
    });

    return NextResponse.json(alertRule, { status: 201 });
  } catch (error) {
    return ApiErrorHandler.handle(error, requestId);
  }
}
