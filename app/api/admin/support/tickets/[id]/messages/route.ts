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

    return NextResponse.json({ messages: ticket.messages || [] });
  } catch (error) {
    return ApiErrorHandler.handle(error, requestId);
  }
}

export async function POST(
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
    const { content, messageType = 'message', isInternal = false, attachments = [] } = body;

    if (!content || typeof content !== 'string') {
      return ApiErrorHandler.badRequest('Content is required and must be a string', requestId);
    }

    // Get user agent and IP from request
    const userAgent = request.headers.get('user-agent') || undefined;
    const forwarded = request.headers.get('x-forwarded-for');
    const ipAddress = forwarded ? forwarded.split(',')[0].trim() : request.ip || undefined;

    const message = await DocumentationService.addTicketMessage(
      ticketId,
      userId,
      content,
      messageType,
      isInternal,
      attachments,
      userAgent,
      ipAddress
    );

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    return ApiErrorHandler.handle(error, requestId);
  }
}

