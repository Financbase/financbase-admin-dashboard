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
import { db } from '@/lib/db';
import { systemMetrics } from '@/lib/db/schemas';
import { eq, and, gte, desc } from 'drizzle-orm';
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
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const severity = searchParams.get('severity');

    // Calculate time range
    const timeRanges = {
      '1h': 1 * 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
    };

    const startTime = new Date(Date.now() - timeRanges[timeRange as keyof typeof timeRanges]);

    // Build query conditions
    const whereConditions = [
      eq(systemMetrics.userId, userId),
      gte(systemMetrics.timestamp, startTime),
      eq(systemMetrics.category, 'error')
    ];

    // Get error metrics
    const errors = await db
      .select()
      .from(systemMetrics)
      .where(and(...whereConditions))
      .orderBy(desc(systemMetrics.timestamp))
      .limit(limit)
      .offset(offset);

    // Transform error data
    const transformedErrors = errors.map(error => {
      const labels = error.labels as Record<string, any> | null;
      return {
        id: error.id,
        message: labels?.message || 'Unknown error',
        type: labels?.type || 'system',
        severity: labels?.severity || 'medium',
        timestamp: error.timestamp,
        value: error.value,
        labels: error.labels,
        tags: error.tags,
      };
    });

    // Get error statistics
    const errorStats = {
      total: transformedErrors.length,
      bySeverity: {
        critical: transformedErrors.filter(e => e.severity === 'critical').length,
        high: transformedErrors.filter(e => e.severity === 'high').length,
        medium: transformedErrors.filter(e => e.severity === 'medium').length,
        low: transformedErrors.filter(e => e.severity === 'low').length,
      },
      byType: transformedErrors.reduce((acc, error) => {
        acc[error.type] = (acc[error.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };

    return NextResponse.json({
      errors: transformedErrors,
      statistics: errorStats,
      pagination: {
        limit,
        offset,
        total: transformedErrors.length,
      },
    });
  } catch (error) {
    return ApiErrorHandler.handle(error, requestId);
  }
}
