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
      title,
      description,
      incidentType,
      severity,
      detectedAt,
      affectedSystems,
      affectedServices,
      affectedUsers,
      dataAffected,
      dataTypesAffected,
      financialImpact,
      businessImpact,
      tags,
      metadata,
    } = body;

    if (!title || !description || !incidentType || !severity) {
      return ApiErrorHandler.badRequest('Missing required fields: title, description, incidentType, severity');
    }

    const incident = await IncidentResponseService.createIncident(orgId, {
      reportedBy: userId,
      title,
      description,
      incidentType,
      severity,
      detectedAt: detectedAt ? new Date(detectedAt) : undefined,
      affectedSystems: affectedSystems || [],
      affectedData: dataTypesAffected || [],
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
    const status = searchParams.get('status') || undefined;
    const severity = searchParams.get('severity') || undefined;
    const incidentType = searchParams.get('incidentType') || undefined;
    const dateFrom = searchParams.get('dateFrom') ? new Date(searchParams.get('dateFrom')!) : undefined;
    const dateTo = searchParams.get('dateTo') ? new Date(searchParams.get('dateTo')!) : undefined;
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    const incidents = await IncidentResponseService.getIncidents(orgId, {
      status,
      severity,
      incidentType,
      dateFrom,
      dateTo,
      limit,
      offset,
    });

    return NextResponse.json({ success: true, data: incidents, requestId }, { status: 200 });
  } catch (error: any) {
    logger.error('Error fetching incidents:', error);
    return ApiErrorHandler.handle(error, requestId);
  }
}

