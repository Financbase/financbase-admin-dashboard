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
import { PolicyManagementService } from '@/lib/services/policy-management-service';
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

    const policyId = parseInt(params.id);
    if (isNaN(policyId)) {
      return ApiErrorHandler.badRequest('Invalid policy ID');
    }

    const body = await request.json();
    const {
      userId: assignUserId,
      roleId,
      requiresAcknowledgment,
      deadline,
    } = body;

    if (!assignUserId && !roleId) {
      return ApiErrorHandler.badRequest('Either userId or roleId is required');
    }

    await PolicyManagementService.assignPolicy(policyId, {
      userId: assignUserId,
      roleId,
      organizationId: orgId,
      assignedBy: userId,
      requiresAcknowledgment,
      deadline: deadline ? new Date(deadline) : undefined,
    });

    return NextResponse.json({ success: true, message: 'Policy assigned', requestId }, { status: 201 });
  } catch (error: any) {
    console.error('Error assigning policy:', error);
    return ApiErrorHandler.handle(error, requestId);
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const requestId = generateRequestId();
  try {
    const { userId, orgId } = await auth();
    if (!userId || !orgId) {
      return ApiErrorHandler.unauthorized();
    }

    const policyId = parseInt(params.id);
    if (isNaN(policyId)) {
      return ApiErrorHandler.badRequest('Invalid policy ID');
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;
    const userIdFilter = searchParams.get('userId') || undefined;

    const assignments = await PolicyManagementService.getPolicyAssignments(policyId, {
      status,
      userId: userIdFilter,
    });

    return NextResponse.json({ success: true, data: assignments, requestId }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching policy assignments:', error);
    return ApiErrorHandler.handle(error, requestId);
  }
}

