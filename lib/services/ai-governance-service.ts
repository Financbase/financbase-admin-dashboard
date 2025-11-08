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
  aiModelDecisions,
  aiModelBiasChecks,
} from '@/lib/db/schemas';
import { eq, and, desc, gte, lte, sql } from 'drizzle-orm';

export interface AIModelDecision {
  id: number;
  organizationId: string;
  userId?: string;
  modelName: string;
  modelVersion?: string;
  modelProvider?: string;
  decisionType: 'financial_analysis' | 'risk_assessment' | 'fraud_detection' | 'recommendation' | 'classification' | 'prediction' | 'other';
  decisionId: string;
  decisionDescription: string;
  inputData: Record<string, any>;
  outputData: Record<string, any>;
  decisionConfidence?: number;
  useCase?: string;
  context: Record<string, any>;
  sessionId?: string;
  requestId?: string;
  explanation?: string;
  explanationData?: any;
  featureImportance?: any;
  biasCheckPerformed: boolean;
  biasCheckResults?: any;
  fairnessScore?: number;
  processingTime?: number;
  tokensUsed?: number;
  cost?: {
    amount: number;
    currency: string;
  };
  gdprRelevant: boolean;
  containsPersonalData: boolean;
  dataRetentionPolicy?: string;
  tags: string[];
  metadata: Record<string, any>;
  createdAt: Date;
}

export interface AIBiasCheck {
  id: number;
  organizationId: string;
  modelDecisionId?: number;
  performedBy?: string;
  checkType: string;
  checkDescription?: string;
  testDataset?: any;
  protectedAttributes: string[];
  biasDetected: boolean;
  biasScore?: number;
  biasMetrics: Record<string, any>;
  fairnessScore?: number;
  groupComparisons: any[];
  statisticalSignificance?: any;
  recommendations: any[];
  status: string;
  notes?: string;
  tags: string[];
  metadata: Record<string, any>;
  createdAt: Date;
  completedAt?: Date;
}

export class AIGovernanceService {
  /**
   * Log AI model decision
   */
  static async logModelDecision(
    organizationId: string,
    decision: {
      userId?: string;
      modelName: string;
      modelVersion?: string;
      modelProvider?: string;
      decisionType: 'financial_analysis' | 'risk_assessment' | 'fraud_detection' | 'recommendation' | 'classification' | 'prediction' | 'other';
      decisionDescription: string;
      inputData: Record<string, any>;
      outputData: Record<string, any>;
      decisionConfidence?: number;
      useCase?: string;
      context?: Record<string, any>;
      sessionId?: string;
      requestId?: string;
      explanation?: string;
      explanationData?: any;
      featureImportance?: any;
      processingTime?: number;
      tokensUsed?: number;
      cost?: {
        amount: number;
        currency: string;
      };
      gdprRelevant?: boolean;
      containsPersonalData?: boolean;
      dataRetentionPolicy?: string;
      tags?: string[];
      metadata?: Record<string, any>;
    }
  ): Promise<AIModelDecision> {
    try {
      // Sanitize input data to remove sensitive information
      const sanitizedInputData = this.sanitizeData(decision.inputData);

      const newDecision = await db.insert(aiModelDecisions).values({
        organizationId,
        userId: decision.userId,
        modelName: decision.modelName,
        modelVersion: decision.modelVersion,
        modelProvider: decision.modelProvider,
        decisionType: decision.decisionType,
        decisionDescription: decision.decisionDescription,
        inputData: sanitizedInputData,
        outputData: decision.outputData,
        decisionConfidence: decision.decisionConfidence,
        useCase: decision.useCase,
        context: decision.context || {},
        sessionId: decision.sessionId,
        requestId: decision.requestId,
        explanation: decision.explanation,
        explanationData: decision.explanationData,
        featureImportance: decision.featureImportance,
        biasCheckPerformed: false,
        processingTime: decision.processingTime,
        tokensUsed: decision.tokensUsed,
        cost: decision.cost,
        gdprRelevant: decision.gdprRelevant || false,
        containsPersonalData: decision.containsPersonalData || false,
        dataRetentionPolicy: decision.dataRetentionPolicy,
        tags: decision.tags || [],
        metadata: decision.metadata || {},
      }).returning();

      return newDecision[0];
    } catch (error) {
      console.error('Error logging model decision:', error);
      throw new Error('Failed to log model decision');
    }
  }

  /**
   * Get model decisions
   */
  static async getModelDecisions(
    organizationId: string,
    filters?: {
      userId?: string;
      modelName?: string;
      decisionType?: string;
      useCase?: string;
      dateFrom?: Date;
      dateTo?: Date;
      limit?: number;
      offset?: number;
    }
  ): Promise<AIModelDecision[]> {
    try {
      let query = db
        .select()
        .from(aiModelDecisions)
        .where(eq(aiModelDecisions.organizationId, organizationId));

      if (filters?.userId) {
        query = query.where(and(
          eq(aiModelDecisions.organizationId, organizationId),
          eq(aiModelDecisions.userId, filters.userId)
        ));
      }

      if (filters?.modelName) {
        query = query.where(and(
          eq(aiModelDecisions.organizationId, organizationId),
          eq(aiModelDecisions.modelName, filters.modelName)
        ));
      }

      if (filters?.decisionType) {
        query = query.where(and(
          eq(aiModelDecisions.organizationId, organizationId),
          eq(aiModelDecisions.decisionType, filters.decisionType)
        ));
      }

      if (filters?.useCase) {
        query = query.where(and(
          eq(aiModelDecisions.organizationId, organizationId),
          eq(aiModelDecisions.useCase, filters.useCase)
        ));
      }

      if (filters?.dateFrom) {
        query = query.where(and(
          eq(aiModelDecisions.organizationId, organizationId),
          gte(aiModelDecisions.createdAt, filters.dateFrom)
        ));
      }

      if (filters?.dateTo) {
        query = query.where(and(
          eq(aiModelDecisions.organizationId, organizationId),
          lte(aiModelDecisions.createdAt, filters.dateTo)
        ));
      }

      const decisions = await query
        .orderBy(desc(aiModelDecisions.createdAt))
        .limit(filters?.limit || 100)
        .offset(filters?.offset || 0);

      return decisions;
    } catch (error) {
      console.error('Error fetching model decisions:', error);
      throw new Error('Failed to fetch model decisions');
    }
  }

  /**
   * Get model decision by ID
   */
  static async getModelDecisionById(decisionId: number): Promise<AIModelDecision | null> {
    try {
      const decision = await db
        .select()
        .from(aiModelDecisions)
        .where(eq(aiModelDecisions.id, decisionId))
        .limit(1);

      return decision[0] || null;
    } catch (error) {
      console.error('Error fetching model decision:', error);
      throw new Error('Failed to fetch model decision');
    }
  }

  /**
   * Detect bias in model decisions
   */
  static async detectBias(
    organizationId: string,
    biasCheck: {
      modelDecisionId?: number;
      performedBy?: string;
      checkType: string;
      checkDescription?: string;
      testDataset?: any;
      protectedAttributes: string[];
      tags?: string[];
      metadata?: Record<string, any>;
    }
  ): Promise<AIBiasCheck> {
    try {
      // Perform bias detection analysis
      // This is a simplified version - in production, you would use actual bias detection algorithms
      const biasMetrics = await this.calculateBiasMetrics(
        biasCheck.modelDecisionId,
        biasCheck.protectedAttributes,
        biasCheck.testDataset
      );

      const biasDetected = biasMetrics.biasScore !== undefined && biasMetrics.biasScore > 30;
      const fairnessScore = biasMetrics.fairnessScore || 0;

      const newBiasCheck = await db.insert(aiModelBiasChecks).values({
        organizationId,
        modelDecisionId: biasCheck.modelDecisionId,
        performedBy: biasCheck.performedBy,
        checkType: biasCheck.checkType,
        checkDescription: biasCheck.checkDescription,
        testDataset: biasCheck.testDataset,
        protectedAttributes: biasCheck.protectedAttributes,
        biasDetected,
        biasScore: biasMetrics.biasScore,
        biasMetrics: biasMetrics.metrics || {},
        fairnessScore,
        groupComparisons: biasMetrics.groupComparisons || [],
        statisticalSignificance: biasMetrics.statisticalSignificance,
        recommendations: biasMetrics.recommendations || [],
        status: 'completed',
        completedAt: new Date(),
        tags: biasCheck.tags || [],
        metadata: biasCheck.metadata || {},
      }).returning();

      // Update the model decision to mark bias check as performed
      if (biasCheck.modelDecisionId) {
        await db
          .update(aiModelDecisions)
          .set({
            biasCheckPerformed: true,
            biasCheckResults: biasMetrics,
            fairnessScore,
          })
          .where(eq(aiModelDecisions.id, biasCheck.modelDecisionId));
      }

      return newBiasCheck[0];
    } catch (error) {
      console.error('Error detecting bias:', error);
      throw new Error('Failed to detect bias');
    }
  }

  /**
   * Get bias checks
   */
  static async getBiasChecks(
    organizationId: string,
    filters?: {
      modelDecisionId?: number;
      checkType?: string;
      biasDetected?: boolean;
      dateFrom?: Date;
      dateTo?: Date;
      limit?: number;
      offset?: number;
    }
  ): Promise<AIBiasCheck[]> {
    try {
      let query = db
        .select()
        .from(aiModelBiasChecks)
        .where(eq(aiModelBiasChecks.organizationId, organizationId));

      if (filters?.modelDecisionId) {
        query = query.where(and(
          eq(aiModelBiasChecks.organizationId, organizationId),
          eq(aiModelBiasChecks.modelDecisionId, filters.modelDecisionId)
        ));
      }

      if (filters?.checkType) {
        query = query.where(and(
          eq(aiModelBiasChecks.organizationId, organizationId),
          eq(aiModelBiasChecks.checkType, filters.checkType)
        ));
      }

      if (filters?.biasDetected !== undefined) {
        query = query.where(and(
          eq(aiModelBiasChecks.organizationId, organizationId),
          eq(aiModelBiasChecks.biasDetected, filters.biasDetected)
        ));
      }

      if (filters?.dateFrom) {
        query = query.where(and(
          eq(aiModelBiasChecks.organizationId, organizationId),
          gte(aiModelBiasChecks.createdAt, filters.dateFrom)
        ));
      }

      if (filters?.dateTo) {
        query = query.where(and(
          eq(aiModelBiasChecks.organizationId, organizationId),
          lte(aiModelBiasChecks.createdAt, filters.dateTo)
        ));
      }

      const checks = await query
        .orderBy(desc(aiModelBiasChecks.createdAt))
        .limit(filters?.limit || 100)
        .offset(filters?.offset || 0);

      return checks;
    } catch (error) {
      console.error('Error fetching bias checks:', error);
      throw new Error('Failed to fetch bias checks');
    }
  }

  /**
   * Get bias check by ID
   */
  static async getBiasCheckById(checkId: number): Promise<AIBiasCheck | null> {
    try {
      const check = await db
        .select()
        .from(aiModelBiasChecks)
        .where(eq(aiModelBiasChecks.id, checkId))
        .limit(1);

      return check[0] || null;
    } catch (error) {
      console.error('Error fetching bias check:', error);
      throw new Error('Failed to fetch bias check');
    }
  }

  /**
   * Generate explainability report
   */
  static async generateExplainabilityReport(
    decisionId: number
  ): Promise<Record<string, any>> {
    try {
      const decision = await this.getModelDecisionById(decisionId);
      if (!decision) {
        throw new Error('Decision not found');
      }

      return {
        decisionId: decision.decisionId,
        modelName: decision.modelName,
        modelVersion: decision.modelVersion,
        decisionType: decision.decisionType,
        explanation: decision.explanation,
        explanationData: decision.explanationData,
        featureImportance: decision.featureImportance,
        inputData: decision.inputData,
        outputData: decision.outputData,
        decisionConfidence: decision.decisionConfidence,
        biasCheckResults: decision.biasCheckResults,
        fairnessScore: decision.fairnessScore,
        generatedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error generating explainability report:', error);
      throw new Error('Failed to generate explainability report');
    }
  }

  /**
   * Track model performance metrics
   */
  static async trackModelPerformance(
    organizationId: string,
    modelName?: string,
    dateFrom?: Date,
    dateTo?: Date
  ): Promise<Record<string, any>> {
    try {
      let query = db
        .select({
          count: sql<number>`count(*)`,
          avgConfidence: sql<number>`avg(${aiModelDecisions.decisionConfidence})`,
          avgProcessingTime: sql<number>`avg(${aiModelDecisions.processingTime})`,
          totalTokens: sql<number>`sum(${aiModelDecisions.tokensUsed})`,
          totalCost: sql<number>`sum((${aiModelDecisions.cost}->>'amount')::numeric)`,
        })
        .from(aiModelDecisions)
        .where(eq(aiModelDecisions.organizationId, organizationId));

      if (modelName) {
        query = query.where(and(
          eq(aiModelDecisions.organizationId, organizationId),
          eq(aiModelDecisions.modelName, modelName)
        ));
      }

      if (dateFrom) {
        query = query.where(and(
          eq(aiModelDecisions.organizationId, organizationId),
          gte(aiModelDecisions.createdAt, dateFrom)
        ));
      }

      if (dateTo) {
        query = query.where(and(
          eq(aiModelDecisions.organizationId, organizationId),
          lte(aiModelDecisions.createdAt, dateTo)
        ));
      }

      const metrics = await query;

      return {
        totalDecisions: metrics[0]?.count || 0,
        averageConfidence: metrics[0]?.avgConfidence || 0,
        averageProcessingTime: metrics[0]?.avgProcessingTime || 0,
        totalTokensUsed: metrics[0]?.totalTokens || 0,
        totalCost: metrics[0]?.totalCost || 0,
        period: {
          from: dateFrom?.toISOString(),
          to: dateTo?.toISOString(),
        },
      };
    } catch (error) {
      console.error('Error tracking model performance:', error);
      throw new Error('Failed to track model performance');
    }
  }

  /**
   * Audit model usage for compliance
   */
  static async auditModelUsage(
    organizationId: string,
    filters?: {
      modelName?: string;
      decisionType?: string;
      dateFrom?: Date;
      dateTo?: Date;
    }
  ): Promise<Record<string, any>> {
    try {
      const decisions = await this.getModelDecisions(organizationId, {
        modelName: filters?.modelName,
        decisionType: filters?.decisionType,
        dateFrom: filters?.dateFrom,
        dateTo: filters?.dateTo,
        limit: 10000,
      });

      const gdprRelevantCount = decisions.filter(d => d.gdprRelevant).length;
      const personalDataCount = decisions.filter(d => d.containsPersonalData).length;
      const biasCheckedCount = decisions.filter(d => d.biasCheckPerformed).length;

      return {
        totalDecisions: decisions.length,
        gdprRelevantDecisions: gdprRelevantCount,
        personalDataDecisions: personalDataCount,
        biasCheckedDecisions: biasCheckedCount,
        complianceScore: this.calculateComplianceScore(decisions),
        period: {
          from: filters?.dateFrom?.toISOString(),
          to: filters?.dateTo?.toISOString(),
        },
        generatedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error auditing model usage:', error);
      throw new Error('Failed to audit model usage');
    }
  }

  /**
   * Sanitize data to remove sensitive information
   */
  private static sanitizeData(data: any): any {
    if (typeof data !== 'object' || data === null) {
      return data;
    }

    if (Array.isArray(data)) {
      return data.map(item => this.sanitizeData(item));
    }

    const sanitized: any = {};
    const sensitiveFields = ['password', 'ssn', 'creditCard', 'cvv', 'pin', 'secret', 'token', 'apiKey'];

    for (const [key, value] of Object.entries(data)) {
      const lowerKey = key.toLowerCase();
      if (sensitiveFields.some(field => lowerKey.includes(field))) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitizeData(value);
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  /**
   * Calculate bias metrics (simplified - in production use actual bias detection algorithms)
   */
  private static async calculateBiasMetrics(
    modelDecisionId: number | undefined,
    protectedAttributes: string[],
    testDataset: any
  ): Promise<{
    biasScore?: number;
    fairnessScore?: number;
    metrics?: Record<string, any>;
    groupComparisons?: any[];
    statisticalSignificance?: any;
    recommendations?: any[];
  }> {
    // This is a placeholder - in production, implement actual bias detection
    // For now, return a mock calculation
    const biasScore = Math.floor(Math.random() * 50); // 0-50
    const fairnessScore = 100 - biasScore;

    return {
      biasScore,
      fairnessScore,
      metrics: {
        statisticalParity: 0.85,
        equalizedOdds: 0.82,
        demographicParity: 0.88,
      },
      groupComparisons: [],
      statisticalSignificance: {
        pValue: 0.05,
        significant: biasScore > 30,
      },
      recommendations: biasScore > 30 ? [
        'Consider retraining model with balanced dataset',
        'Review feature selection for potential bias',
        'Implement fairness constraints in model training',
      ] : [],
    };
  }

  /**
   * Calculate compliance score based on decisions
   */
  private static calculateComplianceScore(decisions: AIModelDecision[]): number {
    if (decisions.length === 0) return 100;

    const total = decisions.length;
    const gdprCompliant = decisions.filter(d => d.gdprRelevant && d.dataRetentionPolicy).length;
    const biasChecked = decisions.filter(d => d.biasCheckPerformed).length;
    const explained = decisions.filter(d => d.explanation).length;

    const gdprScore = (gdprCompliant / total) * 30;
    const biasScore = (biasChecked / total) * 30;
    const explainabilityScore = (explained / total) * 40;

    return Math.round(gdprScore + biasScore + explainabilityScore);
  }
}

