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

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;
    const priority = searchParams.get('priority') || undefined;
    const category = searchParams.get('category') || undefined;
    const assignedTo = searchParams.get('assignedTo') || undefined;
    const userIdFilter = searchParams.get('userId') || undefined;
    const dateFrom = searchParams.get('dateFrom') ? new Date(searchParams.get('dateFrom')!) : undefined;
    const dateTo = searchParams.get('dateTo') ? new Date(searchParams.get('dateTo')!) : undefined;
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';

    const tickets = await DocumentationService.getAllTickets(
      {
        status,
        priority,
        category,
        assignedTo,
        userId: userIdFilter,
        dateFrom,
        dateTo,
      },
      limit,
      offset,
      sortBy,
      sortOrder
    );

    return NextResponse.json({ tickets });
  } catch (error) {
    return ApiErrorHandler.handle(error, requestId);
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const {
      subject,
      description,
      category,
      priority = 'medium',
      userId: ticketUserId,
      organizationId,
      attachments = [],
      tags = [],
      customFields = {},
    } = body;

    if (!subject || !description || !category || !ticketUserId) {
      return ApiErrorHandler.badRequest(
        'Missing required fields: subject, description, category, userId',
        requestId
      );
    }

    const ticket = await DocumentationService.createSupportTicket(
      ticketUserId,
      subject,
      description,
      category,
      priority,
      organizationId,
      attachments,
      tags,
      customFields
    );

    return NextResponse.json(ticket, { status: 201 });
  } catch (error) {
    return ApiErrorHandler.handle(error, requestId);
  }
}

