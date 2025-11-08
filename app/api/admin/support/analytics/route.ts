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
    const dateFrom = searchParams.get('dateFrom') ? new Date(searchParams.get('dateFrom')!) : undefined;
    const dateTo = searchParams.get('dateTo') ? new Date(searchParams.get('dateTo')!) : undefined;

    const analytics = await DocumentationService.getTicketAnalytics(dateFrom, dateTo);

    return NextResponse.json(analytics);
  } catch (error) {
    return ApiErrorHandler.handle(error, requestId);
  }
}

