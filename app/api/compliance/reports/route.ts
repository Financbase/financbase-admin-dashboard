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

export async function GET(request: NextRequest) {
  const requestId = generateRequestId();
  try {
    const { userId, orgId } = await auth();
    if (!userId || !orgId) {
      return ApiErrorHandler.unauthorized();
    }

    const { searchParams } = new URL(request.url);
    const reportType = searchParams.get('reportType') || undefined;
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    const reports = await ComplianceService.getComplianceReports(orgId, reportType, limit, offset);

    return NextResponse.json({ success: true, data: reports, requestId }, { status: 200 });
  } catch (error: any) {
    logger.error('Error fetching compliance reports:', error);
    return ApiErrorHandler.handle(error, requestId);
  }
}

export async function POST(request: NextRequest) {
  const requestId = generateRequestId();
  try {
    const { userId, orgId } = await auth();
    if (!userId || !orgId) {
      return ApiErrorHandler.unauthorized();
    }

    const body = await request.json();
    const { reportType, filters } = body;

    if (!reportType) {
      return ApiErrorHandler.badRequest('Missing required field: reportType');
    }

    let report;

    switch (reportType) {
      case 'gdpr':
        report = await ComplianceService.generateGDPRReport(
          orgId,
          userId,
          filters || {}
        );
        break;
      case 'soc2':
        report = await ComplianceService.generateSOC2Report(
          orgId,
          userId,
          filters || {}
        );
        break;
      case 'dora':
        report = await ComplianceService.generateDORAReport(
          orgId,
          userId,
          filters || {}
        );
        break;
      case 'ai_governance':
        report = await ComplianceService.generateAIGovernanceReport(
          orgId,
          userId,
          filters || {}
        );
        break;
      case 'state_privacy':
        report = await ComplianceService.generateStatePrivacyReport(
          orgId,
          userId,
          filters || {}
        );
        break;
      case 'comprehensive':
        report = await ComplianceService.generateComprehensiveComplianceReport(
          orgId,
          userId,
          filters || {}
        );
        break;
      default:
        return ApiErrorHandler.badRequest(`Invalid report type: ${reportType}`);
    }

    return NextResponse.json({ success: true, data: report, requestId }, { status: 201 });
  } catch (error: any) {
    logger.error('Error generating compliance report:', error);
    return ApiErrorHandler.handle(error, requestId);
  }
}

