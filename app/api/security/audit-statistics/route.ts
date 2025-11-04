import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { AuditService } from '@/lib/services/audit-service';
import { ApiErrorHandler, generateRequestId } from '@/lib/api-error-handler';

export async function GET(request: NextRequest) {
  const requestId = generateRequestId();
  try {
    const { userId } = await auth();
    if (!userId) {
      return ApiErrorHandler.unauthorized();
    }

    // Get audit statistics from audit service
    const auditStats = await AuditService.getAuditStatistics(undefined, undefined, undefined);

    // Transform to match expected format
    const stats = {
      totalEvents: auditStats.totalEvents,
      suspiciousEvents: auditStats.suspiciousEvents,
      gdprRelevantEvents: auditStats.gdprRelevantEvents,
      eventsByType: auditStats.eventsByType,
      eventsByUser: {}, // This would need to be calculated separately
      eventsByDate: [], // This would need to be calculated separately
      recentEvents: [], // This would need to be calculated separately
      complianceScore: 85, // Mock value - would be calculated
      dataRetentionDays: 2555, // Mock value - 7 years
    };

    return NextResponse.json(stats);
  } catch (error) {
    return ApiErrorHandler.handle(error, requestId);
  }
}
