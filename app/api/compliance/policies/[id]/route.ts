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

    const policy = await PolicyManagementService.getPolicyById(policyId);
    if (!policy) {
      return ApiErrorHandler.notFound('Policy not found');
    }

    if (policy.organizationId !== orgId) {
      return ApiErrorHandler.forbidden();
    }

    return NextResponse.json({ success: true, data: policy, requestId }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching policy:', error);
    return ApiErrorHandler.handle(error, requestId);
  }
}

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

    const policyId = parseInt(params.id);
    if (isNaN(policyId)) {
      return ApiErrorHandler.badRequest('Invalid policy ID');
    }

    const policy = await PolicyManagementService.getPolicyById(policyId);
    if (!policy) {
      return ApiErrorHandler.notFound('Policy not found');
    }

    if (policy.organizationId !== orgId) {
      return ApiErrorHandler.forbidden();
    }

    const body = await request.json();
    const { action, content, summary, changelog } = body;

    if (action === 'update') {
      if (!content) {
        return ApiErrorHandler.badRequest('Content is required for update');
      }
      await PolicyManagementService.updatePolicyVersion(policyId, {
        content,
        summary,
        changelog,
        updatedBy: userId,
      });
    } else if (action === 'publish') {
      await PolicyManagementService.publishPolicy(policyId, userId);
    } else {
      return ApiErrorHandler.badRequest('Invalid action');
    }

    const updatedPolicy = await PolicyManagementService.getPolicyById(policyId);
    return NextResponse.json({ success: true, data: updatedPolicy, requestId }, { status: 200 });
  } catch (error: any) {
    console.error('Error updating policy:', error);
    return ApiErrorHandler.handle(error, requestId);
  }
}

