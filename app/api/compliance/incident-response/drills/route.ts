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
import { IncidentResponseService } from '@/lib/services/incident-response-service';
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
      drillName,
      drillType,
      scenario,
      scheduledDate,
      participants,
      observers,
      objectives,
      tags,
    } = body;

    if (!drillName || !drillType || !scenario || !scheduledDate) {
      return ApiErrorHandler.badRequest('Missing required fields: drillName, drillType, scenario, scheduledDate');
    }

    const drill = await IncidentResponseService.scheduleDrill(orgId, {
      scheduledBy: userId,
      drillName,
      drillType,
      scenario,
      scheduledDate: new Date(scheduledDate),
      participants,
      observers,
      objectives,
      tags,
    });

    return NextResponse.json({ success: true, data: drill, requestId }, { status: 201 });
  } catch (error: any) {
    logger.error('Error scheduling drill:', error);
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
    const drillType = searchParams.get('drillType') || undefined;
    const dateFrom = searchParams.get('dateFrom') ? new Date(searchParams.get('dateFrom')!) : undefined;
    const dateTo = searchParams.get('dateTo') ? new Date(searchParams.get('dateTo')!) : undefined;

    const drills = await IncidentResponseService.getDrills(orgId, {
      status,
      drillType,
      dateFrom,
      dateTo,
    });

    return NextResponse.json({ success: true, data: drills, requestId }, { status: 200 });
  } catch (error: any) {
    logger.error('Error fetching drills:', error);
    return ApiErrorHandler.handle(error, requestId);
  }
}

