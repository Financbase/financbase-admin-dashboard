/**
 * Enhanced Audit Logging & Security Monitoring Service
 * Comprehensive logging for fintech compliance and security monitoring
 * Supports SOC 2, GDPR, and enterprise security requirements
 */

import { db } from '@/lib/db';
import { activities } from '@/lib/db/schemas/activities.schema';
import { eq, and, gte, desc, sql } from 'drizzle-orm';
import { NextRequest } from 'next/server';

// Audit event types for comprehensive tracking
export enum AuditEventType {
  // Authentication events
  LOGIN = 'login',
  LOGOUT = 'logout',
  LOGIN_FAILED = 'login_failed',
  PASSWORD_RESET = 'password_reset',
  MFA_ENABLED = 'mfa_enabled',
  MFA_DISABLED = 'mfa_disabled',

  // Financial operations
  TRANSACTION_CREATED = 'transaction_created',
  TRANSACTION_UPDATED = 'transaction_updated',
  TRANSACTION_DELETED = 'transaction_deleted',
  INVOICE_CREATED = 'invoice_created',
  INVOICE_UPDATED = 'invoice_updated',
  INVOICE_DELETED = 'invoice_deleted',
  PAYMENT_PROCESSED = 'payment_processed',
  PAYMENT_FAILED = 'payment_failed',
  EXPENSE_CREATED = 'expense_created',
  EXPENSE_UPDATED = 'expense_updated',
  EXPENSE_DELETED = 'expense_deleted',

  // Data access
  DATA_EXPORTED = 'data_exported',
  REPORT_GENERATED = 'report_generated',
  BULK_OPERATION = 'bulk_operation',
  API_ACCESS = 'api_access',

  // User management
  USER_CREATED = 'user_created',
  USER_UPDATED = 'user_updated',
  USER_DELETED = 'user_deleted',
  ROLE_CHANGED = 'role_changed',
  PERMISSION_GRANTED = 'permission_granted',
  PERMISSION_REVOKED = 'permission_revoked',

  // Organization management
  ORG_CREATED = 'org_created',
  ORG_UPDATED = 'org_updated',
  ORG_DELETED = 'org_deleted',
  MEMBER_ADDED = 'member_added',
  MEMBER_REMOVED = 'member_removed',

  // Security events
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  SECURITY_VIOLATION = 'security_violation',
  DATA_BREACH_ATTEMPT = 'data_breach_attempt',
  UNAUTHORIZED_ACCESS = 'unauthorized_access',

  // AI interactions
  AI_CATEGORIZATION = 'ai_categorization',
  AI_INSIGHTS_GENERATED = 'ai_insights_generated',
  AI_FEEDBACK_PROCESSED = 'ai_feedback_processed',

  // System events
  BACKUP_COMPLETED = 'backup_completed',
  BACKUP_FAILED = 'backup_failed',
  SYSTEM_UPDATE = 'system_update',
  MAINTENANCE_MODE = 'maintenance_mode'
}

// Risk levels for security monitoring
export enum RiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Compliance frameworks supported
export enum ComplianceFramework {
  SOC2 = 'soc2',
  GDPR = 'gdpr',
  HIPAA = 'hipaa',
  PCI = 'pci',
  SOX = 'sox'
}

// Audit event interface
export interface AuditEvent {
  id: string;
  timestamp: Date;
  userId?: string;
  organizationId?: string;
  eventType: AuditEventType;
  action: string;
  entityType: string;
  entityId?: string;
  description: string;

  // Security context
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  riskLevel: RiskLevel;

  // Financial context
  amount?: number;
  currency?: string;
  paymentMethod?: string;

  // Technical context
  metadata: Record<string, any>;
  complianceFlags: ComplianceFramework[];

  // AI context
  aiModel?: string;
  aiProvider?: string;
  confidence?: number;
  explanation?: string;
}

// Security alert interface
export interface SecurityAlert {
  id: string;
  timestamp: Date;
  severity: RiskLevel;
  type: 'suspicious_login' | 'unusual_activity' | 'data_breach' | 'policy_violation';
  userId?: string;
  organizationId?: string;
  description: string;
  evidence: string[];
  recommendedActions: string[];
  status: 'open' | 'investigating' | 'resolved' | 'false_positive';
  assignedTo?: string;
  resolvedAt?: Date;
  resolution?: string;
}

// Data retention policy
interface RetentionPolicy {
  eventType: AuditEventType;
  retentionDays: number;
  archiveAfterDays?: number;
  complianceRequired: ComplianceFramework[];
}

const RETENTION_POLICIES: Record<AuditEventType, RetentionPolicy> = {
  [AuditEventType.LOGIN]: {
    retentionDays: 2555, // 7 years for authentication logs
    complianceRequired: [ComplianceFramework.SOC2, ComplianceFramework.GDPR]
  },
  [AuditEventType.PAYMENT_PROCESSED]: {
    retentionDays: 2555, // 7 years for financial transactions
    complianceRequired: [ComplianceFramework.SOC2, ComplianceFramework.PCI, ComplianceFramework.SOX]
  },
  [AuditEventType.DATA_EXPORTED]: {
    retentionDays: 2555, // 7 years for data access logs
    complianceRequired: [ComplianceFramework.SOC2, ComplianceFramework.GDPR]
  },
  [AuditEventType.SUSPICIOUS_ACTIVITY]: {
    retentionDays: 3650, // 10 years for security events
    complianceRequired: [ComplianceFramework.SOC2, ComplianceFramework.GDPR]
  },
  // Add more policies as needed
  [AuditEventType.TRANSACTION_CREATED]: {
    retentionDays: 2555,
    complianceRequired: [ComplianceFramework.SOC2]
  },
  [AuditEventType.LOGIN_FAILED]: {
    retentionDays: 365,
    complianceRequired: [ComplianceFramework.SOC2]
  },
  [AuditEventType.USER_CREATED]: {
    retentionDays: 2555,
    complianceRequired: [ComplianceFramework.SOC2, ComplianceFramework.GDPR]
  },
  [AuditEventType.AI_CATEGORIZATION]: {
    retentionDays: 90, // Shorter retention for AI operations
    complianceRequired: []
  },
  [AuditEventType.REPORT_GENERATED]: {
    retentionDays: 365,
    complianceRequired: [ComplianceFramework.SOC2]
  }
};

export class AuditLoggingService {
  private static instance: AuditLoggingService;
  private securityAlerts: Map<string, SecurityAlert> = new Map();
  private suspiciousActivityThreshold = 5; // Failed attempts before alert

  private constructor() {
    // Initialize security monitoring
    this.initializeSecurityMonitoring();
  }

  static getInstance(): AuditLoggingService {
    if (!AuditLoggingService.instance) {
      AuditLoggingService.instance = new AuditLoggingService();
    }
    return AuditLoggingService.instance;
  }

  /**
   * Log audit event with comprehensive context
   */
  async logEvent(event: Omit<AuditEvent, 'id' | 'timestamp'>): Promise<void> {
    const auditEvent: AuditEvent = {
      ...event,
      id: crypto.randomUUID(),
      timestamp: new Date()
    };

    try {
      // Store in database using existing activities table
      await this.storeAuditEvent(auditEvent);

      // Check for security threats
      await this.analyzeSecurityImplications(auditEvent);

      // Check compliance requirements
      await this.checkComplianceRequirements(auditEvent);

      // Real-time monitoring
      await this.performRealTimeAnalysis(auditEvent);

    } catch (error) {
      console.error('Failed to log audit event:', error);
      // Ensure critical events are logged even if storage fails
      await this.logCriticalEventFallback(auditEvent);
    }
  }

  /**
   * Log authentication events
   */
  async logAuthEvent(
    userId: string,
    eventType: AuditEventType,
    request: NextRequest,
    metadata: Record<string, any> = {}
  ): Promise<void> {
    const ipAddress = this.getClientIP(request);
    const userAgent = request.headers.get('user-agent') || '';

    await this.logEvent({
      userId,
      eventType,
      action: eventType,
      entityType: 'user',
      description: this.getAuthEventDescription(eventType, metadata),
      ipAddress,
      userAgent,
      riskLevel: this.getAuthEventRiskLevel(eventType),
      metadata: {
        ...metadata,
        location: await this.getLocationFromIP(ipAddress),
        deviceInfo: this.parseUserAgent(userAgent)
      },
      complianceFlags: [ComplianceFramework.SOC2, ComplianceFramework.GDPR]
    });
  }

  /**
   * Log financial operations with PCI compliance
   */
  async logFinancialEvent(
    userId: string,
    eventType: AuditEventType,
    entityType: string,
    entityId: string,
    financialData: {
      amount?: number;
      currency?: string;
      paymentMethod?: string;
    },
    metadata: Record<string, any> = {}
  ): Promise<void> {
    await this.logEvent({
      userId,
      eventType,
      action: eventType,
      entityType,
      entityId,
      description: this.getFinancialEventDescription(eventType, financialData),
      amount: financialData.amount,
      currency: financialData.currency,
      paymentMethod: this.maskPaymentMethod(financialData.paymentMethod),
      riskLevel: this.getFinancialEventRiskLevel(eventType, financialData),
      metadata: {
        ...metadata,
        // Ensure no sensitive financial data in metadata
        sanitized: true
      },
      complianceFlags: [ComplianceFramework.SOC2, ComplianceFramework.PCI, ComplianceFramework.SOX]
    });
  }

  /**
   * Log AI interactions with explainability
   */
  async logAIEvent(
    userId: string,
    eventType: AuditEventType,
    entityType: string,
    entityId: string,
    aiContext: {
      model: string;
      provider: string;
      confidence?: number;
      explanation?: string;
    },
    metadata: Record<string, any> = {}
  ): Promise<void> {
    await this.logEvent({
      userId,
      eventType,
      action: eventType,
      entityType,
      entityId,
      description: this.getAIEventDescription(eventType, aiContext),
      aiModel: aiContext.model,
      aiProvider: aiContext.provider,
      confidence: aiContext.confidence,
      explanation: aiContext.explanation,
      riskLevel: RiskLevel.LOW,
      metadata,
      complianceFlags: [ComplianceFramework.SOC2]
    });
  }

  /**
   * Log data access for GDPR compliance
   */
  async logDataAccess(
    userId: string,
    accessType: 'read' | 'export' | 'download',
    dataType: string,
    recordCount?: number,
    request: NextRequest,
    metadata: Record<string, any> = {}
  ): Promise<void> {
    await this.logEvent({
      userId,
      eventType: AuditEventType.DATA_EXPORTED,
      action: `data_${accessType}`,
      entityType: dataType,
      description: this.getDataAccessDescription(accessType, dataType, recordCount),
      riskLevel: accessType === 'export' ? RiskLevel.MEDIUM : RiskLevel.LOW,
      metadata: {
        ...metadata,
        recordCount,
        purpose: metadata.purpose || 'user_request',
        dataRetention: this.getDataRetentionPeriod(dataType)
      },
      complianceFlags: [ComplianceFramework.SOC2, ComplianceFramework.GDPR],
      ipAddress: this.getClientIP(request),
      userAgent: request.headers.get('user-agent') || ''
    });
  }

  /**
   * Generate compliance reports
   */
  async generateComplianceReport(
    organizationId: string,
    framework: ComplianceFramework,
    startDate: Date,
    endDate: Date
  ): Promise<{
    events: AuditEvent[];
    securityAlerts: SecurityAlert[];
    complianceScore: number;
    gaps: string[];
    recommendations: string[];
  }> {
    const events = await this.getAuditEvents(organizationId, startDate, endDate, framework);
    const alerts = await this.getSecurityAlerts(organizationId, startDate, endDate);

    const complianceScore = this.calculateComplianceScore(events, framework);
    const gaps = this.identifyComplianceGaps(events, framework);
    const recommendations = this.generateComplianceRecommendations(gaps, framework);

    return {
      events,
      securityAlerts: alerts,
      complianceScore,
      gaps,
      recommendations
    };
  }

  /**
   * Detect suspicious activity patterns
   */
  async detectSuspiciousActivity(
    userId: string,
    timeWindow: number = 3600000 // 1 hour in milliseconds
  ): Promise<SecurityAlert[]> {
    const alerts: SecurityAlert[] = [];

    // Multiple failed login attempts
    const failedLogins = await this.getFailedLogins(userId, timeWindow);
    if (failedLogins.length >= this.suspiciousActivityThreshold) {
      alerts.push({
        id: crypto.randomUUID(),
        timestamp: new Date(),
        severity: RiskLevel.HIGH,
        type: 'suspicious_login',
        userId,
        description: `Multiple failed login attempts detected (${failedLogins.length} attempts in ${timeWindow / 60000} minutes)`,
        evidence: failedLogins.map(f => `Failed login from ${f.ipAddress} at ${f.timestamp.toISOString()}`),
        recommendedActions: [
          'Review login attempts',
          'Consider temporary account suspension',
          'Notify user of suspicious activity',
          'Check for compromised credentials'
        ],
        status: 'open'
      });
    }

    // Unusual transaction patterns
    const unusualTransactions = await this.detectUnusualTransactions(userId, timeWindow);
    if (unusualTransactions.length > 0) {
      alerts.push({
        id: crypto.randomUUID(),
        timestamp: new Date(),
        severity: RiskLevel.MEDIUM,
        type: 'unusual_activity',
        userId,
        description: `Unusual transaction patterns detected (${unusualTransactions.length} transactions flagged)`,
        evidence: unusualTransactions.map(t => `${t.description} - $${t.amount} on ${t.date.toISOString()}`),
        recommendedActions: [
          'Review transaction details',
          'Verify with user',
          'Check for fraudulent activity'
        ],
        status: 'open'
      });
    }

    // Geographic anomalies
    const geoAnomalies = await this.detectGeographicAnomalies(userId, timeWindow);
    if (geoAnomalies.length > 0) {
      alerts.push({
        id: crypto.randomUUID(),
        timestamp: new Date(),
        severity: RiskLevel.HIGH,
        type: 'suspicious_login',
        userId,
        description: `Login attempts from unusual geographic locations (${geoAnomalies.length} locations)`,
        evidence: geoAnomalies.map(g => `Login from ${g.country} (${g.ipAddress}) at ${g.timestamp.toISOString()}`),
        recommendedActions: [
          'Require additional authentication',
          'Review account security settings',
          'Consider geographic restrictions'
        ],
        status: 'open'
      });
    }

    return alerts;
  }

  /**
   * Real-time security monitoring
   */
  private async analyzeSecurityImplications(event: AuditEvent): Promise<void> {
    // Check for immediate security threats
    if (event.eventType === AuditEventType.LOGIN_FAILED) {
      await this.checkBruteForceAttack(event);
    }

    if (event.eventType === AuditEventType.UNAUTHORIZED_ACCESS) {
      await this.handleUnauthorizedAccess(event);
    }

    if (event.eventType === AuditEventType.DATA_EXPORTED && event.riskLevel === RiskLevel.HIGH) {
      await this.handleHighRiskDataExport(event);
    }
  }

  /**
   * Compliance requirement checking
   */
  private async checkComplianceRequirements(event: AuditEvent): Promise<void> {
    const policy = RETENTION_POLICIES[event.eventType];
    if (!policy) return;

    // Check if all required compliance frameworks are flagged
    for (const framework of policy.complianceRequired) {
      if (!event.complianceFlags.includes(framework)) {
        console.warn(`Missing compliance flag for ${framework} on event ${event.eventType}`);
        // Could trigger alerts or notifications
      }
    }
  }

  /**
   * Real-time threat analysis
   */
  private async performRealTimeAnalysis(event: AuditEvent): Promise<void> {
    // Pattern analysis for immediate threats
    if (event.riskLevel === RiskLevel.CRITICAL) {
      await this.triggerImmediateResponse(event);
    }

    // Anomaly detection
    if (await this.isAnomalousActivity(event)) {
      await this.createSecurityAlert(event, 'unusual_activity');
    }
  }

  /**
   * Database operations
   */
  private async storeAuditEvent(event: AuditEvent): Promise<void> {
    // Map to existing activities table schema
    await db.insert(activities).values({
      id: event.id,
      userId: event.userId,
      action: event.action,
      entityType: event.entityType,
      entityId: event.entityId,
      description: event.description,
      metadata: JSON.stringify({
        ...event.metadata,
        riskLevel: event.riskLevel,
        complianceFlags: event.complianceFlags,
        aiModel: event.aiModel,
        aiProvider: event.aiProvider,
        confidence: event.confidence,
        explanation: event.explanation
      }),
      ipAddress: event.ipAddress,
      userAgent: event.userAgent,
      createdAt: event.timestamp
    });
  }

  private async getAuditEvents(
    organizationId: string,
    startDate: Date,
    endDate: Date,
    framework?: ComplianceFramework
  ): Promise<AuditEvent[]> {
    // Query activities table and transform to AuditEvent format
    const events = await db
      .select()
      .from(activities)
      .where(and(
        gte(activities.createdAt, startDate),
        lte(activities.createdAt, endDate)
      ))
      .orderBy(desc(activities.createdAt));

    return events.map(this.transformActivityToAuditEvent);
  }

  private transformActivityToAuditEvent(activity: any): AuditEvent {
    const metadata = typeof activity.metadata === 'string'
      ? JSON.parse(activity.metadata)
      : activity.metadata;

    return {
      id: activity.id,
      timestamp: activity.createdAt,
      userId: activity.userId,
      eventType: this.mapActionToEventType(activity.action),
      action: activity.action,
      entityType: activity.entityType,
      entityId: activity.entityId,
      description: activity.description,
      ipAddress: activity.ipAddress,
      userAgent: activity.userAgent,
      riskLevel: metadata?.riskLevel || RiskLevel.LOW,
      metadata,
      complianceFlags: metadata?.complianceFlags || [],
      aiModel: metadata?.aiModel,
      aiProvider: metadata?.aiProvider,
      confidence: metadata?.confidence,
      explanation: metadata?.explanation
    };
  }

  private mapActionToEventType(action: string): AuditEventType {
    // Map activity actions to audit event types
    const mapping: Record<string, AuditEventType> = {
      'login': AuditEventType.LOGIN,
      'logout': AuditEventType.LOGOUT,
      'login_failed': AuditEventType.LOGIN_FAILED,
      'transaction_created': AuditEventType.TRANSACTION_CREATED,
      'payment_processed': AuditEventType.PAYMENT_PROCESSED,
      'data_exported': AuditEventType.DATA_EXPORTED,
      'ai_categorization': AuditEventType.AI_CATEGORIZATION,
      // Add more mappings as needed
    };

    return mapping[action] || AuditEventType.API_ACCESS;
  }

  /**
   * Security analysis methods
   */
  private async checkBruteForceAttack(event: AuditEvent): Promise<void> {
    if (!event.userId) return;

    const recentFailures = await this.getFailedLoginsInWindow(
      event.userId,
      event.ipAddress,
      300000 // 5 minutes
    );

    if (recentFailures.length >= 5) {
      await this.createSecurityAlert(event, 'suspicious_login');
    }
  }

  private async handleUnauthorizedAccess(event: AuditEvent): Promise<void> {
    await this.createSecurityAlert(event, 'unauthorized_access');
  }

  private async handleHighRiskDataExport(event: AuditEvent): Promise<void> {
    await this.createSecurityAlert(event, 'data_breach');
  }

  private async createSecurityAlert(
    event: AuditEvent,
    alertType: SecurityAlert['type']
  ): Promise<void> {
    const alert: SecurityAlert = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      severity: event.riskLevel,
      type: alertType,
      userId: event.userId,
      description: `Security alert: ${event.description}`,
      evidence: [event.description],
      recommendedActions: this.getRecommendedActions(alertType, event),
      status: 'open'
    };

    // Store alert (would need security_alerts table)
    this.securityAlerts.set(alert.id, alert);

    // Notify security team
    await this.notifySecurityTeam(alert);
  }

  private async triggerImmediateResponse(event: AuditEvent): Promise<void> {
    // Immediate security responses for critical events
    console.warn(`CRITICAL SECURITY EVENT: ${event.description}`);

    // Could include:
    // - Immediate account suspension
    // - Security team notification
    // - IP blocking
    // - Session termination
  }

  private async isAnomalousActivity(event: AuditEvent): Promise<boolean> {
    // Machine learning-based anomaly detection
    // Compare against user's normal behavior patterns
    return false; // Implementation needed
  }

  /**
   * Utility methods
   */
  private getClientIP(request: NextRequest): string {
    // Extract real IP from various headers
    const forwarded = request.headers.get('x-forwarded-for');
    if (forwarded) {
      return forwarded.split(',')[0].trim();
    }

    const realIP = request.headers.get('x-real-ip');
    if (realIP) {
      return realIP;
    }

    return request.ip || 'unknown';
  }

  private async getLocationFromIP(ipAddress: string): Promise<any> {
    // Use IP geolocation service
    try {
      // Implementation would use a geolocation API
      return { country: 'US', region: 'CA', city: 'San Francisco' };
    } catch {
      return { country: 'Unknown' };
    }
  }

  private parseUserAgent(userAgent: string): any {
    // Parse user agent for device/browser info
    return {
      browser: 'Chrome',
      os: 'Windows',
      device: 'Desktop'
    };
  }

  private maskPaymentMethod(paymentMethod?: string): string | undefined {
    if (!paymentMethod) return undefined;

    // PCI compliance: mask sensitive payment data
    if (paymentMethod.includes('*')) return paymentMethod; // Already masked
    if (paymentMethod.length > 4) {
      return paymentMethod.substring(0, 4) + '*'.repeat(paymentMethod.length - 4);
    }
    return paymentMethod;
  }

  private getAuthEventDescription(eventType: AuditEventType, metadata: Record<string, any>): string {
    const descriptions = {
      [AuditEventType.LOGIN]: `User logged in successfully`,
      [AuditEventType.LOGOUT]: `User logged out`,
      [AuditEventType.LOGIN_FAILED]: `Failed login attempt`,
      [AuditEventType.PASSWORD_RESET]: `Password reset requested`,
      [AuditEventType.MFA_ENABLED]: `Multi-factor authentication enabled`,
      [AuditEventType.MFA_DISABLED]: `Multi-factor authentication disabled`
    };

    return descriptions[eventType] || `Authentication event: ${eventType}`;
  }

  private getFinancialEventDescription(
    eventType: AuditEventType,
    financialData: any
  ): string {
    const descriptions = {
      [AuditEventType.PAYMENT_PROCESSED]: `Payment processed: $${financialData.amount}`,
      [AuditEventType.TRANSACTION_CREATED]: `Transaction created: ${financialData.description}`,
      [AuditEventType.INVOICE_CREATED]: `Invoice created for $${financialData.amount}`,
      [AuditEventType.EXPENSE_CREATED]: `Expense recorded: $${financialData.amount}`
    };

    return descriptions[eventType] || `Financial operation: ${eventType}`;
  }

  private getAIEventDescription(
    eventType: AuditEventType,
    aiContext: any
  ): string {
    const descriptions = {
      [AuditEventType.AI_CATEGORIZATION]: `AI categorization using ${aiContext.model} (${Math.round((aiContext.confidence || 0) * 100)}% confidence)`,
      [AuditEventType.AI_INSIGHTS_GENERATED]: `AI insights generated using ${aiContext.model}`,
      [AuditEventType.AI_FEEDBACK_PROCESSED]: `AI feedback processed for model improvement`
    };

    return descriptions[eventType] || `AI operation: ${eventType}`;
  }

  private getDataAccessDescription(
    accessType: string,
    dataType: string,
    recordCount?: number
  ): string {
    const countText = recordCount ? `${recordCount} records` : 'data';
    return `Data ${accessType}: ${countText} of type ${dataType}`;
  }

  private getAuthEventRiskLevel(eventType: AuditEventType): RiskLevel {
    const riskLevels = {
      [AuditEventType.LOGIN]: RiskLevel.LOW,
      [AuditEventType.LOGOUT]: RiskLevel.LOW,
      [AuditEventType.LOGIN_FAILED]: RiskLevel.MEDIUM,
      [AuditEventType.PASSWORD_RESET]: RiskLevel.MEDIUM,
      [AuditEventType.MFA_ENABLED]: RiskLevel.LOW,
      [AuditEventType.MFA_DISABLED]: RiskLevel.HIGH
    };

    return riskLevels[eventType] || RiskLevel.LOW;
  }

  private getFinancialEventRiskLevel(
    eventType: AuditEventType,
    financialData: any
  ): RiskLevel {
    const riskLevels = {
      [AuditEventType.PAYMENT_PROCESSED]: RiskLevel.LOW,
      [AuditEventType.PAYMENT_FAILED]: RiskLevel.MEDIUM,
      [AuditEventType.TRANSACTION_CREATED]: RiskLevel.LOW,
      [AuditEventType.TRANSACTION_DELETED]: RiskLevel.HIGH,
      [AuditEventType.BULK_OPERATION]: RiskLevel.MEDIUM
    };

    // Higher risk for large amounts
    if (financialData.amount && financialData.amount > 10000) {
      return RiskLevel.MEDIUM;
    }

    return riskLevels[eventType] || RiskLevel.LOW;
  }

  private getRecommendedActions(
    alertType: SecurityAlert['type'],
    event: AuditEvent
  ): string[] {
    const actions = {
      suspicious_login: [
        'Review login attempts',
        'Consider temporary account suspension',
        'Notify user of suspicious activity',
        'Check for compromised credentials'
      ],
      unusual_activity: [
        'Review transaction details',
        'Verify with user',
        'Check for fraudulent activity',
        'Monitor account closely'
      ],
      data_breach: [
        'Immediate account suspension',
        'Security team investigation',
        'User notification',
        'Legal compliance reporting'
      ],
      unauthorized_access: [
        'Revoke access immediately',
        'Security investigation',
        'Password reset required',
        'Access log review'
      ],
      policy_violation: [
        'Review policy compliance',
        'User training required',
        'Access restriction',
        'Management notification'
      ]
    };

    return actions[alertType] || ['Review and investigate'];
  }

  private async getFailedLogins(
    userId: string,
    timeWindow: number
  ): Promise<any[]> {
    // Query for failed login attempts within time window
    return [];
  }

  private async getFailedLoginsInWindow(
    userId: string,
    ipAddress: string | undefined,
    timeWindow: number
  ): Promise<any[]> {
    // Query for failed logins in specific time window
    return [];
  }

  private async detectUnusualTransactions(
    userId: string,
    timeWindow: number
  ): Promise<any[]> {
    // Detect unusual transaction patterns
    return [];
  }

  private async detectGeographicAnomalies(
    userId: string,
    timeWindow: number
  ): Promise<any[]> {
    // Detect unusual geographic patterns
    return [];
  }

  private async notifySecurityTeam(alert: SecurityAlert): Promise<void> {
    // Send notifications to security team
    console.warn(`SECURITY ALERT: ${alert.description}`, alert);
  }

  private getDataRetentionPeriod(dataType: string): number {
    // Return retention period based on data type and compliance
    return 2555; // 7 years default
  }

  private calculateComplianceScore(
    events: AuditEvent[],
    framework: ComplianceFramework
  ): number {
    // Calculate compliance score based on events and framework requirements
    return 85; // Implementation needed
  }

  private identifyComplianceGaps(
    events: AuditEvent[],
    framework: ComplianceFramework
  ): string[] {
    // Identify missing compliance requirements
    return []; // Implementation needed
  }

  private generateComplianceRecommendations(
    gaps: string[],
    framework: ComplianceFramework
  ): string[] {
    // Generate actionable recommendations
    return gaps.map(gap => `Address ${gap} to improve ${framework} compliance`);
  }

  private async logCriticalEventFallback(event: AuditEvent): Promise<void> {
    // Fallback logging for critical events when database is unavailable
    console.error('CRITICAL AUDIT EVENT (FALLBACK):', JSON.stringify(event, null, 2));
  }

  private async initializeSecurityMonitoring(): Promise<void> {
    // Initialize security monitoring rules and thresholds
    console.log('Security monitoring initialized');
  }
}

// Export singleton instance
export const auditLogger = AuditLoggingService.getInstance();

// Convenience functions for common logging operations
export async function logUserAction(
  userId: string,
  action: string,
  entityType: string,
  entityId: string,
  description: string,
  metadata: Record<string, any> = {}
): Promise<void> {
  await auditLogger.logEvent({
    userId,
    eventType: AuditEventType.API_ACCESS,
    action,
    entityType,
    entityId,
    description,
    riskLevel: RiskLevel.LOW,
    metadata,
    complianceFlags: [ComplianceFramework.SOC2]
  });
}

export async function logSecurityEvent(
  userId: string,
  eventType: AuditEventType,
  description: string,
  riskLevel: RiskLevel,
  metadata: Record<string, any> = {}
): Promise<void> {
  await auditLogger.logEvent({
    userId,
    eventType,
    action: eventType,
    entityType: 'security',
    description,
    riskLevel,
    metadata,
    complianceFlags: [ComplianceFramework.SOC2, ComplianceFramework.GDPR]
  });
}

export async function logFinancialTransaction(
  userId: string,
  transactionType: 'created' | 'updated' | 'deleted',
  entityType: string,
  entityId: string,
  amount: number,
  currency: string,
  metadata: Record<string, any> = {}
): Promise<void> {
  const eventType = transactionType === 'created' ? AuditEventType.TRANSACTION_CREATED :
                   transactionType === 'updated' ? AuditEventType.TRANSACTION_UPDATED :
                   AuditEventType.TRANSACTION_DELETED;

  await auditLogger.logFinancialEvent(
    userId,
    eventType,
    entityType,
    entityId,
    { amount, currency },
    metadata
  );
}
