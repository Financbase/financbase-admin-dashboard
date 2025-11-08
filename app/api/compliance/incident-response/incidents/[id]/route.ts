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

    const incident = await IncidentResponseService.getIncidentById(incidentId);
    if (!incident) {
      return ApiErrorHandler.notFound('Incident not found');
    }

    if (incident.organizationId !== orgId) {
      return ApiErrorHandler.forbidden();
    }

    return NextResponse.json({ success: true, data: incident, requestId }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching incident:', error);
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

    const incident = await IncidentResponseService.getIncidentById(incidentId);
    if (!incident) {
      return ApiErrorHandler.notFound('Incident not found');
    }

    if (incident.organizationId !== orgId) {
      return ApiErrorHandler.forbidden();
    }

    const body = await request.json();
    const {
      status,
      analyzedAt,
      containedAt,
      eradicatedAt,
      recoveredAt,
      closedAt,
      containmentActions,
      eradicationActions,
      recoveryActions,
      rootCause,
      contributingFactors,
      remediationPlan,
      lessonsLearned,
      followUpActions,
    } = body;

    if (status) {
      await IncidentResponseService.updateIncidentStatus(incidentId, status, {
        analyzedAt: analyzedAt ? new Date(analyzedAt) : undefined,
        containedAt: containedAt ? new Date(containedAt) : undefined,
        eradicatedAt: eradicatedAt ? new Date(eradicatedAt) : undefined,
        recoveredAt: recoveredAt ? new Date(recoveredAt) : undefined,
        closedAt: closedAt ? new Date(closedAt) : undefined,
        containmentActions,
        eradicationActions,
        recoveryActions,
        rootCause,
        contributingFactors,
        remediationPlan,
        lessonsLearned,
        followUpActions,
      });
    }

    const updatedIncident = await IncidentResponseService.getIncidentById(incidentId);
    return NextResponse.json({ success: true, data: updatedIncident, requestId }, { status: 200 });
  } catch (error: any) {
    console.error('Error updating incident:', error);
    return ApiErrorHandler.handle(error, requestId);
  }
}

