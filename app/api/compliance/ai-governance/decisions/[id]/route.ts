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

    const decisionId = parseInt(params.id);
    if (isNaN(decisionId)) {
      return ApiErrorHandler.badRequest('Invalid decision ID');
    }

    const decision = await AIGovernanceService.getModelDecisionById(decisionId);
    if (!decision) {
      return ApiErrorHandler.notFound('Decision not found');
    }

    if (decision.organizationId !== orgId) {
      return ApiErrorHandler.forbidden();
    }

    // Get explainability report
    const explainabilityReport = await AIGovernanceService.generateExplainabilityReport(decisionId);

    return NextResponse.json({
      success: true,
      data: {
        ...decision,
        explainabilityReport,
      },
      requestId,
    }, { status: 200 });
  } catch (error: any) {
    logger.error('Error fetching AI decision:', error);
    return ApiErrorHandler.handle(error, requestId);
  }
}

