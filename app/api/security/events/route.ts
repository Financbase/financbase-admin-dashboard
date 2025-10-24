import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { AuditService } from '@/lib/services/audit-service';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get security events from audit service
    const securityEvents = await AuditService.getSecurityEvents(userId, undefined, undefined, undefined, 100, 0);

    // Transform events to match expected format
    const events = securityEvents.map((event: any) => ({
      id: event.id,
      eventType: event.eventType,
      description: event.description || `${event.eventType} event`,
      severity: event.severity,
      timestamp: event.timestamp,
      isResolved: event.isResolved || false,
      userId: event.userId,
      userEmail: event.userEmail || 'System',
      ipAddress: event.ipAddress,
      userAgent: event.userAgent,
      resource: event.affectedResources?.join(', ') || '',
      details: event.eventData,
    }));

    return NextResponse.json(events);
  } catch (error) {
    console.error('Error fetching security events:', error);
    return NextResponse.json({
      error: 'Failed to fetch security events',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
