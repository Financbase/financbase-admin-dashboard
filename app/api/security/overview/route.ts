import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { AuditService } from '@/lib/services/audit-service';
import { MFAService } from '@/lib/security/mfa-service';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
    console.error('Error fetching security overview:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch security overview',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
