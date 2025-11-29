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
import { SIEMIntegrationService } from '@/lib/services/monitoring/siem-integration-service';
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
    const event = await SIEMIntegrationService.ingestEvent(orgId, body);

    return NextResponse.json({ success: true, data: event, requestId }, { status: 201 });
  } catch (error: any) {
    logger.error('Error ingesting SIEM event:', error);
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
    const eventType = searchParams.get('eventType') || undefined;
    const severity = searchParams.get('severity') || undefined;
    const status = searchParams.get('status') || undefined;
    const dateFrom = searchParams.get('dateFrom') ? new Date(searchParams.get('dateFrom')!) : undefined;
    const dateTo = searchParams.get('dateTo') ? new Date(searchParams.get('dateTo')!) : undefined;
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    const events = await SIEMIntegrationService.getEvents(orgId, {
      eventType,
      severity,
      status,
      dateFrom,
      dateTo,
      limit,
      offset,
    });

    return NextResponse.json({ success: true, data: events, requestId }, { status: 200 });
  } catch (error: any) {
    logger.error('Error fetching SIEM events:', error);
    return ApiErrorHandler.handle(error, requestId);
  }
}

