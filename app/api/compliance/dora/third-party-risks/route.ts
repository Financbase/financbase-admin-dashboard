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

export async function POST(request: NextRequest) {
  const requestId = generateRequestId();
  try {
    const { userId, orgId } = await auth();
    if (!userId || !orgId) {
      return ApiErrorHandler.unauthorized();
    }

    const body = await request.json();
    const {
      providerName,
      providerType,
      providerContact,
      contractId,
      contractStartDate,
      contractEndDate,
      servicesProvided,
      criticalServices,
      riskLevel,
      riskScore,
      riskFactors,
      riskDescription,
      complianceCertifications,
      dataProcessingAgreement,
      securityAssessmentCompleted,
      lastSecurityAssessment,
      businessContinuityPlan,
      disasterRecoveryPlan,
      incidentResponsePlan,
      monitoringEnabled,
      monitoringFrequency,
      tags,
      metadata,
    } = body;

    if (!providerName || !providerType || !riskLevel) {
      return ApiErrorHandler.badRequest('Missing required fields');
    }

    const risk = await DORAComplianceService.assessThirdPartyRisk(orgId, {
      assessedBy: userId,
      providerName,
      providerType,
      providerContact,
      contractId,
      contractStartDate: contractStartDate ? new Date(contractStartDate) : undefined,
      contractEndDate: contractEndDate ? new Date(contractEndDate) : undefined,
      servicesProvided,
      criticalServices,
      riskLevel,
      riskScore,
      riskFactors,
      riskDescription,
      complianceCertifications,
      dataProcessingAgreement,
      securityAssessmentCompleted,
      lastSecurityAssessment: lastSecurityAssessment ? new Date(lastSecurityAssessment) : undefined,
      businessContinuityPlan,
      disasterRecoveryPlan,
      incidentResponsePlan,
      monitoringEnabled,
      monitoringFrequency,
      tags,
      metadata,
    });

    return NextResponse.json({ success: true, data: risk, requestId }, { status: 201 });
  } catch (error: any) {
    console.error('Error assessing third-party risk:', error);
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
    const isActive = searchParams.get('isActive') === 'true' ? true : searchParams.get('isActive') === 'false' ? false : undefined;
    const status = searchParams.get('status') || undefined;
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    const risks = await DORAComplianceService.getThirdPartyRisks(orgId, {
      riskLevel,
      isActive,
      status,
      limit,
      offset,
    });

    return NextResponse.json({ success: true, data: risks, requestId }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching third-party risks:', error);
    return ApiErrorHandler.handle(error, requestId);
  }
}

