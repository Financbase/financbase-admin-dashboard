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

export async function POST(request: NextRequest) {
  const requestId = generateRequestId();
  try {
    const { userId, orgId } = await auth();
    if (!userId || !orgId) {
      return ApiErrorHandler.unauthorized();
    }

    const body = await request.json();
    const {
      userId: memberUserId,
      role,
      isPrimary,
      isOnCall,
      onCallSchedule,
      contactInfo,
      expertise,
      certifications,
    } = body;

    if (!memberUserId || !role) {
      return ApiErrorHandler.badRequest('Missing required fields: userId, role');
    }

    const member = await IncidentResponseService.addTeamMember(orgId, {
      userId: memberUserId,
      role,
      isPrimary,
      isOnCall,
      onCallSchedule,
      contactInfo,
      expertise,
      certifications,
    });

    return NextResponse.json({ success: true, data: member, requestId }, { status: 201 });
  } catch (error: any) {
    logger.error('Error adding team member:', error);
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
    const role = searchParams.get('role');
    const isActive = searchParams.get('isActive');
    const isOnCall = searchParams.get('isOnCall');

    const members = await IncidentResponseService.getTeamMembers(orgId, {
      role: role || undefined,
      isActive: isActive ? isActive === 'true' : undefined,
      isOnCall: isOnCall ? isOnCall === 'true' : undefined,
    });

    return NextResponse.json({ success: true, data: members, requestId }, { status: 200 });
  } catch (error: any) {
    logger.error('Error getting team members:', error);
    return ApiErrorHandler.handle(error, requestId);
  }
}

