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

export async function POST(
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
      findings,
      strengths,
      weaknesses,
      recommendations,
      actionItems,
      responseTime,
      containmentTime,
      recoveryTime,
      score,
      lessonsLearned,
      reportUrl,
    } = body;

    await IncidentResponseService.completeDrill(drillId, {
      findings,
      strengths,
      weaknesses,
      recommendations,
      actionItems,
      responseTime,
      containmentTime,
      recoveryTime,
      score,
      lessonsLearned,
      reportUrl,
    });

    return NextResponse.json({ success: true, message: 'Drill completed successfully', requestId }, { status: 200 });
  } catch (error: any) {
    console.error('Error completing drill:', error);
    return ApiErrorHandler.handle(error, requestId);
  }
}

