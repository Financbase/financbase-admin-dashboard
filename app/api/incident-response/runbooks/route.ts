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
      name,
      description,
      incidentType,
      severity,
      detectionProcedures,
      triageProcedures,
      containmentProcedures,
      eradicationProcedures,
      recoveryProcedures,
      communicationTemplates,
      escalationCriteria,
      escalationContacts,
      tools,
      references,
      tags,
    } = body;

    if (!name || !incidentType) {
      return ApiErrorHandler.badRequest('Missing required fields: name, incidentType');
    }

    const runbook = await IncidentResponseService.createRunbook(orgId, {
      createdBy: userId,
      name,
      description,
      incidentType,
      severity,
      detectionProcedures,
      triageProcedures,
      containmentProcedures,
      eradicationProcedures,
      recoveryProcedures,
      communicationTemplates,
      escalationCriteria,
      escalationContacts,
      tools,
      references,
      tags,
    });

    return NextResponse.json({ success: true, data: runbook, requestId }, { status: 201 });
  } catch (error: any) {
    logger.error('Error creating runbook:', error);
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
    const incidentType = searchParams.get('incidentType');
    const severity = searchParams.get('severity');
    const isActive = searchParams.get('isActive');

    const runbooks = await IncidentResponseService.getRunbooks(orgId, {
      incidentType: incidentType || undefined,
      severity: severity || undefined,
      isActive: isActive ? isActive === 'true' : undefined,
    });

    return NextResponse.json({ success: true, data: runbooks, requestId }, { status: 200 });
  } catch (error: any) {
    logger.error('Error getting runbooks:', error);
    return ApiErrorHandler.handle(error, requestId);
  }
}

