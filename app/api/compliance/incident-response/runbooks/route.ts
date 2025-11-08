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
      procedures,
      checklists,
      escalationPaths,
      communicationTemplates,
      toolsAndResources,
      reviewFrequency,
      tags,
      metadata,
    } = body;

    if (!title || !incidentType || !severity || !procedures || !Array.isArray(procedures)) {
      return ApiErrorHandler.badRequest('Missing required fields: title, incidentType, severity, procedures');
    }

    const runbook = await IncidentResponseService.createRunbook(orgId, {
      createdBy: userId,
      title,
      description,
      incidentType,
      severity,
      procedures,
      checklists,
      escalationPaths,
      communicationTemplates,
      toolsAndResources,
      reviewFrequency,
      tags,
      metadata,
    });

    return NextResponse.json({ success: true, data: runbook, requestId }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating runbook:', error);
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
    const incidentType = searchParams.get('incidentType') || undefined;
    const severity = searchParams.get('severity') || undefined;
    const status = searchParams.get('status') || undefined;

    const runbooks = await IncidentResponseService.getRunbooks(orgId, {
      incidentType,
      severity,
      status,
    });

    return NextResponse.json({ success: true, data: runbooks, requestId }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching runbooks:', error);
    return ApiErrorHandler.handle(error, requestId);
  }
}

