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
import { IncidentResponseService } from '@/lib/services/incident-response-service';
import { ApiErrorHandler, generateRequestId } from '@/lib/api-error-handler';
import { logger } from '@/lib/logger';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const requestId = generateRequestId();
  try {
    const { userId, orgId } = await auth();
    if (!userId || !orgId) {
      return ApiErrorHandler.unauthorized();
    }

    const drillId = parseInt(params.id);
    if (isNaN(drillId)) {
      return ApiErrorHandler.badRequest('Invalid drill ID');
    }

    const body = await request.json();
    const {
      conductedBy,
      startDate,
      endDate,
      duration,
      objectivesMet,
      findings,
      strengths,
      weaknesses,
      recommendations,
      actionItems,
      overallScore,
      responseTimeScore,
      communicationScore,
      technicalScore,
      reportUrl,
    } = body;

    await IncidentResponseService.completeDrill(drillId, {
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      duration,
      objectivesMet,
      findings,
      strengths,
      weaknesses,
      recommendations,
      actionItems,
      overallScore,
      responseTimeScore,
      communicationScore,
      technicalScore,
      reportUrl,
    });

    return NextResponse.json({ success: true, message: 'Drill results updated', requestId }, { status: 200 });
  } catch (error: any) {
    logger.error('Error updating drill results:', error);
    return ApiErrorHandler.handle(error, requestId);
  }
}

