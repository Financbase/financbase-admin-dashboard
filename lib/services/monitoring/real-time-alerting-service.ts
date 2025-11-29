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
  users,
} from '@/lib/db/schemas';
import { eq, and, desc, gte, lte, sql, or } from 'drizzle-orm';
import { NotificationService } from '@/lib/services/notification-service';
import { SIEMEvent } from './siem-integration-service';
import { clerkClient } from '@clerk/nextjs/server';

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
   * Resolve email address from recipient identifier
   * Recipients can be:
   * - Direct email addresses (contains @)
   * - Clerk user IDs (starts with user_)
   * - Database user IDs (UUID format)
   */
  private static async resolveEmailAddress(recipient: string): Promise<string | null> {
    // If already an email address, return it
    if (recipient.includes('@')) {
      return recipient;
    }

    try {
      // Try to find user in database by Clerk ID
      const user = await db
        .select({ email: users.email })
        .from(users)
        .where(
          and(
            eq(users.clerkId, recipient),
            eq(users.isActive, true)
          )
        )
        .limit(1);

      if (user.length > 0 && user[0].email) {
        return user[0].email;
      }

      // If not found in database, try Clerk API (for Clerk user IDs)
      if (recipient.startsWith('user_')) {
        try {
          const clerk = await clerkClient();
          const clerkUser = await clerk.users.getUser(recipient);
          const email = clerkUser.emailAddresses[0]?.emailAddress;
          if (email) {
            return email;
          }
        } catch (clerkError) {
          console.warn(`[AlertingService] Failed to fetch email from Clerk for ${recipient}:`, clerkError);
        }
      }

      // If recipient is a UUID, try to find by database user ID
      const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (uuidPattern.test(recipient)) {
        const userById = await db
          .select({ email: users.email })
          .from(users)
          .where(
            and(
              eq(users.id, recipient),
              eq(users.isActive, true)
            )
          )
          .limit(1);

        if (userById.length > 0 && userById[0].email) {
          return userById[0].email;
        }
      }

      return null;
    } catch (error) {
      console.error(`[AlertingService] Error resolving email for recipient ${recipient}:`, error);
      return null;
    }
  }

  /**
   * Send email notification
   */
  private static async sendEmailNotification(
    alert: RealTimeAlert,
    rule: AlertRule
  ): Promise<any> {
    const resolvedRecipients: string[] = [];
    const failedRecipients: string[] = [];

    // Resolve email addresses for all recipients
    for (const recipient of rule.alertRecipients) {
      const email = await this.resolveEmailAddress(recipient);
      
      if (email) {
        try {
          await NotificationService.sendEmail({
            to: email,
            subject: alert.title,
            body: alert.message,
            priority: alert.severity === 'critical' ? 'high' : 'normal',
          });
          resolvedRecipients.push(email);
        } catch (error) {
          console.error(`[AlertingService] Failed to send email to ${email}:`, error);
          failedRecipients.push(recipient);
        }
      } else {
        console.warn(`[AlertingService] Could not resolve email address for recipient: ${recipient}`);
        failedRecipients.push(recipient);
      }
    }
    
    return { 
      method: 'email', 
      recipients: resolvedRecipients,
      failedRecipients: failedRecipients.length > 0 ? failedRecipients : undefined,
    };
  }

  /**
   * Send Slack notification
   */
  private static async sendSlackNotification(
    alert: RealTimeAlert,
    rule: AlertRule
  ): Promise<any> {
    const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL || rule.metadata?.slackWebhookUrl;
    
    if (!slackWebhookUrl) {
      console.warn('[AlertingService] Slack webhook URL not configured');
      return { method: 'slack', error: 'Webhook URL not configured' };
    }

    try {
      // Format Slack message with alert details
      const slackMessage = {
        text: alert.title,
        blocks: [
          {
            type: 'header',
            text: {
              type: 'plain_text',
              text: alert.title,
              emoji: true,
            },
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: alert.message,
            },
          },
          {
            type: 'context',
            elements: [
              {
                type: 'mrkdwn',
                text: `*Severity:* ${alert.severity.toUpperCase()} | *Status:* ${alert.status} | *Triggered:* <!date^${Math.floor(alert.triggeredAt.getTime() / 1000)}^{date_short_pretty} at {time}|${alert.triggeredAt.toISOString()}>`,
              },
            ],
          },
        ],
        attachments: [
          {
            color: alert.severity === 'critical' ? '#ff0000' : 
                   alert.severity === 'high' ? '#ff9900' :
                   alert.severity === 'medium' ? '#ffcc00' : '#36a64f',
            fields: [
              {
                title: 'Alert ID',
                value: alert.alertId,
                short: true,
              },
              {
                title: 'Organization',
                value: alert.organizationId,
                short: true,
              },
            ],
          },
        ],
      };

      // Send to Slack webhook
      const response = await fetch(slackWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(slackMessage),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Slack API error: ${response.status} ${errorText}`);
      }

      const responseText = await response.text();
      return { 
        method: 'slack', 
        success: true,
        response: responseText || 'ok',
      };
    } catch (error) {
      console.error('[AlertingService] Failed to send Slack notification:', error);
      return { 
        method: 'slack', 
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Send PagerDuty notification
   * Uses PagerDuty Events API v2
   */
  private static async sendPagerDutyNotification(
    alert: RealTimeAlert,
    rule: AlertRule
  ): Promise<any> {
    const routingKey = process.env.PAGERDUTY_ROUTING_KEY || rule.metadata?.pagerDutyRoutingKey;
    
    if (!routingKey) {
      console.warn('[AlertingService] PagerDuty routing key not configured');
      return { method: 'pagerduty', error: 'Routing key not configured' };
    }

    try {
      // Map alert severity to PagerDuty severity
      const pagerDutySeverity = 
        alert.severity === 'critical' ? 'critical' :
        alert.severity === 'high' ? 'error' :
        alert.severity === 'medium' ? 'warning' : 'info';

      // Determine event action based on alert status
      const eventAction = 
        alert.status === 'resolved' ? 'resolve' :
        alert.status === 'acknowledged' ? 'acknowledge' : 'trigger';

      // Build PagerDuty event payload
      const pagerDutyEvent = {
        routing_key: routingKey,
        event_action: eventAction,
        dedup_key: alert.alertId, // Use alert ID for deduplication
        payload: {
          summary: alert.title,
          source: 'Financbase Alerting Service',
          severity: pagerDutySeverity,
          timestamp: alert.triggeredAt.toISOString(),
          component: rule.name || 'Alert Rule',
          group: alert.organizationId,
          class: alert.severity,
          custom_details: {
            alertId: alert.alertId,
            message: alert.message,
            status: alert.status,
            severity: alert.severity,
            organizationId: alert.organizationId,
            triggeredAt: alert.triggeredAt.toISOString(),
            relatedEvents: alert.relatedEvents,
            tags: alert.tags,
            metadata: alert.metadata,
          },
        },
      };

      // Send to PagerDuty Events API v2
      const response = await fetch('https://events.pagerduty.com/v2/enqueue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pagerDutyEvent),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`PagerDuty API error: ${response.status} ${errorText}`);
      }

      const responseData = await response.json();
      return { 
        method: 'pagerduty', 
        success: true,
        eventAction,
        dedupKey: responseData.dedup_key || alert.alertId,
        response: responseData,
      };
    } catch (error) {
      console.error('[AlertingService] Failed to send PagerDuty notification:', error);
      return { 
        method: 'pagerduty', 
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Resolve phone number from recipient identifier
   * Similar to email resolution, but for phone numbers
   */
  private static async resolvePhoneNumber(recipient: string): Promise<string | null> {
    // If already a phone number (starts with + or contains digits), return it
    if (/^\+?[1-9]\d{1,14}$/.test(recipient.replace(/[\s\-\(\)]/g, ''))) {
      // Normalize phone number (ensure it starts with +)
      const normalized = recipient.replace(/[\s\-\(\)]/g, '');
      return normalized.startsWith('+') ? normalized : `+${normalized}`;
    }

    try {
      // Try to find user in database by Clerk ID or UUID
      const user = await db
        .select({ 
          phone: users.email, // Note: users table may not have phone, using email as placeholder
          clerkId: users.clerkId,
        })
        .from(users)
        .where(
          and(
            or(
              eq(users.clerkId, recipient),
              eq(users.id, recipient)
            ),
            eq(users.isActive, true)
          )
        )
        .limit(1);

      // If user found, try to get phone from Clerk
      if (user.length > 0 && user[0].clerkId) {
        try {
          const clerk = await clerkClient();
          const clerkUser = await clerk.users.getUser(user[0].clerkId);
          const phone = clerkUser.phoneNumbers[0]?.phoneNumber;
          if (phone) {
            return phone;
          }
        } catch (clerkError) {
          console.warn(`[AlertingService] Failed to fetch phone from Clerk for ${recipient}:`, clerkError);
        }
      }

      return null;
    } catch (error) {
      console.error(`[AlertingService] Error resolving phone for recipient ${recipient}:`, error);
      return null;
    }
  }

  /**
   * Send SMS notification using Twilio
   */
  private static async sendSMSNotification(
    alert: RealTimeAlert,
    rule: AlertRule
  ): Promise<any> {
    const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID || rule.metadata?.twilioAccountSid;
    const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN || rule.metadata?.twilioAuthToken;
    const twilioFromNumber = process.env.TWILIO_FROM_NUMBER || rule.metadata?.twilioFromNumber;
    
    if (!twilioAccountSid || !twilioAuthToken || !twilioFromNumber) {
      console.warn('[AlertingService] Twilio credentials not configured');
      return { method: 'sms', error: 'Twilio credentials not configured' };
    }

    const resolvedRecipients: string[] = [];
    const failedRecipients: string[] = [];

    // Resolve phone numbers and send SMS for all recipients
    for (const recipient of rule.alertRecipients) {
      const phoneNumber = await this.resolvePhoneNumber(recipient);
      
      if (phoneNumber) {
        try {
          // Format SMS message (SMS has 160 character limit, so truncate if needed)
          const smsMessage = `${alert.title}\n\n${alert.message}`.substring(0, 1600); // Twilio supports up to 1600 chars
          
          // Send SMS via Twilio API
          const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`;
          
          const formData = new URLSearchParams();
          formData.append('From', twilioFromNumber);
          formData.append('To', phoneNumber);
          formData.append('Body', smsMessage);

          const response = await fetch(twilioUrl, {
            method: 'POST',
            headers: {
              'Authorization': `Basic ${Buffer.from(`${twilioAccountSid}:${twilioAuthToken}`).toString('base64')}`,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData.toString(),
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Twilio API error: ${response.status} ${errorText}`);
          }

          const responseData = await response.json();
          resolvedRecipients.push(phoneNumber);
        } catch (error) {
          console.error(`[AlertingService] Failed to send SMS to ${phoneNumber}:`, error);
          failedRecipients.push(recipient);
        }
      } else {
        console.warn(`[AlertingService] Could not resolve phone number for recipient: ${recipient}`);
        failedRecipients.push(recipient);
      }
    }
    
    return { 
      method: 'sms', 
      recipients: resolvedRecipients,
      failedRecipients: failedRecipients.length > 0 ? failedRecipients : undefined,
    };
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

