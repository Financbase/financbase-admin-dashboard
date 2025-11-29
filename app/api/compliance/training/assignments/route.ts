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
    const {
      programId,
      userId: assignUserId,
      roleId,
      assignmentType,
      deadline,
    } = body;

    if (!programId || (!assignUserId && !roleId)) {
      return ApiErrorHandler.badRequest('Missing required fields: programId, and either userId or roleId');
    }

    const assignment = await ComplianceTrainingService.assignTraining(orgId, {
      programId,
      userId: assignUserId,
      roleId,
      assignedBy: userId,
      assignmentType,
      deadline: deadline ? new Date(deadline) : undefined,
    });

    return NextResponse.json({ success: true, data: assignment, requestId }, { status: 201 });
  } catch (error: any) {
    logger.error('Error assigning training:', error);
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
    const status = searchParams.get('status') || undefined;
    const programId = searchParams.get('programId') ? parseInt(searchParams.get('programId')!) : undefined;

    const assignments = await ComplianceTrainingService.getTrainingAssignments(orgId, {
      userId: userIdFilter,
      status,
      programId,
    });

    return NextResponse.json({ success: true, data: assignments, requestId }, { status: 200 });
  } catch (error: any) {
    logger.error('Error fetching training assignments:', error);
    return ApiErrorHandler.handle(error, requestId);
  }
}

