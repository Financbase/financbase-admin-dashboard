import { db } from '@/lib/db';
import {
  complianceReports,
  dataRetentionPolicies,
  gdprDataRequests,
  auditLogs,
  dataAccessLogs
} from '@/lib/db/schemas';
import { eq, and, desc, asc, sql, gte, lte } from 'drizzle-orm';

export interface ComplianceReport {
  id: number;
  organizationId: string;
  reportType: string;
  reportName: string;
  reportDescription?: string;
  reportData: Record<string, any>;
  reportFilters: Record<string, any>;
  status: string;
  generatedBy: string;
  generatedAt?: Date;
  fileUrl?: string;
  fileSize?: number;
  fileFormat?: string;
  retentionPeriod?: string;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface DataRetentionPolicy {
  id: number;
  organizationId: string;
  policyName: string;
  policyDescription?: string;
  dataTypes: string[];
  dataCategories: string[];
  retentionPeriod: number;
  retentionUnit: string;
  legalBasis: string;
  complianceFramework?: string;
  actionOnExpiry: string;
  notificationPeriod: number;
  isActive: boolean;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface GDPRDataRequest {
  id: number;
  organizationId: string;
  requestType: string;
  dataSubjectEmail: string;
  dataSubjectName?: string;
  requestDescription?: string;
  requestedDataTypes: string[];
  status: string;
  assignedTo?: string;
  processingNotes?: string;
  responseData: Record<string, any>;
  responseFileUrl?: string;
  requestedAt: Date;
  processedAt?: Date;
  completedAt?: Date;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class ComplianceService {
  /**
   * Generate GDPR compliance report
   */
  static async generateGDPRReport(
    organizationId: string,
    generatedBy: string,
    filters: {
      dateFrom?: Date;
      dateTo?: Date;
      dataTypes?: string[];
      includePersonalData?: boolean;
    } = {}
  ): Promise<ComplianceReport> {
    try {
      const reportData = await this.getGDPRComplianceData(organizationId, filters);
      
      const report = await db.insert(complianceReports).values({
        organizationId,
        reportType: 'gdpr',
        reportName: `GDPR Compliance Report - ${new Date().toISOString().split('T')[0]}`,
        reportDescription: 'GDPR compliance report covering data processing activities',
        reportData,
        reportFilters: filters,
        status: 'completed',
        generatedBy,
        generatedAt: new Date(),
        fileFormat: 'json',
        retentionPeriod: '7 years',
        expiresAt: new Date(Date.now() + 7 * 365 * 24 * 60 * 60 * 1000), // 7 years
      }).returning();

      return report[0];
    } catch (error) {
      console.error('Error generating GDPR report:', error);
      throw new Error('Failed to generate GDPR report');
    }
  }

  /**
   * Generate SOC2 compliance report
   */
  static async generateSOC2Report(
    organizationId: string,
    generatedBy: string,
    filters: {
      dateFrom?: Date;
      dateTo?: Date;
      trustPrinciples?: string[];
    } = {}
  ): Promise<ComplianceReport> {
    try {
      const reportData = await this.getSOC2ComplianceData(organizationId, filters);
      
      const report = await db.insert(complianceReports).values({
        organizationId,
        reportType: 'soc2',
        reportName: `SOC2 Compliance Report - ${new Date().toISOString().split('T')[0]}`,
        reportDescription: 'SOC2 compliance report covering security, availability, and confidentiality',
        reportData,
        reportFilters: filters,
        status: 'completed',
        generatedBy,
        generatedAt: new Date(),
        fileFormat: 'json',
        retentionPeriod: '3 years',
        expiresAt: new Date(Date.now() + 3 * 365 * 24 * 60 * 60 * 1000), // 3 years
      }).returning();

      return report[0];
    } catch (error) {
      console.error('Error generating SOC2 report:', error);
      throw new Error('Failed to generate SOC2 report');
    }
  }

  /**
   * Create data retention policy
   */
  static async createDataRetentionPolicy(
    organizationId: string,
    policy: {
      policyName: string;
      policyDescription?: string;
      dataTypes: string[];
      dataCategories: string[];
      retentionPeriod: number;
      retentionUnit: string;
      legalBasis: string;
      complianceFramework?: string;
      actionOnExpiry: string;
      notificationPeriod?: number;
      isDefault?: boolean;
    }
  ): Promise<DataRetentionPolicy> {
    try {
      const newPolicy = await db.insert(dataRetentionPolicies).values({
        organizationId,
        policyName: policy.policyName,
        policyDescription: policy.policyDescription,
        dataTypes: policy.dataTypes,
        dataCategories: policy.dataCategories,
        retentionPeriod: policy.retentionPeriod,
        retentionUnit: policy.retentionUnit,
        legalBasis: policy.legalBasis,
        complianceFramework: policy.complianceFramework,
        actionOnExpiry: policy.actionOnExpiry,
        notificationPeriod: policy.notificationPeriod || 30,
        isDefault: policy.isDefault || false,
        isActive: true,
      }).returning();

      return newPolicy[0];
    } catch (error) {
      console.error('Error creating data retention policy:', error);
      throw new Error('Failed to create data retention policy');
    }
  }

  /**
   * Get data retention policies
   */
  static async getDataRetentionPolicies(
    organizationId: string,
    isActive: boolean = true
  ): Promise<DataRetentionPolicy[]> {
    try {
      const policies = await db
        .select()
        .from(dataRetentionPolicies)
        .where(and(
          eq(dataRetentionPolicies.organizationId, organizationId),
          eq(dataRetentionPolicies.isActive, isActive)
        ))
        .orderBy(desc(dataRetentionPolicies.createdAt));

      return policies;
    } catch (error) {
      console.error('Error fetching data retention policies:', error);
      throw new Error('Failed to fetch data retention policies');
    }
  }

  /**
   * Create GDPR data request
   */
  static async createGDPRDataRequest(
    organizationId: string,
    request: {
      requestType: string;
      dataSubjectEmail: string;
      dataSubjectName?: string;
      requestDescription?: string;
      requestedDataTypes?: string[];
    }
  ): Promise<GDPRDataRequest> {
    try {
      const newRequest = await db.insert(gdprDataRequests).values({
        organizationId,
        requestType: request.requestType,
        dataSubjectEmail: request.dataSubjectEmail,
        dataSubjectName: request.dataSubjectName,
        requestDescription: request.requestDescription,
        requestedDataTypes: request.requestedDataTypes || [],
        status: 'pending',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      }).returning();

      return newRequest[0];
    } catch (error) {
      console.error('Error creating GDPR data request:', error);
      throw new Error('Failed to create GDPR data request');
    }
  }

  /**
   * Get GDPR data requests
   */
  static async getGDPRDataRequests(
    organizationId: string,
    status?: string,
    limit: number = 100,
    offset: number = 0
  ): Promise<GDPRDataRequest[]> {
    try {
      let query = db
        .select()
        .from(gdprDataRequests)
        .where(eq(gdprDataRequests.organizationId, organizationId));

      if (status) {
        query = query.where(and(
          eq(gdprDataRequests.organizationId, organizationId),
          eq(gdprDataRequests.status, status)
        ));
      }

      const requests = await query
        .orderBy(desc(gdprDataRequests.requestedAt))
        .limit(limit)
        .offset(offset);

      return requests;
    } catch (error) {
      console.error('Error fetching GDPR data requests:', error);
      throw new Error('Failed to fetch GDPR data requests');
    }
  }

  /**
   * Process GDPR data request
   */
  static async processGDPRDataRequest(
    requestId: number,
    assignedTo: string,
    processingNotes?: string
  ): Promise<void> {
    try {
      await db
        .update(gdprDataRequests)
        .set({
          status: 'in_progress',
          assignedTo,
          processingNotes,
          processedAt: new Date(),
        })
        .where(eq(gdprDataRequests.id, requestId));
    } catch (error) {
      console.error('Error processing GDPR data request:', error);
      throw new Error('Failed to process GDPR data request');
    }
  }

  /**
   * Complete GDPR data request
   */
  static async completeGDPRDataRequest(
    requestId: number,
    responseData: Record<string, any>,
    responseFileUrl?: string
  ): Promise<void> {
    try {
      await db
        .update(gdprDataRequests)
        .set({
          status: 'completed',
          responseData,
          responseFileUrl,
          completedAt: new Date(),
        })
        .where(eq(gdprDataRequests.id, requestId));
    } catch (error) {
      console.error('Error completing GDPR data request:', error);
      throw new Error('Failed to complete GDPR data request');
    }
  }

  /**
   * Get compliance reports
   */
  static async getComplianceReports(
    organizationId: string,
    reportType?: string,
    limit: number = 100,
    offset: number = 0
  ): Promise<ComplianceReport[]> {
    try {
      let query = db
        .select()
        .from(complianceReports)
        .where(eq(complianceReports.organizationId, organizationId));

      if (reportType) {
        query = query.where(and(
          eq(complianceReports.organizationId, organizationId),
          eq(complianceReports.reportType, reportType)
        ));
      }

      const reports = await query
        .orderBy(desc(complianceReports.generatedAt))
        .limit(limit)
        .offset(offset);

      return reports;
    } catch (error) {
      console.error('Error fetching compliance reports:', error);
      throw new Error('Failed to fetch compliance reports');
    }
  }

  /**
   * Get GDPR compliance data
   */
  private static async getGDPRComplianceData(
    organizationId: string,
    filters: {
      dateFrom?: Date;
      dateTo?: Date;
      dataTypes?: string[];
      includePersonalData?: boolean;
    }
  ): Promise<Record<string, any>> {
    try {
      // Get audit logs for the organization
      let auditQuery = db
        .select()
        .from(auditLogs)
        .where(eq(auditLogs.organizationId, organizationId));

      if (filters.dateFrom) {
        auditQuery = auditQuery.where(and(
          eq(auditLogs.organizationId, organizationId),
          gte(auditLogs.timestamp, filters.dateFrom)
        ));
      }

      if (filters.dateTo) {
        auditQuery = auditQuery.where(and(
          eq(auditLogs.organizationId, organizationId),
          lte(auditLogs.timestamp, filters.dateTo)
        ));
      }

      const auditLogs = await auditQuery;

      // Get data access logs
      let dataAccessQuery = db
        .select()
        .from(dataAccessLogs)
        .where(eq(dataAccessLogs.organizationId, organizationId));

      if (filters.dateFrom) {
        dataAccessQuery = dataAccessQuery.where(and(
          eq(dataAccessLogs.organizationId, organizationId),
          gte(dataAccessLogs.timestamp, filters.dateFrom)
        ));
      }

      if (filters.dateTo) {
        dataAccessQuery = dataAccessQuery.where(and(
          eq(dataAccessLogs.organizationId, organizationId),
          lte(dataAccessLogs.timestamp, filters.dateTo)
        ));
      }

      const dataAccessLogs = await dataAccessQuery;

      // Get data retention policies
      const retentionPolicies = await db
        .select()
        .from(dataRetentionPolicies)
        .where(and(
          eq(dataRetentionPolicies.organizationId, organizationId),
          eq(dataRetentionPolicies.isActive, true)
        ));

      // Get GDPR data requests
      const gdprRequests = await db
        .select()
        .from(gdprDataRequests)
        .where(eq(gdprDataRequests.organizationId, organizationId));

      return {
        summary: {
          totalAuditEvents: auditLogs.length,
          totalDataAccessEvents: dataAccessLogs.length,
          gdprRelevantEvents: auditLogs.filter(log => log.gdprRelevant).length,
          dataRetentionPolicies: retentionPolicies.length,
          gdprDataRequests: gdprRequests.length,
        },
        auditLogs: auditLogs.slice(0, 1000), // Limit for performance
        dataAccessLogs: dataAccessLogs.slice(0, 1000),
        retentionPolicies,
        gdprRequests,
        generatedAt: new Date().toISOString(),
        reportPeriod: {
          from: filters.dateFrom?.toISOString(),
          to: filters.dateTo?.toISOString(),
        },
      };
    } catch (error) {
      console.error('Error getting GDPR compliance data:', error);
      throw new Error('Failed to get GDPR compliance data');
    }
  }

  /**
   * Get SOC2 compliance data
   */
  private static async getSOC2ComplianceData(
    organizationId: string,
    filters: {
      dateFrom?: Date;
      dateTo?: Date;
      trustPrinciples?: string[];
    }
  ): Promise<Record<string, any>> {
    try {
      // Get security events
      const securityEvents = await db
        .select()
        .from(securityEvents)
        .where(eq(securityEvents.organizationId, organizationId));

      // Get audit logs
      const auditLogs = await db
        .select()
        .from(auditLogs)
        .where(eq(auditLogs.organizationId, organizationId));

      // Get data access logs
      const dataAccessLogs = await db
        .select()
        .from(dataAccessLogs)
        .where(eq(dataAccessLogs.organizationId, organizationId));

      return {
        summary: {
          totalSecurityEvents: securityEvents.length,
          totalAuditEvents: auditLogs.length,
          totalDataAccessEvents: dataAccessLogs.length,
          highSeverityEvents: securityEvents.filter(event => event.severity === 'high' || event.severity === 'critical').length,
          unresolvedSecurityEvents: securityEvents.filter(event => !event.isResolved).length,
        },
        securityEvents: securityEvents.slice(0, 1000),
        auditLogs: auditLogs.slice(0, 1000),
        dataAccessLogs: dataAccessLogs.slice(0, 1000),
        generatedAt: new Date().toISOString(),
        reportPeriod: {
          from: filters.dateFrom?.toISOString(),
          to: filters.dateTo?.toISOString(),
        },
      };
    } catch (error) {
      console.error('Error getting SOC2 compliance data:', error);
      throw new Error('Failed to get SOC2 compliance data');
    }
  }
}
