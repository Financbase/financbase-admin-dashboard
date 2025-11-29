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
import { DORAComplianceService } from '@/lib/services/dora-compliance-service';
import { AIGovernanceService } from '@/lib/services/ai-governance-service';
import { StatePrivacyService } from '@/lib/services/state-privacy-service';
import { DataClassificationService } from '@/lib/services/data-classification-service';
import { ApiErrorHandler, generateRequestId } from '@/lib/api-error-handler';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  const requestId = generateRequestId();
  try {
    const { userId, orgId } = await auth();
    if (!userId || !orgId) {
      return ApiErrorHandler.unauthorized();
    }

    // Get recent compliance reports
    const recentReports = await ComplianceService.getComplianceReports(orgId, undefined, 10, 0);

    // Get operational resilience metrics
    const resilienceMetrics = await DORAComplianceService.trackOperationalResilience(orgId);

    // Get AI governance metrics
    const aiMetrics = await AIGovernanceService.trackModelPerformance(orgId);

    // Get state privacy compliance summary
    const statePrivacySummary = await StatePrivacyService.generateStateComplianceReport(orgId);

    // Get data classification summary
    const classificationSummary = await DataClassificationService.generateClassificationReport(orgId);

    // Get recent incidents
    const recentIncidents = await DORAComplianceService.getIncidents(orgId, {
      limit: 5,
    });

    // Get recent AI decisions
    const recentDecisions = await AIGovernanceService.getModelDecisions(orgId, {
      limit: 5,
    });

    const dashboard = {
      overview: {
        overallComplianceScore: resilienceMetrics.resilienceScore || 0,
        lastUpdated: new Date().toISOString(),
      },
      frameworks: {
        gdpr: {
          status: 'compliant',
          lastReport: recentReports.find(r => r.reportType === 'gdpr')?.generatedAt,
        },
        soc2: {
          status: 'compliant',
          lastReport: recentReports.find(r => r.reportType === 'soc2')?.generatedAt,
        },
        dora: {
          status: resilienceMetrics.resilienceScore && resilienceMetrics.resilienceScore >= 70 ? 'compliant' : 'needs_attention',
          resilienceScore: resilienceMetrics.resilienceScore,
          lastReport: recentReports.find(r => r.reportType === 'dora')?.generatedAt,
        },
        aiGovernance: {
          status: 'compliant',
          totalDecisions: aiMetrics.totalDecisions || 0,
          lastReport: recentReports.find(r => r.reportType === 'ai_governance')?.generatedAt,
        },
        statePrivacy: {
          status: statePrivacySummary.summary.compliantStates === statePrivacySummary.summary.totalStates ? 'compliant' : 'needs_attention',
          compliantStates: statePrivacySummary.summary.compliantStates,
          totalStates: statePrivacySummary.summary.totalStates,
          lastReport: recentReports.find(r => r.reportType === 'state_privacy')?.generatedAt,
        },
      },
      metrics: {
        operationalResilience: resilienceMetrics,
        aiGovernance: {
          totalDecisions: aiMetrics.totalDecisions || 0,
          averageConfidence: aiMetrics.averageConfidence || 0,
          totalTokensUsed: aiMetrics.totalTokensUsed || 0,
        },
        dataClassification: {
          totalClassifications: classificationSummary.summary.total,
          withPII: classificationSummary.summary.withPII,
          byLevel: classificationSummary.summary.byLevel,
        },
      },
      recentActivity: {
        incidents: recentIncidents.slice(0, 5),
        aiDecisions: recentDecisions.slice(0, 5),
        reports: recentReports.slice(0, 5),
      },
      alerts: [], // Can be populated by compliance monitoring service
    };

    return NextResponse.json({ success: true, data: dashboard, requestId }, { status: 200 });
  } catch (error: any) {
    logger.error('Error fetching compliance dashboard:', error);
    return ApiErrorHandler.handle(error, requestId);
  }
}

