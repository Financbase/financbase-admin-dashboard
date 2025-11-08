/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { db } from '@/lib/db';
import {
  statePrivacyCompliance,
} from '@/lib/db/schemas';
import { eq, and, desc } from 'drizzle-orm';

export interface StatePrivacyCompliance {
  id: number;
  organizationId: string;
  managedBy?: string;
  stateLaw: 'cpra' | 'ccpa' | 'vcdpa' | 'ctdpa' | 'cdpa' | 'ucpa' | 'tdpa' | 'mcdpa' | 'idpa' | 'tdpa_tennessee' | 'odpa';
  stateCode: string;
  isCompliant: boolean;
  complianceScore?: number;
  lastAssessment?: Date;
  nextAssessment?: Date;
  requirements: string[];
  requirementsMet: string[];
  requirementsPending: string[];
  supportsDataSubjectRights: boolean;
  dataSubjectRights: string[];
  consentManagementEnabled: boolean;
  consentTrackingEnabled: boolean;
  dataProcessingAgreements: any[];
  dataSharingAgreements: any[];
  privacyPolicyUrl?: string;
  privacyPolicyLastUpdated?: Date;
  privacyPolicyCompliant: boolean;
  breachNotificationProcess: boolean;
  breachNotificationTimeline?: number;
  auditLoggingEnabled: boolean;
  reportingEnabled: boolean;
  lastReportGenerated?: Date;
  findings: any[];
  actionItems: any[];
  remediationPlan?: any;
  status: string;
  notes?: string;
  tags: string[];
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

// State privacy law requirements
const STATE_REQUIREMENTS: Record<string, string[]> = {
  cpra: [
    'right_to_know',
    'right_to_delete',
    'right_to_correct',
    'right_to_opt_out',
    'right_to_limit',
    'right_to_nondiscrimination',
    'right_to_portability',
    'opt_in_for_minors',
    'do_not_sell_my_data',
    'sensitive_personal_information_protection',
  ],
  ccpa: [
    'right_to_know',
    'right_to_delete',
    'right_to_opt_out',
    'right_to_nondiscrimination',
    'do_not_sell_my_data',
  ],
  vcdpa: [
    'right_to_access',
    'right_to_delete',
    'right_to_correct',
    'right_to_opt_out',
    'right_to_portability',
    'right_to_nondiscrimination',
  ],
  ctdpa: [
    'right_to_access',
    'right_to_delete',
    'right_to_correct',
    'right_to_opt_out',
    'right_to_portability',
    'right_to_nondiscrimination',
  ],
  cdpa: [
    'right_to_access',
    'right_to_delete',
    'right_to_correct',
    'right_to_opt_out',
    'right_to_portability',
    'right_to_nondiscrimination',
  ],
  ucpa: [
    'right_to_access',
    'right_to_delete',
    'right_to_opt_out',
    'right_to_portability',
    'right_to_nondiscrimination',
  ],
  tdpa: [
    'right_to_access',
    'right_to_delete',
    'right_to_correct',
    'right_to_opt_out',
    'right_to_portability',
    'right_to_nondiscrimination',
  ],
  mcdpa: [
    'right_to_access',
    'right_to_delete',
    'right_to_correct',
    'right_to_opt_out',
    'right_to_portability',
    'right_to_nondiscrimination',
  ],
  idpa: [
    'right_to_access',
    'right_to_delete',
    'right_to_opt_out',
    'right_to_portability',
    'right_to_nondiscrimination',
  ],
  tdpa_tennessee: [
    'right_to_access',
    'right_to_delete',
    'right_to_correct',
    'right_to_opt_out',
    'right_to_portability',
    'right_to_nondiscrimination',
  ],
  odpa: [
    'right_to_access',
    'right_to_delete',
    'right_to_correct',
    'right_to_opt_out',
    'right_to_portability',
    'right_to_nondiscrimination',
  ],
};

const STATE_CODES: Record<string, string> = {
  cpra: 'CA',
  ccpa: 'CA',
  vcdpa: 'VA',
  ctdpa: 'CT',
  cdpa: 'CO',
  ucpa: 'UT',
  tdpa: 'TX',
  mcdpa: 'MT',
  idpa: 'IA',
  tdpa_tennessee: 'TN',
  odpa: 'OR',
};

export class StatePrivacyService {
  /**
   * Check CPRA compliance
   */
  static async checkCPRACompliance(
    organizationId: string
  ): Promise<StatePrivacyCompliance> {
    return this.checkStatePrivacyLaws(organizationId, 'cpra');
  }

  /**
   * Check state privacy laws compliance
   */
  static async checkStatePrivacyLaws(
    organizationId: string,
    stateLaw: StatePrivacyCompliance['stateLaw']
  ): Promise<StatePrivacyCompliance> {
    try {
      // Check if compliance record exists
      const existing = await db
        .select()
        .from(statePrivacyCompliance)
        .where(
          and(
            eq(statePrivacyCompliance.organizationId, organizationId),
            eq(statePrivacyCompliance.stateLaw, stateLaw)
          )
        )
        .limit(1);

      const requirements = STATE_REQUIREMENTS[stateLaw] || [];
      const stateCode = STATE_CODES[stateLaw] || '';

      // Perform compliance assessment
      const assessment = await this.performComplianceAssessment(organizationId, stateLaw, requirements);

      if (existing[0]) {
        // Update existing record
        await db
          .update(statePrivacyCompliance)
          .set({
            isCompliant: assessment.isCompliant,
            complianceScore: assessment.complianceScore,
            lastAssessment: new Date(),
            nextAssessment: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // Next assessment in 90 days
            requirements,
            requirementsMet: assessment.requirementsMet,
            requirementsPending: assessment.requirementsPending,
            supportsDataSubjectRights: assessment.supportsDataSubjectRights,
            dataSubjectRights: assessment.dataSubjectRights,
            consentManagementEnabled: assessment.consentManagementEnabled,
            consentTrackingEnabled: assessment.consentTrackingEnabled,
            privacyPolicyCompliant: assessment.privacyPolicyCompliant,
            breachNotificationProcess: assessment.breachNotificationProcess,
            breachNotificationTimeline: assessment.breachNotificationTimeline,
            auditLoggingEnabled: assessment.auditLoggingEnabled,
            reportingEnabled: assessment.reportingEnabled,
            findings: assessment.findings,
            actionItems: assessment.actionItems,
            remediationPlan: assessment.remediationPlan,
            status: assessment.isCompliant ? 'compliant' : 'non_compliant',
            updatedAt: new Date(),
          })
          .where(eq(statePrivacyCompliance.id, existing[0].id));

        const updated = await db
          .select()
          .from(statePrivacyCompliance)
          .where(eq(statePrivacyCompliance.id, existing[0].id))
          .limit(1);

        return updated[0];
      } else {
        // Create new record
        const newCompliance = await db.insert(statePrivacyCompliance).values({
          organizationId,
          stateLaw,
          stateCode,
          isCompliant: assessment.isCompliant,
          complianceScore: assessment.complianceScore,
          lastAssessment: new Date(),
          nextAssessment: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
          requirements,
          requirementsMet: assessment.requirementsMet,
          requirementsPending: assessment.requirementsPending,
          supportsDataSubjectRights: assessment.supportsDataSubjectRights,
          dataSubjectRights: assessment.dataSubjectRights,
          consentManagementEnabled: assessment.consentManagementEnabled,
          consentTrackingEnabled: assessment.consentTrackingEnabled,
          privacyPolicyCompliant: assessment.privacyPolicyCompliant,
          breachNotificationProcess: assessment.breachNotificationProcess,
          breachNotificationTimeline: assessment.breachNotificationTimeline,
          auditLoggingEnabled: assessment.auditLoggingEnabled,
          reportingEnabled: assessment.reportingEnabled,
          findings: assessment.findings,
          actionItems: assessment.actionItems,
          remediationPlan: assessment.remediationPlan,
          status: assessment.isCompliant ? 'compliant' : 'non_compliant',
        }).returning();

        return newCompliance[0];
      }
    } catch (error) {
      console.error('Error checking state privacy compliance:', error);
      throw new Error('Failed to check state privacy compliance');
    }
  }

  /**
   * Perform compliance assessment
   */
  private static async performComplianceAssessment(
    organizationId: string,
    stateLaw: StatePrivacyCompliance['stateLaw'],
    requirements: string[]
  ): Promise<{
    isCompliant: boolean;
    complianceScore: number;
    requirementsMet: string[];
    requirementsPending: string[];
    supportsDataSubjectRights: boolean;
    dataSubjectRights: string[];
    consentManagementEnabled: boolean;
    consentTrackingEnabled: boolean;
    privacyPolicyCompliant: boolean;
    breachNotificationProcess: boolean;
    breachNotificationTimeline?: number;
    auditLoggingEnabled: boolean;
    reportingEnabled: boolean;
    findings: any[];
    actionItems: any[];
    remediationPlan?: any;
  }> {
    // This is a simplified assessment - in production, you would check actual system capabilities
    // For now, we'll assume basic compliance features are in place
    
    const requirementsMet: string[] = [];
    const requirementsPending: string[] = [];
    const findings: any[] = [];
    const actionItems: any[] = [];

    // Check each requirement (simplified - in production, check actual system state)
    for (const requirement of requirements) {
      // Assume basic requirements are met if they're common across states
      if (['right_to_access', 'right_to_know', 'right_to_delete', 'right_to_correct'].includes(requirement)) {
        requirementsMet.push(requirement);
      } else {
        requirementsPending.push(requirement);
        actionItems.push({
          requirement,
          priority: 'high',
          description: `Implement ${requirement} functionality`,
        });
      }
    }

    const complianceScore = Math.round((requirementsMet.length / requirements.length) * 100);
    const isCompliant = complianceScore >= 80; // 80% threshold

    if (!isCompliant) {
      findings.push({
        type: 'compliance_gap',
        severity: 'high',
        description: `Compliance score is ${complianceScore}%. Need to meet ${requirementsPending.length} more requirements.`,
      });
    }

    return {
      isCompliant,
      complianceScore,
      requirementsMet,
      requirementsPending,
      supportsDataSubjectRights: requirementsMet.length > 0,
      dataSubjectRights: requirementsMet.filter(r => r.startsWith('right_to_')),
      consentManagementEnabled: true, // Assume enabled
      consentTrackingEnabled: true, // Assume enabled
      privacyPolicyCompliant: true, // Assume compliant
      breachNotificationProcess: true, // Assume process exists
      breachNotificationTimeline: 72, // 72 hours default
      auditLoggingEnabled: true, // Assume enabled
      reportingEnabled: true, // Assume enabled
      findings,
      actionItems,
      remediationPlan: actionItems.length > 0 ? {
        estimatedCompletion: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        steps: actionItems,
      } : undefined,
    };
  }

  /**
   * Get state privacy compliance records
   */
  static async getStatePrivacyCompliance(
    organizationId: string,
    stateLaw?: StatePrivacyCompliance['stateLaw']
  ): Promise<StatePrivacyCompliance[]> {
    try {
      let query = db
        .select()
        .from(statePrivacyCompliance)
        .where(eq(statePrivacyCompliance.organizationId, organizationId));

      if (stateLaw) {
        query = query.where(and(
          eq(statePrivacyCompliance.organizationId, organizationId),
          eq(statePrivacyCompliance.stateLaw, stateLaw)
        ));
      }

      const records = await query.orderBy(desc(statePrivacyCompliance.lastAssessment));

      return records;
    } catch (error) {
      console.error('Error fetching state privacy compliance:', error);
      throw new Error('Failed to fetch state privacy compliance');
    }
  }

  /**
   * Generate state compliance report
   */
  static async generateStateComplianceReport(
    organizationId: string,
    stateLaw?: StatePrivacyCompliance['stateLaw']
  ): Promise<Record<string, any>> {
    try {
      const records = await this.getStatePrivacyCompliance(organizationId, stateLaw);

      const summary = {
        totalStates: records.length,
        compliantStates: records.filter(r => r.isCompliant).length,
        nonCompliantStates: records.filter(r => !r.isCompliant).length,
        averageComplianceScore: records.length > 0
          ? Math.round(records.reduce((sum, r) => sum + (r.complianceScore || 0), 0) / records.length)
          : 0,
        byState: {} as Record<string, any>,
      };

      records.forEach(record => {
        summary.byState[record.stateCode] = {
          stateLaw: record.stateLaw,
          isCompliant: record.isCompliant,
          complianceScore: record.complianceScore,
          requirementsMet: record.requirementsMet.length,
          requirementsPending: record.requirementsPending.length,
          lastAssessment: record.lastAssessment,
        };
      });

      return {
        summary,
        records,
        generatedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error generating state compliance report:', error);
      throw new Error('Failed to generate state compliance report');
    }
  }
}

