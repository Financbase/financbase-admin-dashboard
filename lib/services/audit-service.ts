import { db } from '@/lib/db';
import {
  auditLogs,
  dataAccessLogs,
  securityEvents
} from '@/lib/db/schemas';
import { eq, and, desc, asc, sql, gte, lte, like, inArray } from 'drizzle-orm';

export interface AuditLogEntry {
  id: number;
  userId: string;
  organizationId?: string;
  eventType: string;
  eventCategory: string;
  eventAction: string;
  eventDescription?: string;
  resourceType?: string;
  resourceId?: string;
  resourceName?: string;
  eventData: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  riskLevel: string;
  isSuspicious: boolean;
  securityFlags: string[];
  country?: string;
  city?: string;
  deviceType?: string;
  browser?: string;
  os?: string;
  gdprRelevant: boolean;
  dataRetention?: string;
  timestamp: Date;
}

export interface DataAccessLogEntry {
  id: number;
  userId: string;
  organizationId?: string;
  dataType: string;
  dataCategory: string;
  dataSubject?: string;
  accessType: string;
  accessMethod: string;
  dataFields: string[];
  purpose?: string;
  legalBasis?: string;
  retentionPeriod?: string;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  gdprConsent: boolean;
  dataMinimization: boolean;
  timestamp: Date;
}

export interface SecurityEvent {
  id: number;
  userId?: string;
  organizationId?: string;
  eventType: string;
  severity: string;
  description: string;
  eventData: Record<string, any>;
  affectedResources: string[];
  ipAddress?: string;
  userAgent?: string;
  location?: string;
  deviceFingerprint?: string;
  isResolved: boolean;
  resolutionNotes?: string;
  resolvedBy?: string;
  resolvedAt?: Date;
  notificationsSent: string[];
  timestamp: Date;
}

export interface AuditFilters {
  userId?: string;
  organizationId?: string;
  eventType?: string;
  eventCategory?: string;
  resourceType?: string;
  riskLevel?: string;
  dateFrom?: Date;
  dateTo?: Date;
  isSuspicious?: boolean;
  gdprRelevant?: boolean;
}

export class AuditService {
  /**
   * Log a general audit event
   */
  static async logEvent(
    userId: string,
    eventType: string,
    eventAction: string,
    eventData: Record<string, any> = {},
    options: {
      organizationId?: string;
      resourceType?: string;
      resourceId?: string;
      resourceName?: string;
      eventDescription?: string;
      ipAddress?: string;
      userAgent?: string;
      sessionId?: string;
      riskLevel?: 'low' | 'medium' | 'high' | 'critical';
      isSuspicious?: boolean;
      securityFlags?: string[];
      country?: string;
      city?: string;
      deviceType?: string;
      browser?: string;
      os?: string;
      gdprRelevant?: boolean;
    } = {}
  ): Promise<void> {
    try {
      await db.insert(auditLogs).values({
        userId,
        organizationId: options.organizationId,
        eventType,
        eventCategory: this.getEventCategory(eventType),
        eventAction,
        eventDescription: options.eventDescription || `${eventType} ${eventAction}`,
        resourceType: options.resourceType,
        resourceId: options.resourceId,
        resourceName: options.resourceName,
        eventData,
        ipAddress: options.ipAddress,
        userAgent: options.userAgent,
        sessionId: options.sessionId,
        riskLevel: options.riskLevel || 'low',
        isSuspicious: options.isSuspicious || false,
        securityFlags: options.securityFlags || [],
        country: options.country,
        city: options.city,
        deviceType: options.deviceType,
        browser: options.browser,
        os: options.os,
        gdprRelevant: options.gdprRelevant || false,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error('Error logging audit event:', error);
      // Don't throw error for audit logging failures
    }
  }

  /**
   * Log data access event
   */
  static async logDataAccess(
    userId: string,
    dataType: string,
    dataCategory: string,
    accessType: string,
    accessMethod: string,
    dataFields: string[] = [],
    options: {
      organizationId?: string;
      dataSubject?: string;
      purpose?: string;
      legalBasis?: string;
      retentionPeriod?: string;
      ipAddress?: string;
      userAgent?: string;
      sessionId?: string;
      gdprConsent?: boolean;
      dataMinimization?: boolean;
    } = {}
  ): Promise<void> {
    try {
      await db.insert(dataAccessLogs).values({
        userId,
        organizationId: options.organizationId,
        dataType,
        dataCategory,
        dataSubject: options.dataSubject,
        accessType,
        accessMethod,
        dataFields,
        purpose: options.purpose,
        legalBasis: options.legalBasis,
        retentionPeriod: options.retentionPeriod,
        ipAddress: options.ipAddress,
        userAgent: options.userAgent,
        sessionId: options.sessionId,
        gdprConsent: options.gdprConsent || false,
        dataMinimization: options.dataMinimization !== false,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error('Error logging data access:', error);
      // Don't throw error for audit logging failures
    }
  }

  /**
   * Log security event
   */
  static async logSecurityEvent(
    eventType: string,
    description: string,
    severity: 'low' | 'medium' | 'high' | 'critical',
    eventData: Record<string, any> = {},
    options: {
      userId?: string;
      organizationId?: string;
      affectedResources?: string[];
      ipAddress?: string;
      userAgent?: string;
      location?: string;
      deviceFingerprint?: string;
    } = {}
  ): Promise<number> {
    try {
      const result = await db.insert(securityEvents).values({
        userId: options.userId,
        organizationId: options.organizationId,
        eventType,
        severity,
        description,
        eventData,
        affectedResources: options.affectedResources || [],
        ipAddress: options.ipAddress,
        userAgent: options.userAgent,
        location: options.location,
        deviceFingerprint: options.deviceFingerprint,
        isResolved: false,
        notificationsSent: [],
        timestamp: new Date(),
      }).returning();

      return result[0].id;
    } catch (error) {
      console.error('Error logging security event:', error);
      throw new Error('Failed to log security event');
    }
  }

  /**
   * Get audit logs with filtering
   */
  static async getAuditLogs(
    filters: AuditFilters = {},
    limit: number = 100,
    offset: number = 0
  ): Promise<AuditLogEntry[]> {
    try {
      let query = db.select().from(auditLogs);

      // Apply filters
      const conditions = [];
      
      if (filters.userId) {
        conditions.push(eq(auditLogs.userId, filters.userId));
      }
      
      if (filters.organizationId) {
        conditions.push(eq(auditLogs.organizationId, filters.organizationId));
      }
      
      if (filters.eventType) {
        conditions.push(eq(auditLogs.eventType, filters.eventType));
      }
      
      if (filters.eventCategory) {
        conditions.push(eq(auditLogs.eventCategory, filters.eventCategory));
      }
      
      if (filters.resourceType) {
        conditions.push(eq(auditLogs.resourceType, filters.resourceType));
      }
      
      if (filters.riskLevel) {
        conditions.push(eq(auditLogs.riskLevel, filters.riskLevel));
      }
      
      if (filters.dateFrom) {
        conditions.push(gte(auditLogs.timestamp, filters.dateFrom));
      }
      
      if (filters.dateTo) {
        conditions.push(lte(auditLogs.timestamp, filters.dateTo));
      }
      
      if (filters.isSuspicious !== undefined) {
        conditions.push(eq(auditLogs.isSuspicious, filters.isSuspicious));
      }
      
      if (filters.gdprRelevant !== undefined) {
        conditions.push(eq(auditLogs.gdprRelevant, filters.gdprRelevant));
      }

      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }

      const logs = await query
        .orderBy(desc(auditLogs.timestamp))
        .limit(limit)
        .offset(offset);

      return logs;
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      throw new Error('Failed to fetch audit logs');
    }
  }

  /**
   * Get data access logs
   */
  static async getDataAccessLogs(
    userId?: string,
    organizationId?: string,
    dataType?: string,
    dateFrom?: Date,
    dateTo?: Date,
    limit: number = 100,
    offset: number = 0
  ): Promise<DataAccessLogEntry[]> {
    try {
      let query = db.select().from(dataAccessLogs);

      const conditions = [];
      
      if (userId) {
        conditions.push(eq(dataAccessLogs.userId, userId));
      }
      
      if (organizationId) {
        conditions.push(eq(dataAccessLogs.organizationId, organizationId));
      }
      
      if (dataType) {
        conditions.push(eq(dataAccessLogs.dataType, dataType));
      }
      
      if (dateFrom) {
        conditions.push(gte(dataAccessLogs.timestamp, dateFrom));
      }
      
      if (dateTo) {
        conditions.push(lte(dataAccessLogs.timestamp, dateTo));
      }

      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }

      const logs = await query
        .orderBy(desc(dataAccessLogs.timestamp))
        .limit(limit)
        .offset(offset);

      return logs;
    } catch (error) {
      console.error('Error fetching data access logs:', error);
      throw new Error('Failed to fetch data access logs');
    }
  }

  /**
   * Get security events
   */
  static async getSecurityEvents(
    userId?: string,
    organizationId?: string,
    severity?: string,
    isResolved?: boolean,
    limit: number = 100,
    offset: number = 0
  ): Promise<SecurityEvent[]> {
    try {
      let query = db.select().from(securityEvents);

      const conditions = [];
      
      if (userId) {
        conditions.push(eq(securityEvents.userId, userId));
      }
      
      if (organizationId) {
        conditions.push(eq(securityEvents.organizationId, organizationId));
      }
      
      if (severity) {
        conditions.push(eq(securityEvents.severity, severity));
      }
      
      if (isResolved !== undefined) {
        conditions.push(eq(securityEvents.isResolved, isResolved));
      }

      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }

      const events = await query
        .orderBy(desc(securityEvents.timestamp))
        .limit(limit)
        .offset(offset);

      return events;
    } catch (error) {
      console.error('Error fetching security events:', error);
      throw new Error('Failed to fetch security events');
    }
  }

  /**
   * Resolve security event
   */
  static async resolveSecurityEvent(
    eventId: number,
    resolvedBy: string,
    resolutionNotes: string
  ): Promise<void> {
    try {
      await db
        .update(securityEvents)
        .set({
          isResolved: true,
          resolvedBy,
          resolvedAt: new Date(),
          resolutionNotes,
        })
        .where(eq(securityEvents.id, eventId));
    } catch (error) {
      console.error('Error resolving security event:', error);
      throw new Error('Failed to resolve security event');
    }
  }

  /**
   * Get audit statistics
   */
  static async getAuditStatistics(
    organizationId?: string,
    dateFrom?: Date,
    dateTo?: Date
  ): Promise<{
    totalEvents: number;
    eventsByType: Record<string, number>;
    eventsByCategory: Record<string, number>;
    riskLevels: Record<string, number>;
    suspiciousEvents: number;
    gdprRelevantEvents: number;
  }> {
    try {
      let query = db.select().from(auditLogs);

      const conditions = [];
      
      if (organizationId) {
        conditions.push(eq(auditLogs.organizationId, organizationId));
      }
      
      if (dateFrom) {
        conditions.push(gte(auditLogs.timestamp, dateFrom));
      }
      
      if (dateTo) {
        conditions.push(lte(auditLogs.timestamp, dateTo));
      }

      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }

      const logs = await query;

      const statistics = {
        totalEvents: logs.length,
        eventsByType: {} as Record<string, number>,
        eventsByCategory: {} as Record<string, number>,
        riskLevels: {} as Record<string, number>,
        suspiciousEvents: 0,
        gdprRelevantEvents: 0,
      };

      logs.forEach(log => {
        // Count by event type
        statistics.eventsByType[log.eventType] = (statistics.eventsByType[log.eventType] || 0) + 1;
        
        // Count by category
        statistics.eventsByCategory[log.eventCategory] = (statistics.eventsByCategory[log.eventCategory] || 0) + 1;
        
        // Count by risk level
        statistics.riskLevels[log.riskLevel] = (statistics.riskLevels[log.riskLevel] || 0) + 1;
        
        // Count suspicious events
        if (log.isSuspicious) {
          statistics.suspiciousEvents++;
        }
        
        // Count GDPR relevant events
        if (log.gdprRelevant) {
          statistics.gdprRelevantEvents++;
        }
      });

      return statistics;
    } catch (error) {
      console.error('Error fetching audit statistics:', error);
      throw new Error('Failed to fetch audit statistics');
    }
  }

  /**
   * Get event category from event type
   */
  private static getEventCategory(eventType: string): string {
    const categoryMap: Record<string, string> = {
      'login': 'authentication',
      'logout': 'authentication',
      'password_change': 'authentication',
      'mfa_setup': 'authentication',
      'mfa_verify': 'authentication',
      'create': 'data_access',
      'update': 'data_access',
      'delete': 'data_access',
      'view': 'data_access',
      'export': 'data_access',
      'import': 'data_access',
      'system_start': 'system',
      'system_stop': 'system',
      'backup': 'system',
      'restore': 'system',
      'failed_login': 'security',
      'suspicious_activity': 'security',
      'unauthorized_access': 'security',
    };

    return categoryMap[eventType] || 'general';
  }
}
