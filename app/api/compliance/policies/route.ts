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

export async function POST(request: NextRequest) {
  const requestId = generateRequestId();
  try {
    const { userId, orgId } = await auth();
    if (!userId || !orgId) {
      return ApiErrorHandler.unauthorized();
    }

    const body = await request.json();
    const {
      title,
      policyType,
      description,
      content,
      summary,
      requiresAcknowledgment,
      acknowledgmentDeadline,
      reviewFrequency,
      reviewRequired,
      complianceFrameworks,
      requirements,
      tags,
      metadata,
    } = body;

    if (!title || !policyType || !content) {
      return ApiErrorHandler.badRequest('Missing required fields: title, policyType, content');
    }

    const policy = await PolicyManagementService.createPolicy(orgId, {
      createdBy: userId,
      title,
      policyType,
      description,
      content,
      summary,
      requiresAcknowledgment,
      acknowledgmentDeadline: acknowledgmentDeadline ? new Date(acknowledgmentDeadline) : undefined,
      reviewFrequency,
      reviewRequired,
      complianceFrameworks,
      requirements,
      tags,
      metadata,
    });

    return NextResponse.json({ success: true, data: policy, requestId }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating policy:', error);
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
    const policyType = searchParams.get('policyType') || undefined;
    const status = searchParams.get('status') || undefined;
    const complianceFramework = searchParams.get('complianceFramework') || undefined;
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    const policies = await PolicyManagementService.getPolicies(orgId, {
      policyType,
      status,
      complianceFramework,
      limit,
      offset,
    });

    return NextResponse.json({ success: true, data: policies, requestId }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching policies:', error);
    return ApiErrorHandler.handle(error, requestId);
  }
}

