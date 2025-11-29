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
import { ComplianceTrainingService } from '@/lib/services/compliance-training-service';
import { ApiErrorHandler, generateRequestId } from '@/lib/api-error-handler';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  const requestId = generateRequestId();
  try {
    const { userId, orgId } = await auth();
    if (!userId || !orgId) {
      return ApiErrorHandler.unauthorized();
    }

    const body = await request.json();
    const program = await ComplianceTrainingService.createTrainingProgram(orgId, {
      createdBy: userId,
      ...body,
    });

    return NextResponse.json({ success: true, data: program, requestId }, { status: 201 });
  } catch (error: any) {
    logger.error('Error creating training program:', error);
    return ApiErrorHandler.handle(error, requestId);
  }
}

