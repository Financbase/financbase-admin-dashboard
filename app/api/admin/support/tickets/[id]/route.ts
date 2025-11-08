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
import { DocumentationService } from '@/lib/services/documentation-service';
import { checkPermission } from '@/lib/auth/financbase-rbac';
import { FINANCIAL_PERMISSIONS } from '@/types/auth';
import { ApiErrorHandler, generateRequestId } from '@/lib/api-error-handler';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const requestId = generateRequestId();
  try {
    const { userId } = await auth();
    if (!userId) {
      return ApiErrorHandler.unauthorized();
    }

    // Check if user has permission to manage support tickets
    const hasPermission = await checkPermission(FINANCIAL_PERMISSIONS.SUPPORT_TICKETS_MANAGE);
    if (!hasPermission) {
      return ApiErrorHandler.forbidden('You do not have permission to manage support tickets');
    }

    const ticketId = parseInt(params.id);
    if (isNaN(ticketId)) {
      return ApiErrorHandler.badRequest('Invalid ticket ID', requestId);
    }

    const ticket = await DocumentationService.getTicketById(ticketId);
    if (!ticket) {
      return ApiErrorHandler.notFound('Ticket not found', requestId);
    }

    return NextResponse.json(ticket);
  } catch (error) {
    return ApiErrorHandler.handle(error, requestId);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const requestId = generateRequestId();
  try {
    const { userId } = await auth();
    if (!userId) {
      return ApiErrorHandler.unauthorized();
    }

    // Check if user has permission to manage support tickets
    const hasPermission = await checkPermission(FINANCIAL_PERMISSIONS.SUPPORT_TICKETS_MANAGE);
    if (!hasPermission) {
      return ApiErrorHandler.forbidden('You do not have permission to manage support tickets');
    }

    const ticketId = parseInt(params.id);
    if (isNaN(ticketId)) {
      return ApiErrorHandler.badRequest('Invalid ticket ID', requestId);
    }

    const body = await request.json();
    const { status, priority, assignee, tags, customFields, resolution } = body;

    const updates: any = {};
    if (status !== undefined) updates.status = status;
    if (priority !== undefined) updates.priority = priority;
    if (assignee !== undefined) updates.assignee = assignee;
    if (tags !== undefined) updates.tags = tags;
    if (customFields !== undefined) updates.customFields = customFields;
    if (resolution !== undefined) updates.resolution = resolution;

    const updated = await DocumentationService.updateTicket(ticketId, updates);

    return NextResponse.json(updated);
  } catch (error) {
    return ApiErrorHandler.handle(error, requestId);
  }
}

