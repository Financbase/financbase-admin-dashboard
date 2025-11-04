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
import { AuditService } from '@/lib/services/audit-service';
import { ApiErrorHandler, generateRequestId } from '@/lib/api-error-handler';

export async function GET(request: NextRequest) {
  const requestId = generateRequestId();
  try {
    const { userId } = await auth();
    if (!userId) {
      return ApiErrorHandler.unauthorized();
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const eventType = searchParams.get('eventType') || '';
    const riskLevel = searchParams.get('riskLevel') || '';
    const dateRange = searchParams.get('dateRange') || '7d';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Calculate date range
    const now = new Date();
    let dateFrom: Date | undefined;
    
    switch (dateRange) {
      case '1d':
        dateFrom = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        dateFrom = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        dateFrom = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        dateFrom = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        dateFrom = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
    }

    const filters = {
      userId,
      eventType: eventType || undefined,
      riskLevel: riskLevel || undefined,
      dateFrom,
      dateTo: now,
    };

    const offset = (page - 1) * limit;
    const auditLogs = await AuditService.getAuditLogs(filters, limit, offset);

    // Get total count for pagination
    const totalLogs = await AuditService.getAuditLogs(filters, 10000, 0);
    const total = totalLogs.length;
    const hasMore = offset + limit < total;

    return NextResponse.json({
      data: auditLogs,
      total,
      page,
      limit,
      hasMore,
    });
  } catch (error) {
    return ApiErrorHandler.handle(error, requestId);
  }
}
