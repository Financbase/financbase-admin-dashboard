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
      name,
      templateType,
      subject,
      body: templateBody,
      placeholders,
      incidentType,
      severity,
      audience,
      tags,
    } = body;

    if (!name || !templateType || !templateBody || !audience) {
      return ApiErrorHandler.badRequest('Missing required fields: name, templateType, body, audience');
    }

    const template = await IncidentResponseService.createCommunicationTemplate(orgId, {
      createdBy: userId,
      name,
      templateType,
      subject,
      body: templateBody,
      placeholders,
      incidentType,
      severity,
      audience,
      tags,
    });

    return NextResponse.json({ success: true, data: template, requestId }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating communication template:', error);
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
    const templateType = searchParams.get('templateType') || undefined;
    const incidentType = searchParams.get('incidentType') || undefined;
    const severity = searchParams.get('severity') || undefined;
    const audience = searchParams.get('audience') || undefined;

    const templates = await IncidentResponseService.getCommunicationTemplates(orgId, {
      templateType,
      incidentType,
      severity,
      audience,
    });

    return NextResponse.json({ success: true, data: templates, requestId }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching communication templates:', error);
    return ApiErrorHandler.handle(error, requestId);
  }
}

