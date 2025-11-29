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
import { ComplianceMonitoringService } from '@/lib/services/compliance-monitoring-service';
import { ApiErrorHandler, generateRequestId } from '@/lib/api-error-handler';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  const requestId = generateRequestId();
  try {
    const { userId, orgId } = await auth();
    if (!userId || !orgId) {
      return ApiErrorHandler.unauthorized();
    }

    const { searchParams } = new URL(request.url);
    const alertsOnly = searchParams.get('alerts') === 'true';

    if (alertsOnly) {
      const alerts = await ComplianceMonitoringService.generateComplianceAlerts(orgId);
      return NextResponse.json({ success: true, data: alerts, requestId }, { status: 200 });
    }

    const status = await ComplianceMonitoringService.getComplianceStatus(orgId);
    return NextResponse.json({ success: true, data: status, requestId }, { status: 200 });
  } catch (error: any) {
    logger.error('Error fetching compliance monitoring data:', error);
    return ApiErrorHandler.handle(error, requestId);
  }
}

