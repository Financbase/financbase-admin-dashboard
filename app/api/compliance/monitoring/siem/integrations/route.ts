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

export async function POST(request: NextRequest) {
  const requestId = generateRequestId();
  try {
    const { userId, orgId } = await auth();
    if (!userId || !orgId) {
      return ApiErrorHandler.unauthorized();
    }

    const body = await request.json();
    const integration = await SIEMIntegrationService.createIntegration(orgId, {
      createdBy: userId,
      ...body,
    });

    return NextResponse.json({ success: true, data: integration, requestId }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating SIEM integration:', error);
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

    const integrations = await SIEMIntegrationService.getIntegrations(orgId);

    return NextResponse.json({ success: true, data: integrations, requestId }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching SIEM integrations:', error);
    return ApiErrorHandler.handle(error, requestId);
  }
}

