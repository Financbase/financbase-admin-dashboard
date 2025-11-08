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
  policyDocuments,
  policyVersions,
  policyAssignments,
  policyApprovalWorkflows,
} from '@/lib/db/schemas';
import { eq, and, desc, gte, lte, sql } from 'drizzle-orm';

export interface PolicyDocument {
  id: number;
  organizationId: string;
  policyNumber: string;
  createdBy?: string;
  approvedBy?: string;
  title: string;
  policyType: string;
  description?: string;
  content: string;
  summary?: string;
  version: number;
  status: 'draft' | 'review' | 'approval' | 'published' | 'archived' | 'superseded';
  currentApprover?: string;
  approvalHistory: any[];
  reviewHistory: any[];
  requiresAcknowledgment: boolean;
  acknowledgmentDeadline?: Date;
  lastReviewedAt?: Date;
  nextReviewDate?: Date;
  reviewFrequency: number;
  reviewRequired: boolean;
  supersedesPolicyId?: number;
  relatedPolicies: number[];
  complianceFrameworks: string[];
  requirements: string[];
  tags: string[];
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  archivedAt?: Date;
}

export class PolicyManagementService {
  /**
   * Generate unique policy number
   */
  private static async generatePolicyNumber(organizationId: string): Promise<string> {
    const year = new Date().getFullYear();
    const count = await db
      .select({ count: sql<number>`count(*)` })
      .from(policyDocuments)
      .where(
        and(
          eq(policyDocuments.organizationId, organizationId),
          sql`EXTRACT(YEAR FROM ${policyDocuments.createdAt}) = ${year}`
        )
      );
    
    return `POL-${year}-${String((count[0]?.count || 0) + 1).padStart(4, '0')}`;
  }

  /**
   * Create policy document
   */
  static async createPolicy(
    organizationId: string,
    policy: {
      createdBy?: string;
      title: string;
      policyType: string;
      description?: string;
      content: string;
      summary?: string;
      requiresAcknowledgment?: boolean;
      acknowledgmentDeadline?: Date;
      reviewFrequency?: number;
      reviewRequired?: boolean;
      complianceFrameworks?: string[];
      requirements?: string[];
      tags?: string[];
      metadata?: Record<string, any>;
    }
  ): Promise<PolicyDocument> {
    try {
      const policyNumber = await this.generatePolicyNumber(organizationId);
      
      const [newPolicy] = await db
        .insert(policyDocuments)
        .values({
          organizationId,
          policyNumber,
          createdBy: policy.createdBy,
          title: policy.title,
          policyType: policy.policyType as any,
          description: policy.description,
          content: policy.content,
          summary: policy.summary,
          version: 1,
          status: 'draft',
          requiresAcknowledgment: policy.requiresAcknowledgment || false,
          acknowledgmentDeadline: policy.acknowledgmentDeadline,
          reviewFrequency: policy.reviewFrequency || 365,
          reviewRequired: policy.reviewRequired !== false,
          complianceFrameworks: policy.complianceFrameworks || [],
          requirements: policy.requirements || [],
          tags: policy.tags || [],
          metadata: policy.metadata || {},
        })
        .returning();

      // Create initial version
      await db.insert(policyVersions).values({
        policyId: newPolicy.id,
        version: 1,
        content: policy.content,
        summary: policy.summary,
        createdBy: policy.createdBy,
        isCurrent: true,
      });

      return newPolicy;
    } catch (error) {
      console.error('Error creating policy:', error);
      throw new Error('Failed to create policy');
    }
  }

  /**
   * Get policy by ID
   */
  static async getPolicyById(policyId: number): Promise<PolicyDocument | null> {
    try {
      const [policy] = await db
        .select()
        .from(policyDocuments)
        .where(eq(policyDocuments.id, policyId))
        .limit(1);

      return policy || null;
    } catch (error) {
      console.error('Error getting policy:', error);
      throw new Error('Failed to get policy');
    }
  }

  /**
   * Get policies with filters
   */
  static async getPolicies(
    organizationId: string,
    filters?: {
      policyType?: string;
      status?: string;
      complianceFramework?: string;
      limit?: number;
      offset?: number;
    }
  ): Promise<PolicyDocument[]> {
    try {
      const conditions: any[] = [eq(policyDocuments.organizationId, organizationId)];

      if (filters?.policyType) {
        conditions.push(eq(policyDocuments.policyType, filters.policyType as any));
      }
      if (filters?.status) {
        conditions.push(eq(policyDocuments.status, filters.status as any));
      }
      if (filters?.complianceFramework) {
        conditions.push(sql`${filters.complianceFramework} = ANY(${policyDocuments.complianceFrameworks})`);
      }

      const policies = await db
        .select()
        .from(policyDocuments)
        .where(and(...conditions))
        .orderBy(desc(policyDocuments.createdAt))
        .limit(filters?.limit || 100)
        .offset(filters?.offset || 0);

      return policies;
    } catch (error) {
      console.error('Error getting policies:', error);
      throw new Error('Failed to get policies');
    }
  }

  /**
   * Update policy version
   */
  static async updatePolicyVersion(
    policyId: number,
    updateData: {
      content: string;
      summary?: string;
      changelog?: string;
      updatedBy: string;
    }
  ): Promise<PolicyDocument> {
    try {
      const policy = await this.getPolicyById(policyId);
      if (!policy) {
        throw new Error('Policy not found');
      }

      const newVersion = policy.version + 1;

      // Create new version
      await db.insert(policyVersions).values({
        policyId,
        version: newVersion,
        content: updateData.content,
        summary: updateData.summary,
        changelog: updateData.changelog,
        createdBy: updateData.updatedBy,
        isCurrent: false,
      });

      // Mark old version as not current
      await db
        .update(policyVersions)
        .set({ isCurrent: false })
        .where(
          and(
            eq(policyVersions.policyId, policyId),
            eq(policyVersions.version, policy.version)
          )
        );

      // Update policy
      const [updatedPolicy] = await db
        .update(policyDocuments)
        .set({
          content: updateData.content,
          summary: updateData.summary,
          version: newVersion,
          status: 'draft', // Reset to draft when updated
          updatedAt: new Date(),
        })
        .where(eq(policyDocuments.id, policyId))
        .returning();

      return updatedPolicy;
    } catch (error) {
      console.error('Error updating policy version:', error);
      throw new Error('Failed to update policy version');
    }
  }

  /**
   * Assign policy to users/roles
   */
  static async assignPolicy(
    policyId: number,
    assignment: {
      userId?: string;
      roleId?: string;
      organizationId?: string;
      assignedBy: string;
      requiresAcknowledgment?: boolean;
      deadline?: Date;
    }
  ): Promise<void> {
    try {
      await db.insert(policyAssignments).values({
        policyId,
        userId: assignment.userId,
        roleId: assignment.roleId,
        organizationId: assignment.organizationId,
        assignedBy: assignment.assignedBy,
        requiresAcknowledgment: assignment.requiresAcknowledgment || false,
        deadline: assignment.deadline,
        status: 'assigned',
      });
    } catch (error) {
      console.error('Error assigning policy:', error);
      throw new Error('Failed to assign policy');
    }
  }

  /**
   * Acknowledge policy
   */
  static async acknowledgePolicy(
    assignmentId: number,
    userId: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    try {
      await db
        .update(policyAssignments)
        .set({
          acknowledgedAt: new Date(),
          acknowledgmentIp: ipAddress,
          acknowledgmentUserAgent: userAgent,
          status: 'acknowledged',
          updatedAt: new Date(),
        })
        .where(eq(policyAssignments.id, assignmentId));
    } catch (error) {
      console.error('Error acknowledging policy:', error);
      throw new Error('Failed to acknowledge policy');
    }
  }

  /**
   * Publish policy
   */
  static async publishPolicy(
    policyId: number,
    approvedBy: string
  ): Promise<void> {
    try {
      await db
        .update(policyDocuments)
        .set({
          status: 'published',
          approvedBy,
          publishedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(policyDocuments.id, policyId));

      // Mark current version as current
      const policy = await this.getPolicyById(policyId);
      if (policy) {
        await db
          .update(policyVersions)
          .set({ isCurrent: true, publishedAt: new Date() })
          .where(
            and(
              eq(policyVersions.policyId, policyId),
              eq(policyVersions.version, policy.version)
            )
          );
      }
    } catch (error) {
      console.error('Error publishing policy:', error);
      throw new Error('Failed to publish policy');
    }
  }

  /**
   * Get policy versions
   */
  static async getPolicyVersions(policyId: number): Promise<any[]> {
    try {
      const versions = await db
        .select()
        .from(policyVersions)
        .where(eq(policyVersions.policyId, policyId))
        .orderBy(desc(policyVersions.version));

      return versions;
    } catch (error) {
      console.error('Error getting policy versions:', error);
      throw new Error('Failed to get policy versions');
    }
  }

  /**
   * Get policy assignments
   */
  static async getPolicyAssignments(
    policyId: number,
    filters?: {
      status?: string;
      userId?: string;
    }
  ): Promise<any[]> {
    try {
      const conditions: any[] = [eq(policyAssignments.policyId, policyId)];

      if (filters?.status) {
        conditions.push(eq(policyAssignments.status, filters.status));
      }
      if (filters?.userId) {
        conditions.push(eq(policyAssignments.userId, filters.userId));
      }

      const assignments = await db
        .select()
        .from(policyAssignments)
        .where(and(...conditions))
        .orderBy(desc(policyAssignments.assignedAt));

      return assignments;
    } catch (error) {
      console.error('Error getting policy assignments:', error);
      throw new Error('Failed to get policy assignments');
    }
  }
}

