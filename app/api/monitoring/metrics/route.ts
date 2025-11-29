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
    const metricName = searchParams.get('metricName') || undefined;
    const category = searchParams.get('category') || undefined;
    const startDate = searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : undefined;
    const endDate = searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : undefined;
    const aggregation = searchParams.get('aggregation') as 'avg' | 'sum' | 'min' | 'max' | 'count' | undefined;

    // Calculate start date from time range if provided
    let calculatedStartDate = startDate;
    if (!calculatedStartDate) {
      const timeRange = searchParams.get('timeRange') || '24h';
      const hours = timeRange === '1h' ? 1 : timeRange === '24h' ? 24 : timeRange === '7d' ? 168 : 24;
      calculatedStartDate = new Date(Date.now() - hours * 60 * 60 * 1000);
    }

    const result = await MonitoringService.getMetrics(userId, {
      organizationId,
      metricName,
      category,
      startDate: calculatedStartDate,
      endDate,
      aggregation,
    });

    return NextResponse.json(result);
  } catch (error) {
    return ApiErrorHandler.handle(error, requestId);
  }
}
