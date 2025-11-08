/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { DORAComplianceService } from './dora-compliance-service';
import { AIGovernanceService } from './ai-governance-service';
import { StatePrivacyService } from './state-privacy-service';
import { DataClassificationService } from './data-classification-service';

export interface ComplianceAlert {
  id: string;
  organizationId: string;
  alertType: 'compliance_violation' | 'compliance_warning' | 'compliance_info' | 'deadline_approaching' | 'non_compliance';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  framework: 'gdpr' | 'soc2' | 'dora' | 'ai_governance' | 'state_privacy' | 'general';
  affectedSystems?: string[];
  actionRequired: boolean;
  actionItems?: string[];
  deadline?: Date;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  createdAt: Date;
  metadata: Record<string, any>;
}

export class ComplianceMonitoringService {
  /**
   * Monitor DORA compliance
   */
  static async monitorDORACompliance(organizationId: string): Promise<ComplianceAlert[]> {
    const alerts: ComplianceAlert[] = [];

    try {
      const resilienceMetrics = await DORAComplianceService.trackOperationalResilience(organizationId);
      const incidents = await DORAComplianceService.getIncidents(organizationId, {
        status: 'detected',
        limit: 100,
      });

      // Check resilience score
      if (resilienceMetrics.resilienceScore < 70) {
        alerts.push({
          id: `dora-resilience-${Date.now()}`,
          organizationId,
          alertType: 'compliance_warning',
          severity: 'high',
          title: 'Low Operational Resilience Score',
          description: `Operational resilience score is ${resilienceMetrics.resilienceScore}%, below the recommended threshold of 70%.`,
          framework: 'dora',
          actionRequired: true,
          actionItems: [
            'Review recent ICT incidents',
            'Schedule additional resilience tests',
            'Assess third-party risks',
          ],
          acknowledged: false,
          createdAt: new Date(),
          metadata: { resilienceScore: resilienceMetrics.resilienceScore },
        });
      }

      // Check for critical incidents
      const criticalIncidents = incidents.filter(i => i.severity === 'critical' && i.status !== 'resolved' && i.status !== 'closed');
      if (criticalIncidents.length > 0) {
        alerts.push({
          id: `dora-critical-incidents-${Date.now()}`,
          organizationId,
          alertType: 'compliance_violation',
          severity: 'critical',
          title: `${criticalIncidents.length} Critical ICT Incident(s) Unresolved`,
          description: `There are ${criticalIncidents.length} critical ICT incident(s) that require immediate attention.`,
          framework: 'dora',
          affectedSystems: criticalIncidents.flatMap(i => i.affectedSystems),
          actionRequired: true,
          actionItems: [
            'Review and resolve critical incidents immediately',
            'Update incident response procedures if needed',
          ],
          acknowledged: false,
          createdAt: new Date(),
          metadata: { incidentCount: criticalIncidents.length },
        });
      }

      // Check for overdue resilience tests
      const tests = await DORAComplianceService.getResilienceTests(organizationId, {
        status: 'scheduled',
        limit: 100,
      });

      const now = new Date();
      const overdueTests = tests.filter(t => t.scheduledDate < now);
      if (overdueTests.length > 0) {
        alerts.push({
          id: `dora-overdue-tests-${Date.now()}`,
          organizationId,
          alertType: 'deadline_approaching',
          severity: 'medium',
          title: `${overdueTests.length} Overdue Resilience Test(s)`,
          description: `There are ${overdueTests.length} resilience test(s) that are overdue.`,
          framework: 'dora',
          actionRequired: true,
          actionItems: [
            'Reschedule or complete overdue tests',
            'Update test schedule',
          ],
          deadline: overdueTests[0].scheduledDate,
          acknowledged: false,
          createdAt: new Date(),
          metadata: { overdueCount: overdueTests.length },
        });
      }
    } catch (error) {
      console.error('Error monitoring DORA compliance:', error);
    }

    return alerts;
  }

  /**
   * Monitor AI governance compliance
   */
  static async monitorAIGovernance(organizationId: string): Promise<ComplianceAlert[]> {
    const alerts: ComplianceAlert[] = [];

    try {
      const auditData = await AIGovernanceService.auditModelUsage(organizationId);

      // Check compliance score
      if (auditData.complianceScore !== undefined && auditData.complianceScore < 70) {
        alerts.push({
          id: `ai-governance-compliance-${Date.now()}`,
          organizationId,
          alertType: 'compliance_warning',
          severity: 'high',
          title: 'Low AI Governance Compliance Score',
          description: `AI governance compliance score is ${auditData.complianceScore}%, below the recommended threshold of 70%.`,
          framework: 'ai_governance',
          actionRequired: true,
          actionItems: [
            'Increase bias checking coverage',
            'Improve decision explainability',
            'Review GDPR relevance of AI decisions',
          ],
          acknowledged: false,
          createdAt: new Date(),
          metadata: { complianceScore: auditData.complianceScore },
        });
      }

      // Check for decisions without bias checks
      const totalDecisions = auditData.totalDecisions || 0;
      const biasCheckedDecisions = auditData.biasCheckedDecisions || 0;
      const biasCheckCoverage = totalDecisions > 0 ? (biasCheckedDecisions / totalDecisions) * 100 : 100;

      if (biasCheckCoverage < 50 && totalDecisions > 10) {
        alerts.push({
          id: `ai-governance-bias-coverage-${Date.now()}`,
          organizationId,
          alertType: 'compliance_warning',
          severity: 'medium',
          title: 'Low Bias Check Coverage',
          description: `Only ${Math.round(biasCheckCoverage)}% of AI decisions have been checked for bias.`,
          framework: 'ai_governance',
          actionRequired: true,
          actionItems: [
            'Implement automated bias checking',
            'Review high-risk decisions manually',
          ],
          acknowledged: false,
          createdAt: new Date(),
          metadata: {
            totalDecisions,
            biasCheckedDecisions,
            coverage: biasCheckCoverage,
          },
        });
      }
    } catch (error) {
      console.error('Error monitoring AI governance:', error);
    }

    return alerts;
  }

  /**
   * Monitor data privacy compliance
   */
  static async monitorDataPrivacy(organizationId: string): Promise<ComplianceAlert[]> {
    const alerts: ComplianceAlert[] = [];

    try {
      const statePrivacySummary = await StatePrivacyService.generateStateComplianceReport(organizationId);

      // Check for non-compliant states
      const nonCompliantStates = statePrivacySummary.records.filter(r => !r.isCompliant);
      if (nonCompliantStates.length > 0) {
        alerts.push({
          id: `state-privacy-non-compliant-${Date.now()}`,
          organizationId,
          alertType: 'non_compliance',
          severity: 'high',
          title: `${nonCompliantStates.length} State(s) Non-Compliant`,
          description: `The following states are not compliant: ${nonCompliantStates.map(s => s.stateCode).join(', ')}.`,
          framework: 'state_privacy',
          actionRequired: true,
          actionItems: nonCompliantStates.flatMap(s => s.actionItems || []),
          acknowledged: false,
          createdAt: new Date(),
          metadata: {
            nonCompliantStates: nonCompliantStates.map(s => ({
              state: s.stateCode,
              complianceScore: s.complianceScore,
            })),
          },
        });
      }

      // Check for upcoming assessments
      const upcomingAssessments = statePrivacySummary.records.filter(r => {
        if (!r.nextAssessment) return false;
        const daysUntil = (r.nextAssessment.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
        return daysUntil > 0 && daysUntil <= 30;
      });

      if (upcomingAssessments.length > 0) {
        alerts.push({
          id: `state-privacy-upcoming-assessment-${Date.now()}`,
          organizationId,
          alertType: 'deadline_approaching',
          severity: 'medium',
          title: `${upcomingAssessments.length} State Privacy Assessment(s) Due Soon`,
          description: `State privacy assessments are due within 30 days for ${upcomingAssessments.length} state(s).`,
          framework: 'state_privacy',
          actionRequired: true,
          actionItems: [
            'Schedule compliance assessments',
            'Review current compliance status',
          ],
          deadline: upcomingAssessments[0].nextAssessment,
          acknowledged: false,
          createdAt: new Date(),
          metadata: {
            upcomingCount: upcomingAssessments.length,
          },
        });
      }
    } catch (error) {
      console.error('Error monitoring data privacy:', error);
    }

    return alerts;
  }

  /**
   * Generate compliance alerts
   */
  static async generateComplianceAlerts(organizationId: string): Promise<ComplianceAlert[]> {
    const allAlerts: ComplianceAlert[] = [];

    // Monitor all compliance frameworks
    const doraAlerts = await this.monitorDORACompliance(organizationId);
    const aiAlerts = await this.monitorAIGovernance(organizationId);
    const privacyAlerts = await this.monitorDataPrivacy(organizationId);

    allAlerts.push(...doraAlerts, ...aiAlerts, ...privacyAlerts);

    // Sort by severity and date
    allAlerts.sort((a, b) => {
      const severityOrder: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1 };
      const severityDiff = severityOrder[b.severity] - severityOrder[a.severity];
      if (severityDiff !== 0) return severityDiff;
      return b.createdAt.getTime() - a.createdAt.getTime();
    });

    return allAlerts;
  }

  /**
   * Get real-time compliance status
   */
  static async getComplianceStatus(organizationId: string): Promise<Record<string, any>> {
    try {
      const alerts = await this.generateComplianceAlerts(organizationId);
      const criticalAlerts = alerts.filter(a => a.severity === 'critical');
      const highAlerts = alerts.filter(a => a.severity === 'high');
      const unacknowledgedAlerts = alerts.filter(a => !a.acknowledged);

      const resilienceMetrics = await DORAComplianceService.trackOperationalResilience(organizationId);
      const aiAudit = await AIGovernanceService.auditModelUsage(organizationId);
      const statePrivacy = await StatePrivacyService.generateStateComplianceReport(organizationId);

      return {
        overallStatus: criticalAlerts.length > 0 ? 'critical' : highAlerts.length > 0 ? 'warning' : 'healthy',
        alerts: {
          total: alerts.length,
          critical: criticalAlerts.length,
          high: highAlerts.length,
          unacknowledged: unacknowledgedAlerts.length,
        },
        frameworks: {
          dora: {
            status: resilienceMetrics.resilienceScore && resilienceMetrics.resilienceScore >= 70 ? 'compliant' : 'needs_attention',
            score: resilienceMetrics.resilienceScore,
          },
          aiGovernance: {
            status: aiAudit.complianceScore && aiAudit.complianceScore >= 70 ? 'compliant' : 'needs_attention',
            score: aiAudit.complianceScore,
          },
          statePrivacy: {
            status: statePrivacy.summary.compliantStates === statePrivacy.summary.totalStates ? 'compliant' : 'needs_attention',
            compliantStates: statePrivacy.summary.compliantStates,
            totalStates: statePrivacy.summary.totalStates,
          },
        },
        recentAlerts: alerts.slice(0, 10),
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error getting compliance status:', error);
      throw new Error('Failed to get compliance status');
    }
  }
}

