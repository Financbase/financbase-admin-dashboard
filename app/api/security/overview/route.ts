import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { AuditService } from '@/lib/services/audit-service';
import { MFAService } from '@/lib/security/mfa-service';
import { ApiErrorHandler, generateRequestId } from '@/lib/api-error-handler';

export async function GET(request: NextRequest) {
  const requestId = generateRequestId();
  try {
    const { userId } = await auth();
    if (!userId) {
      return ApiErrorHandler.unauthorized();
    }

    // Get MFA status
    const mfaSettings = await MFAService.getMFASettings(userId);
    const isMFARequired = await MFAService.isMFARequired(userId);

    // Get audit statistics
    const auditStats = await AuditService.getAuditStatistics(userId);

    // Get security events
    const securityEvents = await AuditService.getSecurityEvents(userId);

    // Calculate security score
    const securityScore = {
      mfaEnabled: !!mfaSettings?.isEnabled,
      auditLogging: true, // Always enabled
      dataEncryption: true, // Assume enabled
      accessControls: true, // Assume enabled
    };

    const overview = {
      // MFA Status
      mfaEnabled: mfaSettings?.isEnabled || false,
      mfaRequired: isMFARequired,
      mfaType: mfaSettings?.mfaType || null,
      mfaEnabledUsers: 1, // This would be calculated from organization
      totalUsers: 1, // This would be calculated from organization

      // Security Metrics
      activeUsers: 1, // This would be calculated from organization
      totalEvents: auditStats.totalEvents,
      suspiciousEvents: auditStats.suspiciousEvents,
      gdprRelevantEvents: auditStats.gdprRelevantEvents,

      // Security Score Components
      ...securityScore,

      // Recent Activity
      recentEvents: securityEvents.slice(0, 5),
    };

    return NextResponse.json(overview);
  } catch (error) {
    return ApiErrorHandler.handle(error, requestId);
  }
}
