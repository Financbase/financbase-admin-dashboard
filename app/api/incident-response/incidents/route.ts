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
      incidentType,
      severity,
      title,
      description,
      detectedAt,
      affectedSystems,
      affectedData,
      tags,
      metadata,
    } = body;

    if (!incidentType || !severity || !title || !description) {
      return ApiErrorHandler.badRequest('Missing required fields: incidentType, severity, title, description');
    }

    const incident = await IncidentResponseService.createIncident(orgId, {
      reportedBy: userId,
      incidentType,
      severity,
      title,
      description,
      detectedAt: detectedAt ? new Date(detectedAt) : undefined,
      affectedSystems,
      affectedData,
      tags,
      metadata,
    });

    return NextResponse.json({ success: true, data: incident, requestId }, { status: 201 });
  } catch (error: any) {
    logger.error('Error creating incident:', error);
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
    const severity = searchParams.get('severity');
    const incidentType = searchParams.get('incidentType');
    const assignedTo = searchParams.get('assignedTo');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const limit = searchParams.get('limit');
    const offset = searchParams.get('offset');

    const incidents = await IncidentResponseService.getIncidents(orgId, {
      status: status || undefined,
      severity: severity || undefined,
      incidentType: incidentType || undefined,
      assignedTo: assignedTo || undefined,
      dateFrom: dateFrom ? new Date(dateFrom) : undefined,
      dateTo: dateTo ? new Date(dateTo) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
    });

    return NextResponse.json({ success: true, data: incidents, requestId }, { status: 200 });
  } catch (error: any) {
    logger.error('Error getting incidents:', error);
    return ApiErrorHandler.handle(error, requestId);
  }
}

