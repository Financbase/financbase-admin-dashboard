/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { db } from '@/lib/db';
import {
  alertRules,
  realTimeAlerts,
  siemEvents,
} from '@/lib/db/schemas';
import { eq, and, desc, gte, lte, sql, or } from 'drizzle-orm';
import { NotificationService } from '@/lib/services/notification-service';
import { SIEMEvent } from './siem-integration-service';

export interface AlertRule {
  id: number;
  organizationId: string;
  createdBy?: string;
  name: string;
  description?: string;
  ruleType: 'threshold' | 'anomaly' | 'correlation' | 'pattern' | 'machine_learning' | 'custom';
  isActive: boolean;
  priority: number;
  conditions: any;
  eventFilters: Record<string, any>;
  threshold?: number;
  timeWindow?: number;
  alertSeverity: 'low' | 'medium' | 'high' | 'critical';
  alertTitle: string;
  alertMessage: string;
  alertChannels: string[];
  alertRecipients: string[];
  escalationPolicy: Record<string, any>;
  cooldownPeriod: number;
  triggerCount: number;
  lastTriggeredAt?: Date;
  tags: string[];
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface RealTimeAlert {
  id: number;
  organizationId: string;
  alertRuleId?: number;
  alertId: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'acknowledged' | 'resolved' | 'suppressed';
  title: string;
  message: string;
  triggeredAt: Date;
  triggeredBy?: string;
  relatedEvents: string[];
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  resolvedBy?: string;
  resolvedAt?: Date;
  resolutionNotes?: string;
  notificationsSent: any[];
  escalationLevel: number;
  tags: string[];
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export class RealTimeAlertingService {
  /**
   * Generate unique alert ID
   */
  private static generateAlertId(): string {
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Process event for alerts
   */
  static async processEvent(
    organizationId: string,
    event: SIEMEvent
  ): Promise<void> {
    try {
      // Get active alert rules for this organization
      const rules = await db
        .select()
        .from(alertRules)
        .where(
          and(
            eq(alertRules.organizationId, organizationId),
            eq(alertRules.isActive, true)
          )
        )
        .orderBy(desc(alertRules.priority));

      for (const rule of rules) {
        // Check if event matches rule filters
        if (!this.eventMatchesRule(event, rule)) {
          continue;
        }

        // Check if rule should trigger
        const shouldTrigger = await this.shouldTriggerRule(rule, event);
        
        if (shouldTrigger) {
          // Check cooldown period
          if (rule.lastTriggeredAt) {
            const cooldownMs = rule.cooldownPeriod * 1000;
            const timeSinceLastTrigger = Date.now() - rule.lastTriggeredAt.getTime();
            if (timeSinceLastTrigger < cooldownMs) {
              continue; // Still in cooldown
            }
          }

          // Create alert
          await this.createAlert(organizationId, rule, event);
          
          // Update rule statistics
          await db
            .update(alertRules)
            .set({
              triggerCount: sql`${alertRules.triggerCount} + 1`,
              lastTriggeredAt: new Date(),
            })
            .where(eq(alertRules.id, rule.id));
        }
      }
    } catch (error) {
      console.error('Error processing event for alerts:', error);
      // Don't throw - alerting should not break event processing
    }
  }

  /**
   * Check if event matches rule filters
   */
  private static eventMatchesRule(event: SIEMEvent, rule: AlertRule): boolean {
    const filters = rule.eventFilters;
    
    if (filters.eventTypes && !filters.eventTypes.includes(event.eventType)) {
      return false;
    }
    if (filters.eventCategories && !filters.eventCategories.includes(event.eventCategory)) {
      return false;
    }
    if (filters.severities && !filters.severities.includes(event.severity)) {
      return false;
    }
    if (filters.sourceSystems && !filters.sourceSystems.includes(event.sourceSystem)) {
      return false;
    }
    if (filters.sourceComponents && event.sourceComponent && !filters.sourceComponents.includes(event.sourceComponent)) {
      return false;
    }
    
    return true;
  }

  /**
   * Check if rule should trigger
   */
  private static async shouldTriggerRule(
    rule: AlertRule,
    event: SIEMEvent
  ): Promise<boolean> {
    switch (rule.ruleType) {
      case 'threshold':
        return await this.checkThresholdRule(rule, event);
      case 'correlation':
        return await this.checkCorrelationRule(rule, event);
      case 'pattern':
        return await this.checkPatternRule(rule, event);
      case 'anomaly':
        return await this.checkAnomalyRule(rule, event);
      default:
        return false;
    }
  }

  /**
   * Check threshold-based rule
   */
  private static async checkThresholdRule(
    rule: AlertRule,
    event: SIEMEvent
  ): Promise<boolean> {
    if (!rule.threshold || !rule.timeWindow) {
      return false;
    }

    // Count events matching rule in time window
    const timeWindowStart = new Date(Date.now() - rule.timeWindow * 1000);
    
    const matchingEvents = await db
      .select({ count: sql<number>`count(*)` })
      .from(siemEvents)
      .where(
        and(
          eq(siemEvents.organizationId, event.organizationId),
          gte(siemEvents.timestamp, timeWindowStart),
          ...this.buildEventFilterConditions(rule.eventFilters)
        )
      );

    const count = matchingEvents[0]?.count || 0;
    return count >= rule.threshold;
  }

  /**
   * Check correlation-based rule
   */
  private static async checkCorrelationRule(
    rule: AlertRule,
    event: SIEMEvent
  ): Promise<boolean> {
    const conditions = rule.conditions;
    if (!conditions || !conditions.correlationPattern) {
      return false;
    }

    // Check if event matches correlation pattern
    // This is a simplified implementation - can be extended
    const pattern = conditions.correlationPattern;
    const timeWindow = conditions.timeWindow || 300; // 5 minutes default
    const timeWindowStart = new Date(Date.now() - timeWindow * 1000);

    // Get recent events
    const recentEvents = await db
      .select()
      .from(siemEvents)
      .where(
        and(
          eq(siemEvents.organizationId, event.organizationId),
          gte(siemEvents.timestamp, timeWindowStart)
        )
      )
      .orderBy(desc(siemEvents.timestamp))
      .limit(100);

    // Check correlation pattern
    return this.matchesCorrelationPattern(recentEvents, pattern, event);
  }

  /**
   * Check pattern-based rule
   */
  private static async checkPatternRule(
    rule: AlertRule,
    event: SIEMEvent
  ): Promise<boolean> {
    const conditions = rule.conditions;
    if (!conditions || !conditions.pattern) {
      return false;
    }

    // Check if event matches pattern
    const pattern = conditions.pattern;
    
    // Simple pattern matching - can be extended with regex or more complex patterns
    if (pattern.eventType && event.eventType !== pattern.eventType) {
      return false;
    }
    if (pattern.sourceSystem && event.sourceSystem !== pattern.sourceSystem) {
      return false;
    }
    if (pattern.severity && event.severity !== pattern.severity) {
      return false;
    }
    
    return true;
  }

  /**
   * Check anomaly-based rule
   */
  private static async checkAnomalyRule(
    rule: AlertRule,
    event: SIEMEvent
  ): Promise<boolean> {
    // Simplified anomaly detection - can be extended with ML models
    const conditions = rule.conditions;
    if (!conditions || !conditions.baseline) {
      return false;
    }

    // Check if event deviates from baseline
    // This is a placeholder - real implementation would use statistical analysis
    const baseline = conditions.baseline;
    const deviation = conditions.deviationThreshold || 2; // 2 standard deviations

    // For now, return false - would need historical data analysis
    return false;
  }

  /**
   * Build event filter conditions for queries
   */
  private static buildEventFilterConditions(filters: Record<string, any>): any[] {
    const conditions: any[] = [];
    
    if (filters.eventTypes) {
      conditions.push(sql`${siemEvents.eventType} = ANY(${filters.eventTypes})`);
    }
    if (filters.severities) {
      conditions.push(sql`${siemEvents.severity} = ANY(${filters.severities})`);
    }
    
    return conditions;
  }

  /**
   * Check if events match correlation pattern
   */
  private static matchesCorrelationPattern(
    events: SIEMEvent[],
    pattern: any,
    currentEvent: SIEMEvent
  ): boolean {
    // Simplified correlation - check if required event types exist
    if (pattern.requiredEvents) {
      const eventTypes = events.map(e => e.eventType);
      for (const requiredType of pattern.requiredEvents) {
        if (!eventTypes.includes(requiredType)) {
          return false;
        }
      }
    }
    
    return true;
  }

  /**
   * Create alert
   */
  private static async createAlert(
    organizationId: string,
    rule: AlertRule,
    event: SIEMEvent
  ): Promise<RealTimeAlert> {
    try {
      const alertId = this.generateAlertId();
      
      // Replace placeholders in alert message
      const message = this.replaceAlertPlaceholders(rule.alertMessage, event);
      const title = this.replaceAlertPlaceholders(rule.alertTitle, event);

      const [alert] = await db
        .insert(realTimeAlerts)
        .values({
          organizationId,
          alertRuleId: rule.id,
          alertId,
          severity: rule.alertSeverity,
          status: 'active',
          title,
          message,
          triggeredBy: event.eventId,
          relatedEvents: [event.eventId],
          notificationsSent: [],
          escalationLevel: 0,
          tags: rule.tags,
          metadata: {
            ruleName: rule.name,
            eventType: event.eventType,
            sourceSystem: event.sourceSystem,
          },
        })
        .returning();

      // Send notifications
      await this.sendAlertNotifications(alert, rule);

      // Update event to mark as alerted
      await db
        .update(siemEvents)
        .set({
          isAlerted: true,
          alertIds: sql`array_append(${siemEvents.alertIds}, ${alertId})`,
        })
        .where(eq(siemEvents.id, event.id));

      return alert;
    } catch (error) {
      console.error('Error creating alert:', error);
      throw new Error('Failed to create alert');
    }
  }

  /**
   * Replace placeholders in alert message
   */
  private static replaceAlertPlaceholders(
    template: string,
    event: SIEMEvent
  ): string {
    return template
      .replace(/\{eventType\}/g, event.eventType)
      .replace(/\{eventAction\}/g, event.eventAction)
      .replace(/\{severity\}/g, event.severity)
      .replace(/\{sourceSystem\}/g, event.sourceSystem)
      .replace(/\{sourceUser\}/g, event.sourceUser || 'unknown')
      .replace(/\{sourceIp\}/g, event.sourceIp || 'unknown')
      .replace(/\{timestamp\}/g, event.timestamp.toISOString());
  }

  /**
   * Send alert notifications
   */
  private static async sendAlertNotifications(
    alert: RealTimeAlert,
    rule: AlertRule
  ): Promise<void> {
    const notifications: any[] = [];

    for (const channel of rule.alertChannels) {
      try {
        const notification = await this.sendNotification(channel, alert, rule);
        notifications.push({
          channel,
          sentAt: new Date(),
          status: 'success',
          ...notification,
        });
      } catch (error) {
        notifications.push({
          channel,
          sentAt: new Date(),
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    // Update alert with notification status
    await db
      .update(realTimeAlerts)
      .set({
        notificationsSent: notifications,
      })
      .where(eq(realTimeAlerts.id, alert.id));
  }

  /**
   * Send notification via channel
   */
  private static async sendNotification(
    channel: string,
    alert: RealTimeAlert,
    rule: AlertRule
  ): Promise<any> {
    switch (channel) {
      case 'email':
        return await this.sendEmailNotification(alert, rule);
      case 'slack':
        return await this.sendSlackNotification(alert, rule);
      case 'pagerduty':
        return await this.sendPagerDutyNotification(alert, rule);
      case 'sms':
        return await this.sendSMSNotification(alert, rule);
      default:
        throw new Error(`Unknown notification channel: ${channel}`);
    }
  }

  /**
   * Send email notification
   */
  private static async sendEmailNotification(
    alert: RealTimeAlert,
    rule: AlertRule
  ): Promise<any> {
    // Use NotificationService to send email
    for (const recipient of rule.alertRecipients) {
      await NotificationService.sendEmail({
        to: recipient.includes('@') ? recipient : `${recipient}@example.com`, // TODO: Get actual email
        subject: alert.title,
        body: alert.message,
        priority: alert.severity === 'critical' ? 'high' : 'normal',
      });
    }
    
    return { method: 'email', recipients: rule.alertRecipients };
  }

  /**
   * Send Slack notification
   */
  private static async sendSlackNotification(
    alert: RealTimeAlert,
    rule: AlertRule
  ): Promise<any> {
    // TODO: Implement Slack webhook integration
    console.log('Slack notification:', alert.title, alert.message);
    return { method: 'slack' };
  }

  /**
   * Send PagerDuty notification
   */
  private static async sendPagerDutyNotification(
    alert: RealTimeAlert,
    rule: AlertRule
  ): Promise<any> {
    // TODO: Implement PagerDuty API integration
    console.log('PagerDuty notification:', alert.title, alert.message);
    return { method: 'pagerduty' };
  }

  /**
   * Send SMS notification
   */
  private static async sendSMSNotification(
    alert: RealTimeAlert,
    rule: AlertRule
  ): Promise<any> {
    // TODO: Implement SMS integration
    console.log('SMS notification:', alert.title, alert.message);
    return { method: 'sms' };
  }

  /**
   * Create alert rule
   */
  static async createAlertRule(
    organizationId: string,
    rule: {
      createdBy?: string;
      name: string;
      description?: string;
      ruleType: 'threshold' | 'anomaly' | 'correlation' | 'pattern' | 'machine_learning' | 'custom';
      conditions: any;
      eventFilters?: Record<string, any>;
      threshold?: number;
      timeWindow?: number;
      alertSeverity: 'low' | 'medium' | 'high' | 'critical';
      alertTitle: string;
      alertMessage: string;
      alertChannels?: string[];
      alertRecipients?: string[];
      escalationPolicy?: Record<string, any>;
      cooldownPeriod?: number;
      tags?: string[];
      metadata?: Record<string, any>;
    }
  ): Promise<AlertRule> {
    try {
      const [newRule] = await db
        .insert(alertRules)
        .values({
          organizationId,
          createdBy: rule.createdBy,
          name: rule.name,
          description: rule.description,
          ruleType: rule.ruleType,
          isActive: true,
          priority: 0,
          conditions: rule.conditions,
          eventFilters: rule.eventFilters || {},
          threshold: rule.threshold,
          timeWindow: rule.timeWindow,
          alertSeverity: rule.alertSeverity,
          alertTitle: rule.alertTitle,
          alertMessage: rule.alertMessage,
          alertChannels: rule.alertChannels || ['email'],
          alertRecipients: rule.alertRecipients || [],
          escalationPolicy: rule.escalationPolicy || {},
          cooldownPeriod: rule.cooldownPeriod || 300,
          tags: rule.tags || [],
          metadata: rule.metadata || {},
        })
        .returning();

      return newRule;
    } catch (error) {
      console.error('Error creating alert rule:', error);
      throw new Error('Failed to create alert rule');
    }
  }

  /**
   * Get alerts
   */
  static async getAlerts(
    organizationId: string,
    filters?: {
      status?: string;
      severity?: string;
      dateFrom?: Date;
      dateTo?: Date;
      limit?: number;
      offset?: number;
    }
  ): Promise<RealTimeAlert[]> {
    try {
      const conditions: any[] = [eq(realTimeAlerts.organizationId, organizationId)];

      if (filters?.status) {
        conditions.push(eq(realTimeAlerts.status, filters.status));
      }
      if (filters?.severity) {
        conditions.push(eq(realTimeAlerts.severity, filters.severity as any));
      }
      if (filters?.dateFrom) {
        conditions.push(gte(realTimeAlerts.triggeredAt, filters.dateFrom));
      }
      if (filters?.dateTo) {
        conditions.push(lte(realTimeAlerts.triggeredAt, filters.dateTo));
      }

      const alerts = await db
        .select()
        .from(realTimeAlerts)
        .where(and(...conditions))
        .orderBy(desc(realTimeAlerts.triggeredAt))
        .limit(filters?.limit || 100)
        .offset(filters?.offset || 0);

      return alerts;
    } catch (error) {
      console.error('Error getting alerts:', error);
      throw new Error('Failed to get alerts');
    }
  }

  /**
   * Acknowledge alert
   */
  static async acknowledgeAlert(
    alertId: number,
    userId: string
  ): Promise<void> {
    try {
      await db
        .update(realTimeAlerts)
        .set({
          status: 'acknowledged',
          acknowledgedBy: userId,
          acknowledgedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(realTimeAlerts.id, alertId));
    } catch (error) {
      console.error('Error acknowledging alert:', error);
      throw new Error('Failed to acknowledge alert');
    }
  }

  /**
   * Resolve alert
   */
  static async resolveAlert(
    alertId: number,
    userId: string,
    resolutionNotes?: string
  ): Promise<void> {
    try {
      await db
        .update(realTimeAlerts)
        .set({
          status: 'resolved',
          resolvedBy: userId,
          resolvedAt: new Date(),
          resolutionNotes,
          updatedAt: new Date(),
        })
        .where(eq(realTimeAlerts.id, alertId));
    } catch (error) {
      console.error('Error resolving alert:', error);
      throw new Error('Failed to resolve alert');
    }
  }
}

