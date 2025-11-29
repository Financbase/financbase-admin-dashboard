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
import { complianceReports } from '@/lib/db/schemas';
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

    const reportId = parseInt(params.id);
    if (isNaN(reportId)) {
      return ApiErrorHandler.badRequest('Invalid report ID');
    }

    const report = await db
      .select()
      .from(complianceReports)
      .where(eq(complianceReports.id, reportId))
      .limit(1);

    if (!report[0]) {
      return ApiErrorHandler.notFound('Compliance report not found');
    }

    if (report[0].organizationId !== orgId) {
      return ApiErrorHandler.forbidden();
    }

    return NextResponse.json({ success: true, data: report[0], requestId }, { status: 200 });
  } catch (error: any) {
    logger.error('Error fetching compliance report:', error);
    return ApiErrorHandler.handle(error, requestId);
  }
}

