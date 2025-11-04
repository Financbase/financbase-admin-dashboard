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
import { MetricsCollector } from '@/lib/analytics/metrics-collector';
import { ApiErrorHandler, generateRequestId } from '@/lib/api-error-handler';

export async function GET(request: NextRequest) {
  const requestId = generateRequestId();
  try {
    const { userId } = await auth();
    if (!userId) {
      return ApiErrorHandler.unauthorized();
    }

    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '24h';
    const metricType = searchParams.get('type') || 'all';
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Get metrics based on type
    let metrics;
    if (metricType === 'all') {
      metrics = await MetricsCollector.getMetrics(userId, undefined, timeRange as any);
    } else {
      // Filter by metric type
      const allMetrics = await MetricsCollector.getMetrics(userId, undefined, timeRange as any);
      metrics = {
        system: metricType === 'system' ? allMetrics.system : [],
        performance: metricType === 'performance' ? allMetrics.performance : [],
        business: metricType === 'business' ? allMetrics.business : [],
      };
    }

    // Apply pagination
    if (metrics.system) {
      metrics.system = metrics.system.slice(offset, offset + limit);
    }
    if (metrics.performance) {
      metrics.performance = metrics.performance.slice(offset, offset + limit);
    }
    if (metrics.business) {
      metrics.business = metrics.business.slice(offset, offset + limit);
    }

    return NextResponse.json(metrics);
  } catch (error) {
    return ApiErrorHandler.handle(error, requestId);
  }
}
