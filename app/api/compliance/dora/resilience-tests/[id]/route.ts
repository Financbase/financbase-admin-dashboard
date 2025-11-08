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

    const testId = parseInt(params.id);
    if (isNaN(testId)) {
      return ApiErrorHandler.badRequest('Invalid test ID');
    }

    const test = await DORAComplianceService.getResilienceTestById(testId);
    if (!test) {
      return ApiErrorHandler.notFound('Resilience test not found');
    }

    if (test.organizationId !== orgId) {
      return ApiErrorHandler.forbidden();
    }

    return NextResponse.json({ success: true, data: test, requestId }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching resilience test:', error);
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

    const testId = parseInt(params.id);
    if (isNaN(testId)) {
      return ApiErrorHandler.badRequest('Invalid test ID');
    }

    const test = await DORAComplianceService.getResilienceTestById(testId);
    if (!test) {
      return ApiErrorHandler.notFound('Resilience test not found');
    }

    if (test.organizationId !== orgId) {
      return ApiErrorHandler.forbidden();
    }

    const body = await request.json();
    const {
      status,
      startDate,
      endDate,
      completedDate,
      testResults,
      vulnerabilitiesFound,
      vulnerabilitiesCritical,
      vulnerabilitiesHigh,
      vulnerabilitiesMedium,
      vulnerabilitiesLow,
      findings,
      recommendations,
      remediationPlan,
      reportUrl,
      reportGeneratedAt,
    } = body;

    await DORAComplianceService.updateResilienceTest(testId, {
      status,
      executedBy: status === 'in_progress' || status === 'completed' ? userId : undefined,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      completedDate: completedDate ? new Date(completedDate) : undefined,
      testResults,
      vulnerabilitiesFound,
      vulnerabilitiesCritical,
      vulnerabilitiesHigh,
      vulnerabilitiesMedium,
      vulnerabilitiesLow,
      findings,
      recommendations,
      remediationPlan,
      reportUrl,
      reportGeneratedAt: reportGeneratedAt ? new Date(reportGeneratedAt) : undefined,
    });

    const updatedTest = await DORAComplianceService.getResilienceTestById(testId);
    return NextResponse.json({ success: true, data: updatedTest, requestId }, { status: 200 });
  } catch (error: any) {
    console.error('Error updating resilience test:', error);
    return ApiErrorHandler.handle(error, requestId);
  }
}

