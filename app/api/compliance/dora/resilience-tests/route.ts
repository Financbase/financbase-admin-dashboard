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
import { DORAComplianceService } from '@/lib/services/dora-compliance-service';
import { ApiErrorHandler, generateRequestId } from '@/lib/api-error-handler';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  const requestId = generateRequestId();
  try {
    const { userId, orgId } = await auth();
    if (!userId || !orgId) {
      return ApiErrorHandler.unauthorized();
    }

    const body = await request.json();
    const {
      testName,
      testDescription,
      testType,
      testScope,
      criticalFunctions,
      scheduledDate,
      tags,
      metadata,
    } = body;

    if (!testName || !testType || !scheduledDate) {
      return ApiErrorHandler.badRequest('Missing required fields');
    }

    const test = await DORAComplianceService.scheduleResilienceTest(orgId, {
      scheduledBy: userId,
      testName,
      testDescription,
      testType,
      testScope,
      criticalFunctions,
      scheduledDate: new Date(scheduledDate),
      tags,
      metadata,
    });

    return NextResponse.json({ success: true, data: test, requestId }, { status: 201 });
  } catch (error: any) {
    logger.error('Error scheduling resilience test:', error);
    return ApiErrorHandler.handle(error, requestId);
  }
}

export async function GET(request: NextRequest) {
  const requestId = generateRequestId();
  try {
    const { userId, orgId } = await auth();
    if (!userId || !orgId) {
      return ApiErrorHandler.unauthorized();
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;
    const testType = searchParams.get('testType') || undefined;
    const dateFrom = searchParams.get('dateFrom') ? new Date(searchParams.get('dateFrom')!) : undefined;
    const dateTo = searchParams.get('dateTo') ? new Date(searchParams.get('dateTo')!) : undefined;
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    const tests = await DORAComplianceService.getResilienceTests(orgId, {
      status,
      testType,
      dateFrom,
      dateTo,
      limit,
      offset,
    });

    return NextResponse.json({ success: true, data: tests, requestId }, { status: 200 });
  } catch (error: any) {
    logger.error('Error fetching resilience tests:', error);
    return ApiErrorHandler.handle(error, requestId);
  }
}

