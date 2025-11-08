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
import { AIGovernanceService } from '@/lib/services/ai-governance-service';
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

    const checkId = parseInt(params.id);
    if (isNaN(checkId)) {
      return ApiErrorHandler.badRequest('Invalid bias check ID');
    }

    const check = await AIGovernanceService.getBiasCheckById(checkId);
    if (!check) {
      return ApiErrorHandler.notFound('Bias check not found');
    }

    if (check.organizationId !== orgId) {
      return ApiErrorHandler.forbidden();
    }

    return NextResponse.json({ success: true, data: check, requestId }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching bias check:', error);
    return ApiErrorHandler.handle(error, requestId);
  }
}

