import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { AuditService } from '@/lib/services/audit-service';

interface SecurityEvent {
  id: number;
  eventType: string;
  description?: string;
  severity: string;
  timestamp: Date;
  isResolved?: boolean;
  userId: string;
  userEmail?: string;
  ipAddress?: string;
  userAgent?: string;
  affectedResources?: string[];
  eventData?: Record<string, unknown>;
}

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get security events from audit service
    const securityEvents = await AuditService.getSecurityEvents(userId, undefined, undefined, undefined, 100, 0);

    // Ensure we have an array to work with
    const eventsArray = Array.isArray(securityEvents) ? securityEvents : [];

    // Transform events to match expected format
    const events = eventsArray.map((event: SecurityEvent) => ({
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
    // Return empty array instead of error to prevent frontend crashes
    return NextResponse.json([]);
  }
}
