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
  dataClassifications,
  dataRetentionPolicies,
} from '@/lib/db/schemas';
import { eq, and, desc, gte, lte } from 'drizzle-orm';

export interface DataClassification {
  id: number;
  organizationId: string;
  classifiedBy?: string;
  dataType: string;
  dataCategory: string;
  classificationLevel: 'public' | 'internal' | 'confidential' | 'restricted' | 'highly_restricted';
  dataLocation: string;
  dataSource?: string;
  dataFormat?: string;
  containsPII: boolean;
  piiTypes: string[];
  piiFields: string[];
  sensitivityScore?: number;
  sensitivityFactors: string[];
  retentionPolicy?: string;
  retentionPeriod?: number;
  retentionUnit?: string;
  autoDelete: boolean;
  deleteAfter?: Date;
  complianceFrameworks: string[];
  legalBasis?: string;
  requiresEncryption: boolean;
  requiresAccessControl: boolean;
  classificationMethod: string;
  classificationConfidence?: number;
  isActive: boolean;
  lastReviewed?: Date;
  nextReview?: Date;
  description?: string;
  tags: string[];
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export class DataClassificationService {
  /**
   * Classify data automatically
   */
  static async classifyData(
    organizationId: string,
    classification: {
      classifiedBy?: string;
      dataType: string;
      dataCategory: string;
      dataLocation: string;
      dataSource?: string;
      dataFormat?: string;
      dataSample?: any; // Sample data to analyze
      description?: string;
      tags?: string[];
      metadata?: Record<string, any>;
    }
  ): Promise<DataClassification> {
    try {
      // Detect PII in data sample
      const piiDetection = this.detectPII(classification.dataSample || {});
      
      // Determine classification level based on PII and data category
      const classificationLevel = this.determineClassificationLevel(
        classification.dataCategory,
        piiDetection.containsPII,
        piiDetection.piiTypes
      );

      // Calculate sensitivity score
      const sensitivityScore = this.calculateSensitivityScore(
        classificationLevel,
        piiDetection.containsPII,
        piiDetection.piiTypes.length
      );

      // Get applicable retention policy
      const retentionPolicy = await this.getApplicableRetentionPolicy(
        organizationId,
        classification.dataType,
        classification.dataCategory
      );

      // Determine compliance frameworks
      const complianceFrameworks = this.determineComplianceFrameworks(
        classificationLevel,
        piiDetection.containsPII,
        piiDetection.piiTypes
      );

      // Determine if encryption and access control are required
      const requiresEncryption = classificationLevel === 'restricted' || classificationLevel === 'highly_restricted';
      const requiresAccessControl = classificationLevel !== 'public';

      const newClassification = await db.insert(dataClassifications).values({
        organizationId,
        classifiedBy: classification.classifiedBy,
        dataType: classification.dataType,
        dataCategory: classification.dataCategory,
        classificationLevel,
        dataLocation: classification.dataLocation,
        dataSource: classification.dataSource,
        dataFormat: classification.dataFormat,
        containsPII: piiDetection.containsPII,
        piiTypes: piiDetection.piiTypes,
        piiFields: piiDetection.piiFields,
        sensitivityScore,
        sensitivityFactors: this.getSensitivityFactors(classificationLevel, piiDetection),
        retentionPolicy: retentionPolicy?.policyName,
        retentionPeriod: retentionPolicy?.retentionPeriod,
        retentionUnit: retentionPolicy?.retentionUnit,
        autoDelete: retentionPolicy?.actionOnExpiry === 'delete',
        deleteAfter: retentionPolicy ? this.calculateDeleteDate(retentionPolicy) : undefined,
        complianceFrameworks,
        legalBasis: retentionPolicy?.legalBasis,
        requiresEncryption,
        requiresAccessControl,
        classificationMethod: 'automated',
        classificationConfidence: this.calculateConfidence(piiDetection, classificationLevel),
        isActive: true,
        lastReviewed: new Date(),
        nextReview: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // Review in 90 days
        description: classification.description,
        tags: classification.tags || [],
        metadata: classification.metadata || {},
      }).returning();

      return newClassification[0];
    } catch (error) {
      console.error('Error classifying data:', error);
      throw new Error('Failed to classify data');
    }
  }

  /**
   * Detect PII in data
   */
  static detectPII(data: any): {
    containsPII: boolean;
    piiTypes: string[];
    piiFields: string[];
  } {
    const piiPatterns: Record<string, RegExp[]> = {
      email: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/i],
      ssn: [/\b\d{3}-\d{2}-\d{4}\b/, /\b\d{9}\b/],
      creditCard: [/\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/],
      phone: [/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/, /\b\(\d{3}\)\s?\d{3}[-.]?\d{4}\b/],
      address: [/\d+\s+[A-Za-z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr|Court|Ct|Place|Pl)/i],
      dateOfBirth: [/\b\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}\b/],
      passport: [/\b[A-Z]{1,2}\d{6,9}\b/],
      driverLicense: [/\b[A-Z]{1,2}\d{6,8}\b/],
      bankAccount: [/\b\d{8,17}\b/],
      routingNumber: [/\b\d{9}\b/],
    };

    const piiTypes: string[] = [];
    const piiFields: string[] = [];

    const checkValue = (value: any, fieldName: string = ''): void => {
      if (value === null || value === undefined) return;

      if (typeof value === 'string') {
        for (const [piiType, patterns] of Object.entries(piiPatterns)) {
          for (const pattern of patterns) {
            if (pattern.test(value)) {
              if (!piiTypes.includes(piiType)) {
                piiTypes.push(piiType);
              }
              if (fieldName && !piiFields.includes(fieldName)) {
                piiFields.push(fieldName);
              }
            }
          }
        }
      } else if (typeof value === 'object') {
        if (Array.isArray(value)) {
          value.forEach((item, index) => {
            checkValue(item, `${fieldName}[${index}]`);
          });
        } else {
          for (const [key, val] of Object.entries(value)) {
            const newFieldName = fieldName ? `${fieldName}.${key}` : key;
            checkValue(val, newFieldName);
          }
        }
      }
    };

    checkValue(data);

    return {
      containsPII: piiTypes.length > 0,
      piiTypes,
      piiFields,
    };
  }

  /**
   * Determine classification level
   */
  private static determineClassificationLevel(
    dataCategory: string,
    containsPII: boolean,
    piiTypes: string[]
  ): DataClassification['classificationLevel'] {
    // Highly sensitive PII types
    const highlySensitivePII = ['ssn', 'creditCard', 'bankAccount', 'routingNumber', 'passport', 'driverLicense'];
    
    if (containsPII && piiTypes.some(type => highlySensitivePII.includes(type))) {
      return 'highly_restricted';
    }

    if (containsPII) {
      return 'restricted';
    }

    if (dataCategory === 'financial' || dataCategory === 'health') {
      return 'confidential';
    }

    if (dataCategory === 'business' || dataCategory === 'internal') {
      return 'internal';
    }

    return 'public';
  }

  /**
   * Calculate sensitivity score (0-100)
   */
  private static calculateSensitivityScore(
    classificationLevel: DataClassification['classificationLevel'],
    containsPII: boolean,
    piiTypeCount: number
  ): number {
    let score = 0;

    // Base score from classification level
    const levelScores: Record<string, number> = {
      public: 10,
      internal: 30,
      confidential: 50,
      restricted: 75,
      highly_restricted: 95,
    };
    score = levelScores[classificationLevel] || 0;

    // Add points for PII
    if (containsPII) {
      score += Math.min(piiTypeCount * 5, 20);
    }

    return Math.min(score, 100);
  }

  /**
   * Get applicable retention policy
   */
  private static async getApplicableRetentionPolicy(
    organizationId: string,
    dataType: string,
    dataCategory: string
  ): Promise<any> {
    try {
      const policies = await db
        .select()
        .from(dataRetentionPolicies)
        .where(
          and(
            eq(dataRetentionPolicies.organizationId, organizationId),
            eq(dataRetentionPolicies.isActive, true)
          )
        );

      // Find matching policy
      for (const policy of policies) {
        if (policy.dataTypes.includes(dataType) || policy.dataCategories.includes(dataCategory)) {
          return policy;
        }
      }

      // Return default policy if exists
      const defaultPolicy = policies.find(p => p.isDefault);
      return defaultPolicy || null;
    } catch (error) {
      console.error('Error getting retention policy:', error);
      return null;
    }
  }

  /**
   * Determine compliance frameworks
   */
  private static determineComplianceFrameworks(
    classificationLevel: DataClassification['classificationLevel'],
    containsPII: boolean,
    piiTypes: string[]
  ): string[] {
    const frameworks: string[] = [];

    if (containsPII) {
      frameworks.push('GDPR');
      frameworks.push('CCPA');
    }

    if (piiTypes.includes('ssn') || piiTypes.includes('creditCard')) {
      frameworks.push('PCI-DSS');
    }

    if (classificationLevel === 'restricted' || classificationLevel === 'highly_restricted') {
      frameworks.push('SOC2');
    }

    return frameworks;
  }

  /**
   * Get sensitivity factors
   */
  private static getSensitivityFactors(
    classificationLevel: DataClassification['classificationLevel'],
    piiDetection: { containsPII: boolean; piiTypes: string[] }
  ): string[] {
    const factors: string[] = [];

    factors.push(`Classification level: ${classificationLevel}`);

    if (piiDetection.containsPII) {
      factors.push(`Contains PII: ${piiDetection.piiTypes.join(', ')}`);
    }

    if (classificationLevel === 'restricted' || classificationLevel === 'highly_restricted') {
      factors.push('Requires encryption');
      factors.push('Requires access control');
    }

    return factors;
  }

  /**
   * Calculate delete date based on retention policy
   */
  private static calculateDeleteDate(policy: any): Date | undefined {
    if (!policy || !policy.retentionPeriod) {
      return undefined;
    }

    const now = new Date();
    let deleteDate = new Date(now);

    switch (policy.retentionUnit) {
      case 'days':
        deleteDate.setDate(now.getDate() + policy.retentionPeriod);
        break;
      case 'months':
        deleteDate.setMonth(now.getMonth() + policy.retentionPeriod);
        break;
      case 'years':
        deleteDate.setFullYear(now.getFullYear() + policy.retentionPeriod);
        break;
      default:
        return undefined;
    }

    return deleteDate;
  }

  /**
   * Calculate classification confidence (0-100)
   */
  private static calculateConfidence(
    piiDetection: { containsPII: boolean; piiTypes: string[] },
    classificationLevel: DataClassification['classificationLevel']
  ): number {
    let confidence = 70; // Base confidence

    if (piiDetection.containsPII && piiDetection.piiTypes.length > 0) {
      confidence += 20; // High confidence when PII is detected
    }

    if (classificationLevel === 'highly_restricted' || classificationLevel === 'restricted') {
      confidence += 10; // Higher confidence for sensitive classifications
    }

    return Math.min(confidence, 100);
  }

  /**
   * Apply retention policy to data
   */
  static async applyRetentionPolicy(
    classificationId: number
  ): Promise<void> {
    try {
      const classification = await db
        .select()
        .from(dataClassifications)
        .where(eq(dataClassifications.id, classificationId))
        .limit(1);

      if (!classification[0]) {
        throw new Error('Classification not found');
      }

      if (classification[0].autoDelete && classification[0].deleteAfter) {
        const now = new Date();
        if (now >= classification[0].deleteAfter) {
          // Mark for deletion
          await db
            .update(dataClassifications)
            .set({
              isActive: false,
              updatedAt: new Date(),
            })
            .where(eq(dataClassifications.id, classificationId));
        }
      }
    } catch (error) {
      console.error('Error applying retention policy:', error);
      throw new Error('Failed to apply retention policy');
    }
  }

  /**
   * Get data classifications
   */
  static async getDataClassifications(
    organizationId: string,
    filters?: {
      dataType?: string;
      dataCategory?: string;
      classificationLevel?: string;
      containsPII?: boolean;
      isActive?: boolean;
      limit?: number;
      offset?: number;
    }
  ): Promise<DataClassification[]> {
    try {
      let query = db
        .select()
        .from(dataClassifications)
        .where(eq(dataClassifications.organizationId, organizationId));

      if (filters?.dataType) {
        query = query.where(and(
          eq(dataClassifications.organizationId, organizationId),
          eq(dataClassifications.dataType, filters.dataType)
        ));
      }

      if (filters?.dataCategory) {
        query = query.where(and(
          eq(dataClassifications.organizationId, organizationId),
          eq(dataClassifications.dataCategory, filters.dataCategory)
        ));
      }

      if (filters?.classificationLevel) {
        query = query.where(and(
          eq(dataClassifications.organizationId, organizationId),
          eq(dataClassifications.classificationLevel, filters.classificationLevel)
        ));
      }

      if (filters?.containsPII !== undefined) {
        query = query.where(and(
          eq(dataClassifications.organizationId, organizationId),
          eq(dataClassifications.containsPII, filters.containsPII)
        ));
      }

      if (filters?.isActive !== undefined) {
        query = query.where(and(
          eq(dataClassifications.organizationId, organizationId),
          eq(dataClassifications.isActive, filters.isActive)
        ));
      }

      const classifications = await query
        .orderBy(desc(dataClassifications.createdAt))
        .limit(filters?.limit || 100)
        .offset(filters?.offset || 0);

      return classifications;
    } catch (error) {
      console.error('Error fetching data classifications:', error);
      throw new Error('Failed to fetch data classifications');
    }
  }

  /**
   * Generate classification report
   */
  static async generateClassificationReport(
    organizationId: string
  ): Promise<Record<string, any>> {
    try {
      const classifications = await this.getDataClassifications(organizationId, { limit: 10000 });

      const summary = {
        total: classifications.length,
        byLevel: {
          public: classifications.filter(c => c.classificationLevel === 'public').length,
          internal: classifications.filter(c => c.classificationLevel === 'internal').length,
          confidential: classifications.filter(c => c.classificationLevel === 'confidential').length,
          restricted: classifications.filter(c => c.classificationLevel === 'restricted').length,
          highly_restricted: classifications.filter(c => c.classificationLevel === 'highly_restricted').length,
        },
        withPII: classifications.filter(c => c.containsPII).length,
        byCategory: {} as Record<string, number>,
        byComplianceFramework: {} as Record<string, number>,
      };

      // Count by category
      classifications.forEach(c => {
        summary.byCategory[c.dataCategory] = (summary.byCategory[c.dataCategory] || 0) + 1;
      });

      // Count by compliance framework
      classifications.forEach(c => {
        c.complianceFrameworks.forEach(framework => {
          summary.byComplianceFramework[framework] = (summary.byComplianceFramework[framework] || 0) + 1;
        });
      });

      return {
        summary,
        classifications: classifications.slice(0, 100),
        generatedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error generating classification report:', error);
      throw new Error('Failed to generate classification report');
    }
  }
}

