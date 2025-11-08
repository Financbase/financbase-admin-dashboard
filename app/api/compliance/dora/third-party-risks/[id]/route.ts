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
import { DORAComplianceService } from '@/lib/services/dora-compliance-service';
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

    const riskId = parseInt(params.id);
    if (isNaN(riskId)) {
      return ApiErrorHandler.badRequest('Invalid risk ID');
    }

    const risk = await DORAComplianceService.getThirdPartyRiskById(riskId);
    if (!risk) {
      return ApiErrorHandler.notFound('Third-party risk not found');
    }

    if (risk.organizationId !== orgId) {
      return ApiErrorHandler.forbidden();
    }

    return NextResponse.json({ success: true, data: risk, requestId }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching third-party risk:', error);
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

    const riskId = parseInt(params.id);
    if (isNaN(riskId)) {
      return ApiErrorHandler.badRequest('Invalid risk ID');
    }

    const risk = await DORAComplianceService.getThirdPartyRiskById(riskId);
    if (!risk) {
      return ApiErrorHandler.notFound('Third-party risk not found');
    }

    if (risk.organizationId !== orgId) {
      return ApiErrorHandler.forbidden();
    }

    const body = await request.json();
    const {
      riskLevel,
      riskScore,
      riskFactors,
      riskDescription,
      securityAssessmentCompleted,
      lastSecurityAssessment,
      nextReviewDate,
      isActive,
      status,
      notes,
    } = body;

    await DORAComplianceService.updateThirdPartyRisk(riskId, {
      riskLevel,
      riskScore,
      riskFactors,
      riskDescription,
      securityAssessmentCompleted,
      lastSecurityAssessment: lastSecurityAssessment ? new Date(lastSecurityAssessment) : undefined,
      nextReviewDate: nextReviewDate ? new Date(nextReviewDate) : undefined,
      isActive,
      status,
      notes,
    });

    const updatedRisk = await DORAComplianceService.getThirdPartyRiskById(riskId);
    return NextResponse.json({ success: true, data: updatedRisk, requestId }, { status: 200 });
  } catch (error: any) {
    console.error('Error updating third-party risk:', error);
    return ApiErrorHandler.handle(error, requestId);
  }
}

