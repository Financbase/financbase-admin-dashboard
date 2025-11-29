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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const requestId = generateRequestId();
  try {
    const { userId, orgId } = await auth();
    if (!userId || !orgId) {
      return ApiErrorHandler.unauthorized();
    }

    const incidentId = parseInt(params.id);
    if (isNaN(incidentId)) {
      return ApiErrorHandler.badRequest('Invalid incident ID');
    }

    const incident = await DORAComplianceService.getIncidentById(incidentId);
    if (!incident) {
      return ApiErrorHandler.notFound('Incident not found');
    }

    if (incident.organizationId !== orgId) {
      return ApiErrorHandler.forbidden();
    }

    return NextResponse.json({ success: true, data: incident, requestId }, { status: 200 });
  } catch (error: any) {
    logger.error('Error fetching incident:', error);
    return ApiErrorHandler.handle(error, requestId);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const requestId = generateRequestId();
  try {
    const { userId, orgId } = await auth();
    if (!userId || !orgId) {
      return ApiErrorHandler.unauthorized();
    }

    const incidentId = parseInt(params.id);
    if (isNaN(incidentId)) {
      return ApiErrorHandler.badRequest('Invalid incident ID');
    }

    const incident = await DORAComplianceService.getIncidentById(incidentId);
    if (!incident) {
      return ApiErrorHandler.notFound('Incident not found');
    }

    if (incident.organizationId !== orgId) {
      return ApiErrorHandler.forbidden();
    }

    const body = await request.json();
    const {
      status,
      containedAt,
      resolvedAt,
      closedAt,
      responseActions,
      remediationSteps,
      reportedToAuthorities,
      authorityReportDetails,
      internalReportUrl,
    } = body;

    if (status) {
      await DORAComplianceService.updateIncidentStatus(incidentId, status, {
        containedAt: containedAt ? new Date(containedAt) : undefined,
        resolvedAt: resolvedAt ? new Date(resolvedAt) : undefined,
        closedAt: closedAt ? new Date(closedAt) : undefined,
        responseActions,
        remediationSteps,
        reportedToAuthorities,
        authorityReportDetails,
        internalReportUrl,
      });
    }

    const updatedIncident = await DORAComplianceService.getIncidentById(incidentId);
    return NextResponse.json({ success: true, data: updatedIncident, requestId }, { status: 200 });
  } catch (error: any) {
    logger.error('Error updating incident:', error);
    return ApiErrorHandler.handle(error, requestId);
  }
}

