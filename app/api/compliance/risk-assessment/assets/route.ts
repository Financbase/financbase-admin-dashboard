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
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  const requestId = generateRequestId();
  try {
    const { userId, orgId } = await auth();
    if (!userId || !orgId) {
      return ApiErrorHandler.unauthorized();
    }

    const body = await request.json();
    const asset = await RiskAssessmentService.createAsset(orgId, {
      createdBy: userId,
      ...body,
    });

    return NextResponse.json({ success: true, data: asset, requestId }, { status: 201 });
  } catch (error: any) {
    logger.error('Error creating asset:', error);
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
    const assetType = searchParams.get('assetType') || undefined;
    const isActive = searchParams.get('isActive') === 'true' ? true : searchParams.get('isActive') === 'false' ? false : undefined;

    const assets = await RiskAssessmentService.getAssets(orgId, {
      assetType,
      isActive,
    });

    return NextResponse.json({ success: true, data: assets, requestId }, { status: 200 });
  } catch (error: any) {
    logger.error('Error fetching assets:', error);
    return ApiErrorHandler.handle(error, requestId);
  }
}

