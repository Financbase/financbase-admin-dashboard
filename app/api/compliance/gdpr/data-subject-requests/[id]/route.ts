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
import { ComplianceService } from '@/lib/services/compliance-service';
import { ApiErrorHandler, generateRequestId } from '@/lib/api-error-handler';
import { db } from '@/lib/db';
import { gdprDataRequests } from '@/lib/db/schemas';
import { eq } from 'drizzle-orm';
import { logger } from '@/lib/logger';

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

    const requestIdNum = parseInt(params.id);
    if (isNaN(requestIdNum)) {
      return ApiErrorHandler.badRequest('Invalid request ID');
    }

    const gdprRequest = await db
      .select()
      .from(gdprDataRequests)
      .where(eq(gdprDataRequests.id, requestIdNum))
      .limit(1);

    if (!gdprRequest[0]) {
      return ApiErrorHandler.notFound('GDPR data request not found');
    }

    if (gdprRequest[0].organizationId !== orgId) {
      return ApiErrorHandler.forbidden();
    }

    return NextResponse.json({ success: true, data: gdprRequest[0], requestId }, { status: 200 });
  } catch (error: any) {
    logger.error('Error fetching GDPR data request:', error);
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

    const requestIdNum = parseInt(params.id);
    if (isNaN(requestIdNum)) {
      return ApiErrorHandler.badRequest('Invalid request ID');
    }

    const gdprRequest = await db
      .select()
      .from(gdprDataRequests)
      .where(eq(gdprDataRequests.id, requestIdNum))
      .limit(1);

    if (!gdprRequest[0]) {
      return ApiErrorHandler.notFound('GDPR data request not found');
    }

    if (gdprRequest[0].organizationId !== orgId) {
      return ApiErrorHandler.forbidden();
    }

    const body = await request.json();
    const { status, assignedTo, processingNotes } = body;

    if (status === 'in_progress' && assignedTo) {
      await ComplianceService.processGDPRDataRequest(requestIdNum, assignedTo, processingNotes);
    } else if (status === 'completed') {
      const { responseData, responseFileUrl } = body;
      await ComplianceService.completeGDPRDataRequest(requestIdNum, responseData || {}, responseFileUrl);
    } else {
      // Update other fields
      await db
        .update(gdprDataRequests)
        .set({
          status: status || gdprRequest[0].status,
          assignedTo: assignedTo || gdprRequest[0].assignedTo,
          processingNotes: processingNotes || gdprRequest[0].processingNotes,
          updatedAt: new Date(),
        })
        .where(eq(gdprDataRequests.id, requestIdNum));
    }

    const updatedRequest = await db
      .select()
      .from(gdprDataRequests)
      .where(eq(gdprDataRequests.id, requestIdNum))
      .limit(1);

    return NextResponse.json({ success: true, data: updatedRequest[0], requestId }, { status: 200 });
  } catch (error: any) {
    logger.error('Error updating GDPR data request:', error);
    return ApiErrorHandler.handle(error, requestId);
  }
}

