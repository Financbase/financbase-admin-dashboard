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

export async function POST(request: NextRequest) {
  const requestId = generateRequestId();
  try {
    const { userId, orgId } = await auth();
    if (!userId || !orgId) {
      return ApiErrorHandler.unauthorized();
    }

    const body = await request.json();
    const {
      userId: teamMemberUserId,
      role,
      isPrimary,
      contactInfo,
      availability,
      certifications,
      experience,
      notes,
    } = body;

    if (!teamMemberUserId || !role) {
      return ApiErrorHandler.badRequest('Missing required fields: userId, role');
    }

    const teamMember = await IncidentResponseService.addTeamMember(orgId, {
      userId: teamMemberUserId,
      role,
      isPrimary,
      contactInfo,
      availability,
      certifications,
      experience,
      notes,
    });

    return NextResponse.json({ success: true, data: teamMember, requestId }, { status: 201 });
  } catch (error: any) {
    console.error('Error adding team member:', error);
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
    const role = searchParams.get('role') || undefined;
    const isActive = searchParams.get('isActive') === 'true' ? true : searchParams.get('isActive') === 'false' ? false : undefined;

    const teamMembers = await IncidentResponseService.getTeamMembers(orgId, {
      role,
      isActive,
    });

    return NextResponse.json({ success: true, data: teamMembers, requestId }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching team members:', error);
    return ApiErrorHandler.handle(error, requestId);
  }
}

