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
      objectives,
      scheduledDate,
      participants,
      observers,
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
      objectives,
      scheduledDate: new Date(scheduledDate),
      participants,
      observers,
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
    const status = searchParams.get('status');
    const drillType = searchParams.get('drillType');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    const drills = await IncidentResponseService.getDrills(orgId, {
      status: status || undefined,
      drillType: drillType || undefined,
      dateFrom: dateFrom ? new Date(dateFrom) : undefined,
      dateTo: dateTo ? new Date(dateTo) : undefined,
    });

    return NextResponse.json({ success: true, data: drills, requestId }, { status: 200 });
  } catch (error: any) {
    logger.error('Error getting drills:', error);
    return ApiErrorHandler.handle(error, requestId);
  }
}

