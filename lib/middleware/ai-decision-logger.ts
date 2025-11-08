/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { AIGovernanceService } from '@/lib/services/ai-governance-service';
import { NextRequest, NextResponse } from 'next/server';

export interface AIDecisionLogContext {
  organizationId: string;
  userId?: string;
  modelName: string;
  modelVersion?: string;
  modelProvider?: string;
  decisionType: 'financial_analysis' | 'risk_assessment' | 'fraud_detection' | 'recommendation' | 'classification' | 'prediction' | 'other';
  inputData: Record<string, any>;
  outputData: Record<string, any>;
  decisionConfidence?: number;
  useCase?: string;
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
  metadata?: Record<string, any>;
}

/**
 * Log AI decision asynchronously (non-blocking)
 */
export async function logAIDecision(context: AIDecisionLogContext): Promise<void> {
  try {
    await AIGovernanceService.logModelDecision(context.organizationId, {
      userId: context.userId,
      modelName: context.modelName,
      modelVersion: context.modelVersion,
      modelProvider: context.modelProvider,
      decisionType: context.decisionType,
      decisionDescription: `AI decision from ${context.modelName}${context.useCase ? ` for ${context.useCase}` : ''}`,
      inputData: context.inputData,
      outputData: context.outputData,
      decisionConfidence: context.decisionConfidence,
      useCase: context.useCase,
      context: context.metadata || {},
      sessionId: context.sessionId,
      requestId: context.requestId,
      explanation: context.explanation,
      explanationData: context.explanationData,
      featureImportance: context.featureImportance,
      processingTime: context.processingTime,
      tokensUsed: context.tokensUsed,
      cost: context.cost,
      gdprRelevant: context.gdprRelevant,
      containsPersonalData: context.containsPersonalData,
      tags: ['auto-logged'],
      metadata: context.metadata || {},
    });
  } catch (error) {
    // Log error but don't throw - we don't want to break the main request
    console.error('Error logging AI decision:', error);
  }
}

/**
 * Helper function to extract decision context from AI API response
 */
export function extractDecisionContext(
  organizationId: string,
  userId: string | undefined,
  modelName: string,
  requestBody: any,
  responseData: any,
  metadata?: {
    useCase?: string;
    decisionType?: 'financial_analysis' | 'risk_assessment' | 'fraud_detection' | 'recommendation' | 'classification' | 'prediction' | 'other';
    processingTime?: number;
    tokensUsed?: number;
    cost?: { amount: number; currency: string };
    sessionId?: string;
    requestId?: string;
    explanation?: string;
    explanationData?: any;
    featureImportance?: any;
  }
): AIDecisionLogContext {
  // Determine decision type from metadata, model name, or use case
  let decisionType: AIDecisionLogContext['decisionType'] = metadata?.decisionType || 'other';
  
  if (decisionType === 'other') {
    if (modelName.toLowerCase().includes('financial') || modelName.toLowerCase().includes('analysis')) {
      decisionType = 'financial_analysis';
    } else if (modelName.toLowerCase().includes('risk')) {
      decisionType = 'risk_assessment';
    } else if (modelName.toLowerCase().includes('fraud')) {
      decisionType = 'fraud_detection';
    } else if (modelName.toLowerCase().includes('recommend')) {
      decisionType = 'recommendation';
    } else if (modelName.toLowerCase().includes('classif')) {
      decisionType = 'classification';
    } else if (modelName.toLowerCase().includes('predict')) {
      decisionType = 'prediction';
    }
  }

  // Check if data contains personal information
  const containsPersonalData = checkForPersonalData(requestBody) || checkForPersonalData(responseData);

  return {
    organizationId,
    userId,
    modelName,
    modelVersion: metadata?.requestId ? undefined : undefined,
    modelProvider: detectModelProvider(modelName),
    decisionType,
    inputData: requestBody,
    outputData: responseData,
    decisionConfidence: extractConfidence(responseData),
    useCase: metadata?.useCase || extractUseCase(requestBody),
    sessionId: metadata?.sessionId,
    requestId: metadata?.requestId,
    explanation: metadata?.explanation,
    explanationData: metadata?.explanationData,
    featureImportance: metadata?.featureImportance,
    processingTime: metadata?.processingTime,
    tokensUsed: metadata?.tokensUsed,
    cost: metadata?.cost,
    gdprRelevant: containsPersonalData,
    containsPersonalData,
    metadata: {
      ...metadata,
      loggedAt: new Date().toISOString(),
    },
  };
}

/**
 * Check if data contains personal information
 */
function checkForPersonalData(data: any): boolean {
  if (!data || typeof data !== 'object') {
    return false;
  }

  const personalDataIndicators = [
    'email',
    'phone',
    'ssn',
    'social',
    'credit',
    'card',
    'address',
    'name',
    'birth',
    'date',
    'passport',
    'driver',
    'license',
    'account',
    'routing',
  ];

  const dataString = JSON.stringify(data).toLowerCase();
  return personalDataIndicators.some(indicator => dataString.includes(indicator));
}

/**
 * Detect model provider from model name
 */
function detectModelProvider(modelName: string): string | undefined {
  const lowerName = modelName.toLowerCase();
  if (lowerName.includes('gpt') || lowerName.includes('openai')) {
    return 'openai';
  } else if (lowerName.includes('claude') || lowerName.includes('anthropic')) {
    return 'anthropic';
  } else if (lowerName.includes('gemini') || lowerName.includes('google')) {
    return 'google';
  } else if (lowerName.includes('llama') || lowerName.includes('meta')) {
    return 'meta';
  }
  return 'custom';
}

/**
 * Extract confidence score from response data
 */
function extractConfidence(responseData: any): number | undefined {
  if (!responseData || typeof responseData !== 'object') {
    return undefined;
  }

  if (typeof responseData.confidence === 'number') {
    return responseData.confidence;
  }

  if (typeof responseData.score === 'number') {
    return responseData.score;
  }

  if (responseData.probability && typeof responseData.probability === 'number') {
    return Math.round(responseData.probability * 100);
  }

  return undefined;
}

/**
 * Extract use case from request body
 */
function extractUseCase(requestBody: any): string | undefined {
  if (!requestBody || typeof requestBody !== 'object') {
    return undefined;
  }

  if (typeof requestBody.useCase === 'string') {
    return requestBody.useCase;
  }

  if (typeof requestBody.purpose === 'string') {
    return requestBody.purpose;
  }

  if (typeof requestBody.task === 'string') {
    return requestBody.task;
  }

  return undefined;
}

/**
 * Wrapper function to log AI decisions from API routes
 * Use this in your AI API routes to automatically log decisions
 */
export async function withAIDecisionLogging<T>(
  organizationId: string,
  userId: string | undefined,
  modelName: string,
  requestBody: any,
  apiCall: () => Promise<T>,
  metadata?: {
    useCase?: string;
    decisionType?: 'financial_analysis' | 'risk_assessment' | 'fraud_detection' | 'recommendation' | 'classification' | 'prediction' | 'other';
    processingTime?: number;
    tokensUsed?: number;
    cost?: { amount: number; currency: string };
    sessionId?: string;
    requestId?: string;
    explanation?: string;
    explanationData?: any;
    featureImportance?: any;
  }
): Promise<T> {
  const startTime = Date.now();
  let responseData: T;
  let error: Error | null = null;

  try {
    responseData = await apiCall();
    return responseData;
  } catch (err) {
    error = err as Error;
    throw err;
  } finally {
    // Log decision asynchronously (non-blocking)
    const processingTime = metadata?.processingTime || (Date.now() - startTime);
    
    // Only log successful decisions
    if (!error && responseData) {
      const context = extractDecisionContext(
        organizationId,
        userId,
        modelName,
        requestBody,
        responseData as any,
        {
          ...metadata,
          processingTime,
        }
      );

      // Log asynchronously - don't await to avoid blocking the response
      logAIDecision(context).catch(err => {
        console.error('Failed to log AI decision:', err);
      });
    }
  }
}

