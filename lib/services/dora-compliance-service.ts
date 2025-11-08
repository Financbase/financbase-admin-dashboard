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
  doraIncidentReports,
  doraResilienceTests,
  doraThirdPartyRisks,
} from '@/lib/db/schemas';
import { eq, and, desc, asc, gte, lte, sql } from 'drizzle-orm';

export interface DORAIncidentReport {
  id: number;
  organizationId: string;
  reportedBy?: string;
  incidentTitle: string;
  incidentDescription: string;
  incidentType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'detected' | 'investigating' | 'contained' | 'resolved' | 'closed';
  affectedSystems: string[];
  affectedServices: string[];
  impactScope?: string;
  detectedAt: Date;
  containedAt?: Date;
  resolvedAt?: Date;
  closedAt?: Date;
  impactDescription?: string;
  affectedUsers?: number;
  dataAffected: boolean;
  financialImpact?: {
    amount: number;
    currency: string;
    description?: string;
  };
  responseActions: any[];
  remediationSteps: any[];
  reportedToAuthorities: boolean;
  authorityReportDetails?: any;
  internalReportUrl?: string;
  tags: string[];
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface DORAResilienceTest {
  id: number;
  organizationId: string;
  scheduledBy?: string;
  executedBy?: string;
  testName: string;
  testDescription?: string;
  testType: 'vulnerability_assessment' | 'penetration_test' | 'load_test' | 'disaster_recovery' | 'business_continuity' | 'threat_led_penetration_test';
  status: 'scheduled' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
  testScope: {
    systems?: string[];
    services?: string[];
    components?: string[];
  };
  criticalFunctions: string[];
  scheduledDate: Date;
  startDate?: Date;
  endDate?: Date;
  completedDate?: Date;
  testResults?: any;
  vulnerabilitiesFound: number;
  vulnerabilitiesCritical: number;
  vulnerabilitiesHigh: number;
  vulnerabilitiesMedium: number;
  vulnerabilitiesLow: number;
  findings: any[];
  recommendations: any[];
  remediationPlan?: any;
  reportUrl?: string;
  reportGeneratedAt?: Date;
  tags: string[];
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface DORAThirdPartyRisk {
  id: number;
  organizationId: string;
  assessedBy?: string;
  providerName: string;
  providerType: string;
  providerContact?: {
    email?: string;
    phone?: string;
    address?: string;
  };
  contractId?: string;
  contractStartDate?: Date;
  contractEndDate?: Date;
  servicesProvided: string[];
  criticalServices: string[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  riskScore?: number;
  riskFactors: string[];
  riskDescription?: string;
  complianceCertifications: string[];
  dataProcessingAgreement: boolean;
  securityAssessmentCompleted: boolean;
  lastSecurityAssessment?: Date;
  businessContinuityPlan: boolean;
  disasterRecoveryPlan: boolean;
  incidentResponsePlan: boolean;
  monitoringEnabled: boolean;
  monitoringFrequency?: string;
  lastReviewDate?: Date;
  nextReviewDate?: Date;
  isActive: boolean;
  status: string;
  notes?: string;
  tags: string[];
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export class DORAComplianceService {
  /**
   * Report ICT incident per DORA requirements
   */
  static async reportICTIncident(
    organizationId: string,
    incident: {
      reportedBy?: string;
      incidentTitle: string;
      incidentDescription: string;
      incidentType: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
      affectedSystems?: string[];
      affectedServices?: string[];
      impactScope?: string;
      detectedAt?: Date;
      impactDescription?: string;
      affectedUsers?: number;
      dataAffected?: boolean;
      financialImpact?: {
        amount: number;
        currency: string;
        description?: string;
      };
      tags?: string[];
      metadata?: Record<string, any>;
    }
  ): Promise<DORAIncidentReport> {
    try {
      const newIncident = await db.insert(doraIncidentReports).values({
        organizationId,
        reportedBy: incident.reportedBy,
        incidentTitle: incident.incidentTitle,
        incidentDescription: incident.incidentDescription,
        incidentType: incident.incidentType,
        severity: incident.severity,
        status: 'detected',
        affectedSystems: incident.affectedSystems || [],
        affectedServices: incident.affectedServices || [],
        impactScope: incident.impactScope,
        detectedAt: incident.detectedAt || new Date(),
        impactDescription: incident.impactDescription,
        affectedUsers: incident.affectedUsers,
        dataAffected: incident.dataAffected || false,
        financialImpact: incident.financialImpact,
        responseActions: [],
        remediationSteps: [],
        reportedToAuthorities: false,
        tags: incident.tags || [],
        metadata: incident.metadata || {},
      }).returning();

      return newIncident[0];
    } catch (error) {
      console.error('Error reporting ICT incident:', error);
      throw new Error('Failed to report ICT incident');
    }
  }

  /**
   * Update incident status
   */
  static async updateIncidentStatus(
    incidentId: number,
    status: 'detected' | 'investigating' | 'contained' | 'resolved' | 'closed',
    updateData?: {
      containedAt?: Date;
      resolvedAt?: Date;
      closedAt?: Date;
      responseActions?: any[];
      remediationSteps?: any[];
      reportedToAuthorities?: boolean;
      authorityReportDetails?: any;
      internalReportUrl?: string;
    }
  ): Promise<void> {
    try {
      const updateFields: any = {
        status,
        updatedAt: new Date(),
      };

      if (status === 'contained' && updateData?.containedAt) {
        updateFields.containedAt = updateData.containedAt;
      }
      if (status === 'resolved' && updateData?.resolvedAt) {
        updateFields.resolvedAt = updateData.resolvedAt;
      }
      if (status === 'closed' && updateData?.closedAt) {
        updateFields.closedAt = updateData.closedAt;
      }
      if (updateData?.responseActions) {
        updateFields.responseActions = updateData.responseActions;
      }
      if (updateData?.remediationSteps) {
        updateFields.remediationSteps = updateData.remediationSteps;
      }
      if (updateData?.reportedToAuthorities !== undefined) {
        updateFields.reportedToAuthorities = updateData.reportedToAuthorities;
      }
      if (updateData?.authorityReportDetails) {
        updateFields.authorityReportDetails = updateData.authorityReportDetails;
      }
      if (updateData?.internalReportUrl) {
        updateFields.internalReportUrl = updateData.internalReportUrl;
      }

      await db
        .update(doraIncidentReports)
        .set(updateFields)
        .where(eq(doraIncidentReports.id, incidentId));
    } catch (error) {
      console.error('Error updating incident status:', error);
      throw new Error('Failed to update incident status');
    }
  }

  /**
   * Get ICT incidents
   */
  static async getIncidents(
    organizationId: string,
    filters?: {
      status?: string;
      severity?: string;
      dateFrom?: Date;
      dateTo?: Date;
      limit?: number;
      offset?: number;
    }
  ): Promise<DORAIncidentReport[]> {
    try {
      let query = db
        .select()
        .from(doraIncidentReports)
        .where(eq(doraIncidentReports.organizationId, organizationId));

      if (filters?.status) {
        query = query.where(and(
          eq(doraIncidentReports.organizationId, organizationId),
          eq(doraIncidentReports.status, filters.status)
        ));
      }

      if (filters?.severity) {
        query = query.where(and(
          eq(doraIncidentReports.organizationId, organizationId),
          eq(doraIncidentReports.severity, filters.severity)
        ));
      }

      if (filters?.dateFrom) {
        query = query.where(and(
          eq(doraIncidentReports.organizationId, organizationId),
          gte(doraIncidentReports.detectedAt, filters.dateFrom)
        ));
      }

      if (filters?.dateTo) {
        query = query.where(and(
          eq(doraIncidentReports.organizationId, organizationId),
          lte(doraIncidentReports.detectedAt, filters.dateTo)
        ));
      }

      const incidents = await query
        .orderBy(desc(doraIncidentReports.detectedAt))
        .limit(filters?.limit || 100)
        .offset(filters?.offset || 0);

      return incidents;
    } catch (error) {
      console.error('Error fetching incidents:', error);
      throw new Error('Failed to fetch incidents');
    }
  }

  /**
   * Get incident by ID
   */
  static async getIncidentById(incidentId: number): Promise<DORAIncidentReport | null> {
    try {
      const incident = await db
        .select()
        .from(doraIncidentReports)
        .where(eq(doraIncidentReports.id, incidentId))
        .limit(1);

      return incident[0] || null;
    } catch (error) {
      console.error('Error fetching incident:', error);
      throw new Error('Failed to fetch incident');
    }
  }

  /**
   * Schedule resilience test
   */
  static async scheduleResilienceTest(
    organizationId: string,
    test: {
      scheduledBy?: string;
      testName: string;
      testDescription?: string;
      testType: 'vulnerability_assessment' | 'penetration_test' | 'load_test' | 'disaster_recovery' | 'business_continuity' | 'threat_led_penetration_test';
      testScope?: {
        systems?: string[];
        services?: string[];
        components?: string[];
      };
      criticalFunctions?: string[];
      scheduledDate: Date;
      tags?: string[];
      metadata?: Record<string, any>;
    }
  ): Promise<DORAResilienceTest> {
    try {
      const newTest = await db.insert(doraResilienceTests).values({
        organizationId,
        scheduledBy: test.scheduledBy,
        testName: test.testName,
        testDescription: test.testDescription,
        testType: test.testType,
        status: 'scheduled',
        testScope: test.testScope || {},
        criticalFunctions: test.criticalFunctions || [],
        scheduledDate: test.scheduledDate,
        vulnerabilitiesFound: 0,
        vulnerabilitiesCritical: 0,
        vulnerabilitiesHigh: 0,
        vulnerabilitiesMedium: 0,
        vulnerabilitiesLow: 0,
        findings: [],
        recommendations: [],
        tags: test.tags || [],
        metadata: test.metadata || {},
      }).returning();

      return newTest[0];
    } catch (error) {
      console.error('Error scheduling resilience test:', error);
      throw new Error('Failed to schedule resilience test');
    }
  }

  /**
   * Update resilience test
   */
  static async updateResilienceTest(
    testId: number,
    updateData: {
      status?: 'scheduled' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
      executedBy?: string;
      startDate?: Date;
      endDate?: Date;
      completedDate?: Date;
      testResults?: any;
      vulnerabilitiesFound?: number;
      vulnerabilitiesCritical?: number;
      vulnerabilitiesHigh?: number;
      vulnerabilitiesMedium?: number;
      vulnerabilitiesLow?: number;
      findings?: any[];
      recommendations?: any[];
      remediationPlan?: any;
      reportUrl?: string;
      reportGeneratedAt?: Date;
    }
  ): Promise<void> {
    try {
      await db
        .update(doraResilienceTests)
        .set({
          ...updateData,
          updatedAt: new Date(),
        })
        .where(eq(doraResilienceTests.id, testId));
    } catch (error) {
      console.error('Error updating resilience test:', error);
      throw new Error('Failed to update resilience test');
    }
  }

  /**
   * Get resilience tests
   */
  static async getResilienceTests(
    organizationId: string,
    filters?: {
      status?: string;
      testType?: string;
      dateFrom?: Date;
      dateTo?: Date;
      limit?: number;
      offset?: number;
    }
  ): Promise<DORAResilienceTest[]> {
    try {
      let query = db
        .select()
        .from(doraResilienceTests)
        .where(eq(doraResilienceTests.organizationId, organizationId));

      if (filters?.status) {
        query = query.where(and(
          eq(doraResilienceTests.organizationId, organizationId),
          eq(doraResilienceTests.status, filters.status)
        ));
      }

      if (filters?.testType) {
        query = query.where(and(
          eq(doraResilienceTests.organizationId, organizationId),
          eq(doraResilienceTests.testType, filters.testType)
        ));
      }

      if (filters?.dateFrom) {
        query = query.where(and(
          eq(doraResilienceTests.organizationId, organizationId),
          gte(doraResilienceTests.scheduledDate, filters.dateFrom)
        ));
      }

      if (filters?.dateTo) {
        query = query.where(and(
          eq(doraResilienceTests.organizationId, organizationId),
          lte(doraResilienceTests.scheduledDate, filters.dateTo)
        ));
      }

      const tests = await query
        .orderBy(desc(doraResilienceTests.scheduledDate))
        .limit(filters?.limit || 100)
        .offset(filters?.offset || 0);

      return tests;
    } catch (error) {
      console.error('Error fetching resilience tests:', error);
      throw new Error('Failed to fetch resilience tests');
    }
  }

  /**
   * Get resilience test by ID
   */
  static async getResilienceTestById(testId: number): Promise<DORAResilienceTest | null> {
    try {
      const test = await db
        .select()
        .from(doraResilienceTests)
        .where(eq(doraResilienceTests.id, testId))
        .limit(1);

      return test[0] || null;
    } catch (error) {
      console.error('Error fetching resilience test:', error);
      throw new Error('Failed to fetch resilience test');
    }
  }

  /**
   * Assess third-party risk
   */
  static async assessThirdPartyRisk(
    organizationId: string,
    risk: {
      assessedBy?: string;
      providerName: string;
      providerType: string;
      providerContact?: {
        email?: string;
        phone?: string;
        address?: string;
      };
      contractId?: string;
      contractStartDate?: Date;
      contractEndDate?: Date;
      servicesProvided?: string[];
      criticalServices?: string[];
      riskLevel: 'low' | 'medium' | 'high' | 'critical';
      riskScore?: number;
      riskFactors?: string[];
      riskDescription?: string;
      complianceCertifications?: string[];
      dataProcessingAgreement?: boolean;
      securityAssessmentCompleted?: boolean;
      lastSecurityAssessment?: Date;
      businessContinuityPlan?: boolean;
      disasterRecoveryPlan?: boolean;
      incidentResponsePlan?: boolean;
      monitoringEnabled?: boolean;
      monitoringFrequency?: string;
      tags?: string[];
      metadata?: Record<string, any>;
    }
  ): Promise<DORAThirdPartyRisk> {
    try {
      const newRisk = await db.insert(doraThirdPartyRisks).values({
        organizationId,
        assessedBy: risk.assessedBy,
        providerName: risk.providerName,
        providerType: risk.providerType,
        providerContact: risk.providerContact,
        contractId: risk.contractId,
        contractStartDate: risk.contractStartDate,
        contractEndDate: risk.contractEndDate,
        servicesProvided: risk.servicesProvided || [],
        criticalServices: risk.criticalServices || [],
        riskLevel: risk.riskLevel,
        riskScore: risk.riskScore,
        riskFactors: risk.riskFactors || [],
        riskDescription: risk.riskDescription,
        complianceCertifications: risk.complianceCertifications || [],
        dataProcessingAgreement: risk.dataProcessingAgreement || false,
        securityAssessmentCompleted: risk.securityAssessmentCompleted || false,
        lastSecurityAssessment: risk.lastSecurityAssessment,
        businessContinuityPlan: risk.businessContinuityPlan || false,
        disasterRecoveryPlan: risk.disasterRecoveryPlan || false,
        incidentResponsePlan: risk.incidentResponsePlan || false,
        monitoringEnabled: risk.monitoringEnabled || false,
        monitoringFrequency: risk.monitoringFrequency,
        isActive: true,
        status: 'active',
        tags: risk.tags || [],
        metadata: risk.metadata || {},
      }).returning();

      return newRisk[0];
    } catch (error) {
      console.error('Error assessing third-party risk:', error);
      throw new Error('Failed to assess third-party risk');
    }
  }

  /**
   * Update third-party risk assessment
   */
  static async updateThirdPartyRisk(
    riskId: number,
    updateData: {
      riskLevel?: 'low' | 'medium' | 'high' | 'critical';
      riskScore?: number;
      riskFactors?: string[];
      riskDescription?: string;
      securityAssessmentCompleted?: boolean;
      lastSecurityAssessment?: Date;
      nextReviewDate?: Date;
      isActive?: boolean;
      status?: string;
      notes?: string;
    }
  ): Promise<void> {
    try {
      await db
        .update(doraThirdPartyRisks)
        .set({
          ...updateData,
          updatedAt: new Date(),
        })
        .where(eq(doraThirdPartyRisks.id, riskId));
    } catch (error) {
      console.error('Error updating third-party risk:', error);
      throw new Error('Failed to update third-party risk');
    }
  }

  /**
   * Get third-party risks
   */
  static async getThirdPartyRisks(
    organizationId: string,
    filters?: {
      riskLevel?: string;
      isActive?: boolean;
      status?: string;
      limit?: number;
      offset?: number;
    }
  ): Promise<DORAThirdPartyRisk[]> {
    try {
      let query = db
        .select()
        .from(doraThirdPartyRisks)
        .where(eq(doraThirdPartyRisks.organizationId, organizationId));

      if (filters?.riskLevel) {
        query = query.where(and(
          eq(doraThirdPartyRisks.organizationId, organizationId),
          eq(doraThirdPartyRisks.riskLevel, filters.riskLevel)
        ));
      }

      if (filters?.isActive !== undefined) {
        query = query.where(and(
          eq(doraThirdPartyRisks.organizationId, organizationId),
          eq(doraThirdPartyRisks.isActive, filters.isActive)
        ));
      }

      if (filters?.status) {
        query = query.where(and(
          eq(doraThirdPartyRisks.organizationId, organizationId),
          eq(doraThirdPartyRisks.status, filters.status)
        ));
      }

      const risks = await query
        .orderBy(desc(doraThirdPartyRisks.createdAt))
        .limit(filters?.limit || 100)
        .offset(filters?.offset || 0);

      return risks;
    } catch (error) {
      console.error('Error fetching third-party risks:', error);
      throw new Error('Failed to fetch third-party risks');
    }
  }

  /**
   * Get third-party risk by ID
   */
  static async getThirdPartyRiskById(riskId: number): Promise<DORAThirdPartyRisk | null> {
    try {
      const risk = await db
        .select()
        .from(doraThirdPartyRisks)
        .where(eq(doraThirdPartyRisks.id, riskId))
        .limit(1);

      return risk[0] || null;
    } catch (error) {
      console.error('Error fetching third-party risk:', error);
      throw new Error('Failed to fetch third-party risk');
    }
  }

  /**
   * Generate DORA compliance report
   */
  static async generateDORAReport(
    organizationId: string,
    filters?: {
      dateFrom?: Date;
      dateTo?: Date;
    }
  ): Promise<Record<string, any>> {
    try {
      const incidents = await this.getIncidents(organizationId, {
        dateFrom: filters?.dateFrom,
        dateTo: filters?.dateTo,
        limit: 1000,
      });

      const tests = await this.getResilienceTests(organizationId, {
        dateFrom: filters?.dateFrom,
        dateTo: filters?.dateTo,
        limit: 1000,
      });

      const risks = await this.getThirdPartyRisks(organizationId, {
        limit: 1000,
      });

      // Calculate metrics
      const criticalIncidents = incidents.filter(i => i.severity === 'critical').length;
      const unresolvedIncidents = incidents.filter(i => i.status !== 'resolved' && i.status !== 'closed').length;
      const completedTests = tests.filter(t => t.status === 'completed').length;
      const criticalRisks = risks.filter(r => r.riskLevel === 'critical').length;

      return {
        summary: {
          totalIncidents: incidents.length,
          criticalIncidents,
          unresolvedIncidents,
          totalResilienceTests: tests.length,
          completedTests,
          totalThirdPartyRisks: risks.length,
          criticalRisks,
        },
        incidents: incidents.slice(0, 100),
        resilienceTests: tests.slice(0, 100),
        thirdPartyRisks: risks.slice(0, 100),
        generatedAt: new Date().toISOString(),
        reportPeriod: {
          from: filters?.dateFrom?.toISOString(),
          to: filters?.dateTo?.toISOString(),
        },
      };
    } catch (error) {
      console.error('Error generating DORA report:', error);
      throw new Error('Failed to generate DORA report');
    }
  }

  /**
   * Track operational resilience metrics
   */
  static async trackOperationalResilience(
    organizationId: string
  ): Promise<Record<string, any>> {
    try {
      const last30Days = new Date();
      last30Days.setDate(last30Days.getDate() - 30);

      const recentIncidents = await this.getIncidents(organizationId, {
        dateFrom: last30Days,
        limit: 1000,
      });

      const recentTests = await this.getResilienceTests(organizationId, {
        dateFrom: last30Days,
        limit: 1000,
      });

      const activeRisks = await this.getThirdPartyRisks(organizationId, {
        isActive: true,
        limit: 1000,
      });

      // Calculate resilience score (0-100)
      const incidentScore = Math.max(0, 100 - (recentIncidents.length * 5));
      const testScore = recentTests.length > 0 ? (recentTests.filter(t => t.status === 'completed').length / recentTests.length) * 100 : 50;
      const riskScore = Math.max(0, 100 - (activeRisks.filter(r => r.riskLevel === 'high' || r.riskLevel === 'critical').length * 10));

      const resilienceScore = (incidentScore + testScore + riskScore) / 3;

      return {
        resilienceScore: Math.round(resilienceScore),
        metrics: {
          incidentsLast30Days: recentIncidents.length,
          criticalIncidentsLast30Days: recentIncidents.filter(i => i.severity === 'critical').length,
          testsCompletedLast30Days: recentTests.filter(t => t.status === 'completed').length,
          activeThirdPartyRisks: activeRisks.length,
          criticalThirdPartyRisks: activeRisks.filter(r => r.riskLevel === 'critical').length,
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error tracking operational resilience:', error);
      throw new Error('Failed to track operational resilience');
    }
  }
}

