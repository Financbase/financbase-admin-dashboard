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
import { RiskAssessmentService } from '@/lib/services/risk-assessment-service';
import { ApiErrorHandler, generateRequestId } from '@/lib/api-error-handler';

export async function POST(request: NextRequest) {
  const requestId = generateRequestId();
  try {
    const { userId, orgId } = await auth();
    if (!userId || !orgId) {
      return ApiErrorHandler.unauthorized();
    }

    const body = await request.json();
    const risk = await RiskAssessmentService.createRisk(orgId, {
      identifiedBy: userId,
      ...body,
    });

    return NextResponse.json({ success: true, data: risk, requestId }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating risk:', error);
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
    const riskLevel = searchParams.get('riskLevel') || undefined;
    const status = searchParams.get('status') || undefined;
    const assetId = searchParams.get('assetId') ? parseInt(searchParams.get('assetId')!) : undefined;
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    const risks = await RiskAssessmentService.getRisks(orgId, {
      riskLevel,
      status,
      assetId,
      limit,
      offset,
    });

    return NextResponse.json({ success: true, data: risks, requestId }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching risks:', error);
    return ApiErrorHandler.handle(error, requestId);
  }
}

