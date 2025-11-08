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
  assets,
  risks,
  riskTreatmentPlans,
} from '@/lib/db/schemas';
import { eq, and, desc, gte, sql } from 'drizzle-orm';

export class RiskAssessmentService {
  /**
   * Generate unique risk number
   */
  private static async generateRiskNumber(organizationId: string): Promise<string> {
    const year = new Date().getFullYear();
    const count = await db
      .select({ count: sql<number>`count(*)` })
      .from(risks)
      .where(
        and(
          eq(risks.organizationId, organizationId),
          sql`EXTRACT(YEAR FROM ${risks.createdAt}) = ${year}`
        )
      );
    
    return `RISK-${year}-${String((count[0]?.count || 0) + 1).padStart(4, '0')}`;
  }

  /**
   * Calculate risk score and level
   */
  private static calculateRiskScore(likelihood: number, impact: number): { score: number; level: string } {
    const score = likelihood * impact;
    let level: string;
    
    if (score <= 4) level = 'very_low';
    else if (score <= 8) level = 'low';
    else if (score <= 12) level = 'medium';
    else if (score <= 16) level = 'high';
    else if (score <= 20) level = 'very_high';
    else level = 'critical';
    
    return { score, level };
  }

  /**
   * Create asset
   */
  static async createAsset(
    organizationId: string,
    asset: {
      createdBy?: string;
      assetName: string;
      assetType: string;
      description?: string;
      identifier?: string;
      owner?: string;
      location?: string;
      criticality?: string;
      dataClassification?: string;
      confidentiality?: string;
      integrity?: string;
      availability?: string;
      tags?: string[];
      metadata?: Record<string, any>;
    }
  ) {
    try {
      const [newAsset] = await db
        .insert(assets)
        .values({
          organizationId,
          createdBy: asset.createdBy,
          assetName: asset.assetName,
          assetType: asset.assetType as any,
          description: asset.description,
          identifier: asset.identifier,
          owner: asset.owner,
          location: asset.location,
          criticality: asset.criticality || 'medium',
          dataClassification: asset.dataClassification,
          confidentiality: asset.confidentiality || 'medium',
          integrity: asset.integrity || 'medium',
          availability: asset.availability || 'medium',
          tags: asset.tags || [],
          metadata: asset.metadata || {},
        })
        .returning();

      return newAsset;
    } catch (error) {
      console.error('Error creating asset:', error);
      throw new Error('Failed to create asset');
    }
  }

  /**
   * Create risk
   */
  static async createRisk(
    organizationId: string,
    risk: {
      identifiedBy?: string;
      owner?: string;
      title: string;
      description: string;
      assetId?: number;
      threat: string;
      vulnerability: string;
      likelihood: number; // 1-5
      impact: number; // 1-5
      businessImpact?: string;
      financialImpact?: {
        amount: number;
        currency: string;
        description?: string;
      };
      operationalImpact?: string;
      reputationImpact?: string;
      tags?: string[];
      metadata?: Record<string, any>;
    }
  ) {
    try {
      const riskNumber = await this.generateRiskNumber(organizationId);
      const { score, level } = this.calculateRiskScore(risk.likelihood, risk.impact);

      const [newRisk] = await db
        .insert(risks)
        .values({
          organizationId,
          riskNumber,
          identifiedBy: risk.identifiedBy,
          owner: risk.owner,
          title: risk.title,
          description: risk.description,
          assetId: risk.assetId,
          threat: risk.threat,
          vulnerability: risk.vulnerability,
          likelihood: risk.likelihood,
          impact: risk.impact,
          riskScore: score,
          riskLevel: level as any,
          businessImpact: risk.businessImpact,
          financialImpact: risk.financialImpact,
          operationalImpact: risk.operationalImpact,
          reputationImpact: risk.reputationImpact,
          status: 'identified',
          reviewFrequency: 90,
          tags: risk.tags || [],
          metadata: risk.metadata || {},
        })
        .returning();

      return newRisk;
    } catch (error) {
      console.error('Error creating risk:', error);
      throw new Error('Failed to create risk');
    }
  }

  /**
   * Create risk treatment plan
   */
  static async createTreatmentPlan(
    riskId: number,
    plan: {
      createdBy?: string;
      treatmentOption: string;
      description: string;
      actions: any[];
      controls?: any[];
      startDate?: Date;
      targetCompletionDate?: Date;
      responsible?: string;
      budget?: {
        amount: number;
        currency: string;
        description?: string;
      };
    }
  ) {
    try {
      const [newPlan] = await db
        .insert(riskTreatmentPlans)
        .values({
          riskId,
          createdBy: plan.createdBy,
          treatmentOption: plan.treatmentOption as any,
          description: plan.description,
          actions: plan.actions,
          controls: plan.controls || [],
          startDate: plan.startDate,
          targetCompletionDate: plan.targetCompletionDate,
          responsible: plan.responsible,
          budget: plan.budget,
          status: 'planned',
          progress: 0,
        })
        .returning();

      // Update risk status
      await db
        .update(risks)
        .set({
          status: 'treated',
          treatmentOption: plan.treatmentOption as any,
          treatmentPlan: {
            planId: newPlan.id,
            description: plan.description,
            actions: plan.actions,
          },
          updatedAt: new Date(),
        })
        .where(eq(risks.id, riskId));

      return newPlan;
    } catch (error) {
      console.error('Error creating treatment plan:', error);
      throw new Error('Failed to create treatment plan');
    }
  }

  /**
   * Get risks
   */
  static async getRisks(
    organizationId: string,
    filters?: {
      riskLevel?: string;
      status?: string;
      assetId?: number;
      limit?: number;
      offset?: number;
    }
  ) {
    try {
      const conditions: any[] = [eq(risks.organizationId, organizationId)];

      if (filters?.riskLevel) {
        conditions.push(eq(risks.riskLevel, filters.riskLevel as any));
      }
      if (filters?.status) {
        conditions.push(eq(risks.status, filters.status as any));
      }
      if (filters?.assetId) {
        conditions.push(eq(risks.assetId, filters.assetId));
      }

      const riskList = await db
        .select()
        .from(risks)
        .where(and(...conditions))
        .orderBy(desc(risks.riskScore))
        .limit(filters?.limit || 100)
        .offset(filters?.offset || 0);

      return riskList;
    } catch (error) {
      console.error('Error getting risks:', error);
      throw new Error('Failed to get risks');
    }
  }

  /**
   * Get assets
   */
  static async getAssets(
    organizationId: string,
    filters?: {
      assetType?: string;
      isActive?: boolean;
    }
  ) {
    try {
      const conditions: any[] = [eq(assets.organizationId, organizationId)];

      if (filters?.assetType) {
        conditions.push(eq(assets.assetType, filters.assetType as any));
      }
      if (filters?.isActive !== undefined) {
        conditions.push(eq(assets.isActive, filters.isActive));
      }

      const assetList = await db
        .select()
        .from(assets)
        .where(and(...conditions))
        .orderBy(desc(assets.createdAt));

      return assetList;
    } catch (error) {
      console.error('Error getting assets:', error);
      throw new Error('Failed to get assets');
    }
  }
}

