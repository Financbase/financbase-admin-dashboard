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
import { ComplianceService } from '@/lib/services/compliance-service';
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
      requestType,
      dataSubjectEmail,
      dataSubjectName,
      requestDescription,
      requestedDataTypes,
    } = body;

    if (!requestType || !dataSubjectEmail) {
      return ApiErrorHandler.badRequest('Missing required fields: requestType and dataSubjectEmail');
    }

    const validRequestTypes = ['access', 'deletion', 'portability', 'rectification', 'restriction', 'objection'];
    if (!validRequestTypes.includes(requestType)) {
      return ApiErrorHandler.badRequest(`Invalid request type. Must be one of: ${validRequestTypes.join(', ')}`);
    }

    const gdprRequest = await ComplianceService.createGDPRDataRequest(orgId, {
      requestType,
      dataSubjectEmail,
      dataSubjectName,
      requestDescription,
      requestedDataTypes,
    });

    return NextResponse.json({ success: true, data: gdprRequest, requestId }, { status: 201 });
  } catch (error: any) {
    logger.error('Error creating GDPR data request:', error);
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
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    const requests = await ComplianceService.getGDPRDataRequests(orgId, status, limit, offset);

    return NextResponse.json({ success: true, data: requests, requestId }, { status: 200 });
  } catch (error: any) {
    logger.error('Error fetching GDPR data requests:', error);
    return ApiErrorHandler.handle(error, requestId);
  }
}

