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
  incidentResponseIncidents,
  irTeamMembers,
  irRunbooks,
  irDrills,
  irProcedures
} from '@/lib/db/schemas/incident-response.schema';
import { eq, and, desc, gte, lte, or, inArray } from 'drizzle-orm';

export interface IRIncident {
  id: number;
  organizationId: string;
  incidentNumber: string;
  reportedBy?: string;
  assignedTo?: string;
  incidentCoordinator?: string;
  incidentType: 'security_breach' | 'data_breach' | 'malware' | 'phishing' | 'ddos' | 'unauthorized_access' | 'system_outage' | 'data_loss' | 'service_degradation' | 'compliance_violation' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'detected' | 'analyzing' | 'contained' | 'eradicated' | 'recovered' | 'post_incident_review' | 'closed';
  title: string;
  description: string;
  detectedAt: Date;
  analyzedAt?: Date;
  containedAt?: Date;
  eradicatedAt?: Date;
  recoveredAt?: Date;
  closedAt?: Date;
  affectedSystems: any[];
  affectedServices: any[];
  affectedUsers?: number;
  dataAffected: boolean;
  dataTypesAffected: any[];
  businessImpact?: string;
  financialImpact?: any;
  containmentActions: any[];
  eradicationActions: any[];
  recoveryActions: any[];
  lessonsLearned?: string;
  internalNotifications: any[];
  externalNotifications: any[];
  communicationLog: any[];
  rootCause?: string;
  contributingFactors: any[];
  remediationPlan?: any;
  followUpActions: any[];
  tags: any[];
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export class IncidentResponseService {
  /**
   * Generate unique incident number
   */
  private static generateIncidentNumber(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `IR-${year}-${month}${day}-${random}`;
  }

  /**
   * Create a new incident
   */
  static async createIncident(
    organizationId: string,
    incidentData: {
      reportedBy?: string;
      incidentType: IRIncident['incidentType'];
      severity: IRIncident['severity'];
      title: string;
      description: string;
      detectedAt?: Date;
      affectedSystems?: any[];
      affectedData?: any[];
      tags?: any[];
      metadata?: Record<string, any>;
    }
  ): Promise<IRIncident> {
    try {
      const incidentNumber = this.generateIncidentNumber();
      
      const [incident] = await db
        .insert(incidentResponseIncidents)
        .values({
          organizationId,
          incidentNumber,
          reportedBy: incidentData.reportedBy,
          incidentType: incidentData.incidentType,
          severity: incidentData.severity,
          status: 'detected',
          title: incidentData.title,
          description: incidentData.description,
          detectedAt: incidentData.detectedAt || new Date(),
          affectedSystems: incidentData.affectedSystems || [],
          affectedServices: [],
          dataAffected: incidentData.affectedData && incidentData.affectedData.length > 0,
          dataTypesAffected: incidentData.affectedData || [],
          tags: incidentData.tags || [],
          metadata: incidentData.metadata || {},
        })
        .returning();

      // Auto-assign based on severity and type
      await this.autoAssignIncident(incident.id, organizationId, incidentData.severity);

      return incident as IRIncident;
    } catch (error) {
      console.error('Error creating incident:', error);
      throw new Error('Failed to create incident');
    }
  }

  /**
   * Auto-assign incident to appropriate team member
   */
  private static async autoAssignIncident(
    incidentId: number,
    organizationId: string,
    severity: string
  ): Promise<void> {
    try {
      // Get active on-call team members
      const teamMembers = await db
        .select()
        .from(irTeamMembers)
        .where(
          and(
            eq(irTeamMembers.organizationId, organizationId),
            eq(irTeamMembers.isActive, true),
            eq(irTeamMembers.isOnCall, true)
          )
        );

      if (teamMembers.length === 0) return;

      // For critical/high severity, assign to primary commander
      if (severity === 'critical' || severity === 'high') {
        const commander = teamMembers.find(m => m.role === 'incident_commander' && m.isPrimary);
        if (commander) {
          await db
            .update(incidentResponseIncidents)
            .set({
              assignedTo: commander.userId,
              status: 'analyzing',
              analyzedAt: new Date(),
            })
            .where(eq(incidentResponseIncidents.id, incidentId));
          return;
        }
      }

      // Assign to first available team member
      const responder = teamMembers.find(m => m.role === 'team_member') || teamMembers[0];
      if (responder) {
        await db
          .update(incidentResponseIncidents)
          .set({
            assignedTo: responder.userId,
          })
          .where(eq(incidentResponseIncidents.id, incidentId));
      }
    } catch (error) {
      console.error('Error auto-assigning incident:', error);
      // Don't throw - assignment is not critical
    }
  }

  /**
   * Get incident by ID
   */
  static async getIncidentById(incidentId: number): Promise<IRIncident | null> {
    try {
      const [incident] = await db
        .select()
        .from(incidentResponseIncidents)
        .where(eq(incidentResponseIncidents.id, incidentId))
        .limit(1);

      return incident as IRIncident | null;
    } catch (error) {
      console.error('Error getting incident:', error);
      throw new Error('Failed to get incident');
    }
  }

  /**
   * Get incidents with filters
   */
  static async getIncidents(
    organizationId: string,
    filters?: {
      status?: string;
      severity?: string;
      incidentType?: string;
      assignedTo?: string;
      dateFrom?: Date;
      dateTo?: Date;
      limit?: number;
      offset?: number;
    }
  ): Promise<IRIncident[]> {
    try {
      const conditions = [eq(incidentResponseIncidents.organizationId, organizationId)];

      if (filters?.status) {
        conditions.push(eq(incidentResponseIncidents.status, filters.status as any));
      }
      if (filters?.severity) {
        conditions.push(eq(incidentResponseIncidents.severity, filters.severity as any));
      }
      if (filters?.incidentType) {
        conditions.push(eq(incidentResponseIncidents.incidentType, filters.incidentType as any));
      }
      if (filters?.assignedTo) {
        conditions.push(eq(incidentResponseIncidents.assignedTo, filters.assignedTo));
      }
      if (filters?.dateFrom) {
        conditions.push(gte(incidentResponseIncidents.detectedAt, filters.dateFrom));
      }
      if (filters?.dateTo) {
        conditions.push(lte(incidentResponseIncidents.detectedAt, filters.dateTo));
      }

      const incidents = await db
        .select()
        .from(incidentResponseIncidents)
        .where(and(...conditions))
        .orderBy(desc(incidentResponseIncidents.detectedAt))
        .limit(filters?.limit || 100)
        .offset(filters?.offset || 0);

      return incidents as IRIncident[];
    } catch (error) {
      console.error('Error getting incidents:', error);
      throw new Error('Failed to get incidents');
    }
  }

  /**
   * Update incident status
   */
  static async updateIncidentStatus(
    incidentId: number,
    status: IRIncident['status'],
    updateData?: {
      assignedTo?: string;
      incidentCoordinator?: string;
      containmentActions?: any[];
      eradicationActions?: any[];
      recoveryActions?: any[];
      rootCause?: string;
      forensicAnalysis?: string;
      regulatoryReporting?: any;
    }
  ): Promise<void> {
    try {
      const updateFields: any = {
        status,
        updatedAt: new Date(),
      };

      // Set timestamps based on status
      if (status === 'analyzing' && !updateData?.assignedTo) {
        updateFields.analyzedAt = new Date();
      } else if (status === 'contained') {
        updateFields.containedAt = new Date();
      } else if (status === 'eradicated') {
        updateFields.eradicatedAt = new Date();
        updateFields.containedAt = new Date();
      } else if (status === 'recovered') {
        updateFields.recoveredAt = new Date();
      } else if (status === 'closed') {
        updateFields.closedAt = new Date();
      }

      if (updateData?.assignedTo) {
        updateFields.assignedTo = updateData.assignedTo;
      }
      if (updateData?.incidentCoordinator) {
        updateFields.incidentCoordinator = updateData.incidentCoordinator;
      }
      if (updateData?.containmentActions) {
        updateFields.containmentActions = updateData.containmentActions;
      }
      if (updateData?.eradicationActions) {
        updateFields.eradicationActions = updateData.eradicationActions;
      }
      if (updateData?.recoveryActions) {
        updateFields.recoveryActions = updateData.recoveryActions;
      }
      if (updateData?.rootCause) {
        updateFields.rootCause = updateData.rootCause;
      }
      if (updateData?.forensicAnalysis) {
        updateFields.forensicAnalysis = updateData.forensicAnalysis;
      }
      if (updateData?.regulatoryReporting) {
        updateFields.regulatoryReporting = updateData.regulatoryReporting;
      }

      await db
        .update(incidentResponseIncidents)
        .set(updateFields)
        .where(eq(incidentResponseIncidents.id, incidentId));
    } catch (error) {
      console.error('Error updating incident status:', error);
      throw new Error('Failed to update incident status');
    }
  }

  /**
   * Add team member to IR team
   */
  static async addTeamMember(
    organizationId: string,
    memberData: {
      userId: string;
      role: 'incident_commander' | 'technical_lead' | 'communications_lead' | 'legal_lead' | 'executive_sponsor' | 'team_member' | 'observer';
      isPrimary?: boolean;
      isOnCall?: boolean;
      onCallSchedule?: any;
      contactInfo?: Record<string, any>;
      expertise?: string[];
      certifications?: string[];
    }
  ): Promise<any> {
    try {
      const [member] = await db
        .insert(irTeamMembers)
        .values({
          organizationId,
          userId: memberData.userId,
          role: memberData.role,
          isPrimary: memberData.isPrimary || false,
          isOnCall: memberData.isOnCall || false,
          onCallSchedule: memberData.onCallSchedule,
          contactInfo: memberData.contactInfo || {},
          expertise: memberData.expertise || [],
          certifications: memberData.certifications || [],
        })
        .returning();

      return member;
    } catch (error) {
      console.error('Error adding team member:', error);
      throw new Error('Failed to add team member');
    }
  }

  /**
   * Get IR team members
   */
  static async getTeamMembers(
    organizationId: string,
    filters?: {
      role?: string;
      isActive?: boolean;
      isOnCall?: boolean;
    }
  ): Promise<any[]> {
    try {
      const conditions = [eq(irTeamMembers.organizationId, organizationId)];

      if (filters?.role) {
        conditions.push(eq(irTeamMembers.role, filters.role as any));
      }
      if (filters?.isActive !== undefined) {
        conditions.push(eq(irTeamMembers.isActive, filters.isActive));
      }

      const members = await db
        .select()
        .from(irTeamMembers)
        .where(and(...conditions))
        .orderBy(desc(irTeamMembers.isPrimary));

      return members;
    } catch (error) {
      console.error('Error getting team members:', error);
      throw new Error('Failed to get team members');
    }
  }

  /**
   * Create runbook
   */
  static async createRunbook(
    organizationId: string,
    runbookData: {
      createdBy?: string;
      name: string;
      description?: string;
      incidentType: IRIncident['incidentType'];
      severity?: IRIncident['severity'];
      detectionProcedures?: any[];
      triageProcedures?: any[];
      containmentProcedures?: any[];
      eradicationProcedures?: any[];
      recoveryProcedures?: any[];
      communicationTemplates?: Record<string, any>;
      escalationCriteria?: any[];
      escalationContacts?: any[];
      tools?: string[];
      references?: string[];
      tags?: any[];
    }
  ): Promise<any> {
    try {
      const [runbook] = await db
        .insert(irRunbooks)
        .values({
          organizationId,
          createdBy: runbookData.createdBy,
          title: runbookData.name,
          description: runbookData.description,
          incidentType: runbookData.incidentType,
          severity: runbookData.severity || 'high',
          status: 'draft',
          version: 1,
          procedures: {
            detection: runbookData.detectionProcedures || [],
            triage: runbookData.triageProcedures || [],
            containment: runbookData.containmentProcedures || [],
            eradication: runbookData.eradicationProcedures || [],
            recovery: runbookData.recoveryProcedures || [],
          },
          checklists: [],
          escalationPaths: runbookData.escalationCriteria || [],
          communicationTemplates: Array.isArray(runbookData.communicationTemplates) 
            ? runbookData.communicationTemplates 
            : Object.entries(runbookData.communicationTemplates || {}).map(([key, value]) => ({ type: key, ...value })),
          toolsAndResources: [...(runbookData.tools || []), ...(runbookData.references || [])],
          tags: runbookData.tags || [],
        })
        .returning();

      return runbook;
    } catch (error) {
      console.error('Error creating runbook:', error);
      throw new Error('Failed to create runbook');
    }
  }

  /**
   * Get runbooks
   */
  static async getRunbooks(
    organizationId: string,
    filters?: {
      incidentType?: string;
      severity?: string;
      isActive?: boolean;
    }
  ): Promise<any[]> {
    try {
      const conditions = [eq(irRunbooks.organizationId, organizationId)];

      if (filters?.incidentType) {
        conditions.push(eq(irRunbooks.incidentType, filters.incidentType as any));
      }
      if (filters?.severity) {
        conditions.push(eq(irRunbooks.severity, filters.severity as any));
      }
      if (filters?.isActive !== undefined) {
        conditions.push(eq(irRunbooks.status, filters.isActive ? 'active' : 'archived'));
      }

      const runbooks = await db
        .select()
        .from(irRunbooks)
        .where(and(...conditions))
        .orderBy(desc(irRunbooks.status), desc(irRunbooks.updatedAt));

      return runbooks;
    } catch (error) {
      console.error('Error getting runbooks:', error);
      throw new Error('Failed to get runbooks');
    }
  }

  /**
   * Schedule drill
   */
  static async scheduleDrill(
    organizationId: string,
    drillData: {
      scheduledBy?: string;
      drillName: string;
      drillType: 'tabletop' | 'walkthrough' | 'simulation' | 'full_scale' | 'red_team' | 'blue_team';
      scenario: string;
      objectives?: string[];
      scheduledDate: Date;
      participants?: string[];
      observers?: string[];
      tags?: any[];
    }
  ): Promise<any> {
    try {
      const [drill] = await db
        .insert(irDrills)
        .values({
          organizationId,
          scheduledBy: drillData.scheduledBy,
          drillName: drillData.drillName,
          drillType: drillData.drillType,
          status: 'scheduled',
          scenario: drillData.scenario,
          objectives: drillData.objectives || [],
          scheduledDate: drillData.scheduledDate,
          participants: drillData.participants || [],
          observers: drillData.observers || [],
          tags: drillData.tags || [],
        })
        .returning();

      return drill;
    } catch (error) {
      console.error('Error scheduling drill:', error);
      throw new Error('Failed to schedule drill');
    }
  }

  /**
   * Get drills
   */
  static async getDrills(
    organizationId: string,
    filters?: {
      status?: string;
      drillType?: string;
      dateFrom?: Date;
      dateTo?: Date;
    }
  ): Promise<any[]> {
    try {
      const conditions = [eq(irDrills.organizationId, organizationId)];

      if (filters?.status) {
        conditions.push(eq(irDrills.status, filters.status as any));
      }
      if (filters?.drillType) {
        conditions.push(eq(irDrills.drillType, filters.drillType as any));
      }
      if (filters?.dateFrom) {
        conditions.push(gte(irDrills.scheduledDate, filters.dateFrom));
      }
      if (filters?.dateTo) {
        conditions.push(lte(irDrills.scheduledDate, filters.dateTo));
      }

      const drills = await db
        .select()
        .from(irDrills)
        .where(and(...conditions))
        .orderBy(desc(irDrills.scheduledDate));

      return drills;
    } catch (error) {
      console.error('Error getting drills:', error);
      throw new Error('Failed to get drills');
    }
  }

  /**
   * Complete drill
   */
  static async completeDrill(
    drillId: number,
    results: {
      findings?: any[];
      strengths?: any[];
      weaknesses?: any[];
      recommendations?: any[];
      actionItems?: any[];
      responseTime?: number;
      containmentTime?: number;
      recoveryTime?: number;
      score?: number;
      lessonsLearned?: string;
      reportUrl?: string;
    }
  ): Promise<void> {
    try {
      await db
        .update(irDrills)
        .set({
          status: 'completed',
          completedDate: new Date(),
          results: results,
          findings: results.findings || [],
          strengths: results.strengths || [],
          weaknesses: results.weaknesses || [],
          recommendations: results.recommendations || [],
          actionItems: results.actionItems || [],
          responseTime: results.responseTime,
          containmentTime: results.containmentTime,
          recoveryTime: results.recoveryTime,
          score: results.score,
          lessonsLearned: results.lessonsLearned,
          reportUrl: results.reportUrl,
          updatedAt: new Date(),
        })
        .where(eq(irDrills.id, drillId));
    } catch (error) {
      console.error('Error completing drill:', error);
      throw new Error('Failed to complete drill');
    }
  }

  /**
   * Get incident response metrics
   */
  static async getMetrics(organizationId: string, dateFrom?: Date, dateTo?: Date): Promise<any> {
    try {
      const conditions = [eq(incidentResponseIncidents.organizationId, organizationId)];
      
      if (dateFrom) {
        conditions.push(gte(incidentResponseIncidents.detectedAt, dateFrom));
      }
      if (dateTo) {
        conditions.push(lte(incidentResponseIncidents.detectedAt, dateTo));
      }

      const incidents = await db
        .select()
        .from(incidentResponseIncidents)
        .where(and(...conditions));

      const totalIncidents = incidents.length;
      const byStatus = incidents.reduce((acc, inc) => {
        acc[inc.status] = (acc[inc.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const bySeverity = incidents.reduce((acc, inc) => {
        acc[inc.severity] = (acc[inc.severity] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const byType = incidents.reduce((acc, inc) => {
        acc[inc.incidentType] = (acc[inc.incidentType] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const closedIncidents = incidents.filter(i => i.status === 'closed' || i.status === 'post_incident_review');
      const avgResolutionTime = closedIncidents.length > 0
        ? closedIncidents.reduce((sum, inc) => {
            if (inc.detectedAt && inc.closedAt) {
              const detected = inc.detectedAt instanceof Date ? inc.detectedAt : new Date(inc.detectedAt);
              const closed = inc.closedAt instanceof Date ? inc.closedAt : new Date(inc.closedAt);
              return sum + (closed.getTime() - detected.getTime());
            }
            return sum;
          }, 0) / closedIncidents.length / (1000 * 60 * 60) // Convert to hours
        : 0;

      return {
        totalIncidents,
        byStatus,
        bySeverity,
        byType,
        avgResolutionTime: Math.round(avgResolutionTime * 100) / 100,
        openIncidents: incidents.filter(i => !['closed', 'post_incident_review'].includes(i.status)).length,
        criticalIncidents: incidents.filter(i => i.severity === 'critical' && !['closed', 'post_incident_review'].includes(i.status)).length,
      };
    } catch (error) {
      console.error('Error getting metrics:', error);
      throw new Error('Failed to get metrics');
    }
  }
}
