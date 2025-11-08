/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { AIGovernanceService } from '@/lib/services/ai-governance-service';
import { ApiErrorHandler, generateRequestId } from '@/lib/api-error-handler';

export async function POST(request: NextRequest) {
  const requestId = generateRequestId();
  try {
    const { userId, orgId } = await auth();
    if (!userId || !orgId) {
      return ApiErrorHandler.unauthorized();
    }

    const body = await request.json();
    const {
      modelName,
      modelVersion,
      modelProvider,
      decisionType,
      decisionDescription,
      inputData,
      outputData,
      decisionConfidence,
      useCase,
      context,
      sessionId,
      requestId: reqId,
      explanation,
      explanationData,
      featureImportance,
      processingTime,
      tokensUsed,
      cost,
      gdprRelevant,
      containsPersonalData,
      dataRetentionPolicy,
      tags,
      metadata,
    } = body;

    if (!modelName || !decisionType || !decisionDescription || !inputData || !outputData) {
      return ApiErrorHandler.badRequest('Missing required fields');
    }

    const decision = await AIGovernanceService.logModelDecision(orgId, {
      userId,
      modelName,
      modelVersion,
      modelProvider,
      decisionType,
      decisionDescription,
      inputData,
      outputData,
      decisionConfidence,
      useCase,
      context,
      sessionId,
      requestId: reqId,
      explanation,
      explanationData,
      featureImportance,
      processingTime,
      tokensUsed,
      cost,
      gdprRelevant,
      containsPersonalData,
      dataRetentionPolicy,
      tags,
      metadata,
    });

    return NextResponse.json({ success: true, data: decision, requestId }, { status: 201 });
  } catch (error: any) {
    console.error('Error logging AI decision:', error);
    return ApiErrorHandler.handle(error, requestId);
  }
}

export async function GET(request: NextRequest) {
  const requestId = generateRequestId();
  try {
    const { userId, orgId } = await auth();
    if (!userId || !orgId) {
      return ApiErrorHandler.unauthorized();
    }

    const { searchParams } = new URL(request.url);
    const userIdFilter = searchParams.get('userId') || undefined;
    const modelName = searchParams.get('modelName') || undefined;
    const decisionType = searchParams.get('decisionType') || undefined;
    const useCase = searchParams.get('useCase') || undefined;
    const dateFrom = searchParams.get('dateFrom') ? new Date(searchParams.get('dateFrom')!) : undefined;
    const dateTo = searchParams.get('dateTo') ? new Date(searchParams.get('dateTo')!) : undefined;
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    const decisions = await AIGovernanceService.getModelDecisions(orgId, {
      userId: userIdFilter,
      modelName,
      decisionType,
      useCase,
      dateFrom,
      dateTo,
      limit,
      offset,
    });

    return NextResponse.json({ success: true, data: decisions, requestId }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching AI decisions:', error);
    return ApiErrorHandler.handle(error, requestId);
  }
}

