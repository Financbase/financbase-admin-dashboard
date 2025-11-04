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
  alertHistory,
  systemMetrics
} from '@/lib/db/schemas';
import { eq, and, desc, gte, lte, sql } from 'drizzle-orm';
import { NotificationService } from './notification-service';
import { WebhookService } from './webhook-service';

export interface AlertRule {
  id: number;
  name: string;
  description: string;
  metricName: string;
  condition: 'greater_than' | 'less_than' | 'equals' | 'not_equals';
  threshold: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  channels: string[];
  cooldownPeriod: number;
  maxAlertsPerHour: number;
  labels: Record<string, string>;
  filters: Record<string, any>;
}

export interface Alert {
  id: number;
  ruleId: number;
  status: 'triggered' | 'resolved' | 'acknowledged';
  severity: string;
  message: string;
  metricValue: any;
  threshold: string;
  triggeredAt: Date;
  acknowledgedAt?: Date;
  resolvedAt?: Date;
}

export interface AlertNotification {
  channel: string;
  recipient: string;
  message: string;
  severity: string;
  metadata: Record<string, any>;
}

export class AlertService {
  /**
   * Create a new alert rule
   */
  static async createAlertRule(
    userId: string,
    organizationId: string | undefined,
    rule: Omit<AlertRule, 'id'>
  ): Promise<AlertRule> {
    const newRule = await db.insert(alertRules).values({
      userId,
      organizationId,
      name: rule.name,
      description: rule.description,
      metricName: rule.metricName,
      condition: rule.condition,
      threshold: rule.threshold,
      severity: rule.severity,
      channels: rule.channels,
      cooldownPeriod: rule.cooldownPeriod,
      maxAlertsPerHour: rule.maxAlertsPerHour,
      labels: rule.labels,
      filters: rule.filters,
    }).returning();

    return newRule[0];
  }

  /**
   * Update an alert rule
   */
  static async updateAlertRule(
    ruleId: number,
    userId: string,
    updates: Partial<AlertRule>
  ): Promise<AlertRule> {
    const updatedRule = await db
      .update(alertRules)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(and(eq(alertRules.id, ruleId), eq(alertRules.userId, userId)))
      .returning();

    if (updatedRule.length === 0) {
      throw new Error('Alert rule not found');
    }

    return updatedRule[0];
  }

  /**
   * Delete an alert rule
   */
  static async deleteAlertRule(ruleId: number, userId: string): Promise<boolean> {
    const deleted = await db
      .delete(alertRules)
      .where(and(eq(alertRules.id, ruleId), eq(alertRules.userId, userId)))
      .returning();

    return deleted.length > 0;
  }

  /**
   * Get alert rules for user
   */
  static async getAlertRules(
    userId: string,
    organizationId?: string
  ): Promise<AlertRule[]> {
    const rules = await db
      .select()
      .from(alertRules)
      .where(and(
        eq(alertRules.userId, userId),
        organizationId ? eq(alertRules.organizationId, organizationId) : undefined
      ))
      .orderBy(desc(alertRules.createdAt));

    return rules;
  }

  /**
   * Get alert history for user
   */
  static async getAlertHistory(
    userId: string,
    organizationId?: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<Alert[]> {
    const alerts = await db
      .select()
      .from(alertHistory)
      .where(and(
        eq(alertHistory.userId, userId),
        organizationId ? eq(alertHistory.organizationId, organizationId) : undefined
      ))
      .orderBy(desc(alertHistory.triggeredAt))
      .limit(limit)
      .offset(offset);

    return alerts;
  }

  /**
   * Acknowledge an alert
   */
  static async acknowledgeAlert(
    alertId: number,
    userId: string,
    acknowledgedBy: string
  ): Promise<boolean> {
    const updated = await db
      .update(alertHistory)
      .set({
        status: 'acknowledged',
        acknowledgedBy,
        acknowledgedAt: new Date(),
      })
      .where(and(
        eq(alertHistory.id, alertId),
        eq(alertHistory.userId, userId)
      ))
      .returning();

    return updated.length > 0;
  }

  /**
   * Resolve an alert
   */
  static async resolveAlert(
    alertId: number,
    userId: string,
    resolution: string
  ): Promise<boolean> {
    const updated = await db
      .update(alertHistory)
      .set({
        status: 'resolved',
        resolvedAt: new Date(),
        resolution,
      })
      .where(and(
        eq(alertHistory.id, alertId),
        eq(alertHistory.userId, userId)
      ))
      .returning();

    return updated.length > 0;
  }

  /**
   * Check for alerts based on metric data
   */
  static async checkAlerts(
    metricName: string,
    value: any,
    userId?: string,
    organizationId?: string
  ): Promise<void> {
    try {
      // Get active alert rules for this metric
      const rules = await db
        .select()
        .from(alertRules)
        .where(and(
          eq(alertRules.metricName, metricName),
          eq(alertRules.isActive, true)
        ));

      for (const rule of rules) {
        // Check if rule applies to this user/organization
        if (rule.userId !== userId && rule.organizationId !== organizationId) {
          continue;
        }

        // Check if alert condition is met
        const shouldAlert = this.evaluateCondition(value, rule.condition, rule.threshold);
        
        if (shouldAlert) {
          await this.triggerAlert(rule, value, userId, organizationId);
        }
      }
    } catch (error) {
      console.error('Failed to check alerts:', error);
    }
  }

  /**
   * Evaluate alert condition
   */
  private static evaluateCondition(
    value: any,
    condition: string,
    threshold: string
  ): boolean {
    const numValue = Number(value);
    const numThreshold = Number(threshold);

    switch (condition) {
      case 'greater_than':
        return numValue > numThreshold;
      case 'less_than':
        return numValue < numThreshold;
      case 'equals':
        return numValue === numThreshold;
      case 'not_equals':
        return numValue !== numThreshold;
      default:
        return false;
    }
  }

  /**
   * Trigger an alert
   */
  private static async triggerAlert(
    rule: any,
    value: any,
    userId?: string,
    organizationId?: string
  ): Promise<void> {
    try {
      // Check if alert was recently triggered (cooldown)
      const recentAlert = await db
        .select()
        .from(alertHistory)
        .where(and(
          eq(alertHistory.ruleId, rule.id),
          eq(alertHistory.status, 'triggered'),
          gte(alertHistory.triggeredAt, new Date(Date.now() - rule.cooldownPeriod * 1000))
        ))
        .limit(1);

      if (recentAlert.length > 0) {
        return; // Still in cooldown period
      }

      // Check hourly alert limit
      const hourlyAlerts = await db
        .select()
        .from(alertHistory)
        .where(and(
          eq(alertHistory.ruleId, rule.id),
          gte(alertHistory.triggeredAt, new Date(Date.now() - 60 * 60 * 1000))
        ));

      if (hourlyAlerts.length >= rule.maxAlertsPerHour) {
        return; // Hourly limit reached
      }

      // Create alert record
      const alert = await db.insert(alertHistory).values({
        ruleId: rule.id,
        userId: userId || '',
        organizationId,
        status: 'triggered',
        severity: rule.severity,
        message: `Alert: ${rule.name} - ${rule.metricName} ${rule.condition} ${rule.threshold}`,
        metricValue: JSON.stringify(value),
        threshold: rule.threshold,
        labels: rule.labels,
        notificationsSent: [],
      }).returning();

      // Send notifications
      await this.sendAlertNotifications(alert[0], rule, value);

    } catch (error) {
      console.error('Failed to trigger alert:', error);
    }
  }

  /**
   * Send alert notifications
   */
  private static async sendAlertNotifications(
    alert: any,
    rule: any,
    value: any
  ): Promise<void> {
    const notifications: AlertNotification[] = [];

    for (const channel of rule.channels) {
      switch (channel) {
        case 'email':
          notifications.push({
            channel: 'email',
            recipient: rule.userId, // In real implementation, get user email
            message: `Alert: ${rule.name}\n\nMetric: ${rule.metricName}\nValue: ${value}\nThreshold: ${rule.threshold}\nSeverity: ${rule.severity}`,
            severity: rule.severity,
            metadata: { alertId: alert.id, ruleId: rule.id },
          });
          break;

        case 'slack':
          notifications.push({
            channel: 'slack',
            recipient: rule.userId, // In real implementation, get Slack webhook
            message: `🚨 Alert: ${rule.name}\n\n*Metric:* ${rule.metricName}\n*Value:* ${value}\n*Threshold:* ${rule.threshold}\n*Severity:* ${rule.severity}`,
            severity: rule.severity,
            metadata: { alertId: alert.id, ruleId: rule.id },
          });
          break;

        case 'webhook':
          notifications.push({
            channel: 'webhook',
            recipient: rule.userId, // In real implementation, get webhook URL
            message: JSON.stringify({
              alert: {
                id: alert.id,
                name: rule.name,
                metric: rule.metricName,
                value,
                threshold: rule.threshold,
                severity: rule.severity,
                triggeredAt: alert.triggeredAt,
              },
            }),
            severity: rule.severity,
            metadata: { alertId: alert.id, ruleId: rule.id },
          });
          break;
      }
    }

    // Send notifications
    for (const notification of notifications) {
      try {
        await this.sendNotification(notification);
      } catch (error) {
        console.error('Failed to send notification:', error);
      }
    }

    // Update alert with sent notifications
    await db
      .update(alertHistory)
      .set({
        notificationsSent: notifications.map(n => ({
          channel: n.channel,
          sentAt: new Date(),
          status: 'sent',
        })),
      })
      .where(eq(alertHistory.id, alert.id));
  }

  /**
   * Send individual notification
   */
  private static async sendNotification(notification: AlertNotification): Promise<void> {
    switch (notification.channel) {
      case 'email':
        await NotificationService.create({
          userId: notification.recipient,
          type: 'alert',
          title: 'System Alert',
          message: notification.message,
          priority: notification.severity === 'critical' ? 'high' : 'normal',
          data: notification.metadata,
        });
        break;

      case 'slack':
        // In real implementation, send to Slack webhook
        console.log('Slack notification:', notification.message);
        break;

      case 'webhook':
        // In real implementation, send to webhook URL
        console.log('Webhook notification:', notification.message);
        break;
    }
  }

  /**
   * Get alert statistics
   */
  static async getAlertStatistics(
    userId: string,
    organizationId?: string,
    timeRange: '1h' | '24h' | '7d' | '30d' = '24h'
  ): Promise<any> {
    const timeRanges = {
      '1h': 1 * 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
    };

    const startTime = new Date(Date.now() - timeRanges[timeRange]);

    // Get alert counts by status
    const alertCounts = await db
      .select({
        status: alertHistory.status,
        count: sql<number>`count(*)`,
      })
      .from(alertHistory)
      .where(and(
        eq(alertHistory.userId, userId),
        organizationId ? eq(alertHistory.organizationId, organizationId) : undefined,
        gte(alertHistory.triggeredAt, startTime)
      ))
      .groupBy(alertHistory.status);

    // Get alert counts by severity
    const severityCounts = await db
      .select({
        severity: alertHistory.severity,
        count: sql<number>`count(*)`,
      })
      .from(alertHistory)
      .where(and(
        eq(alertHistory.userId, userId),
        organizationId ? eq(alertHistory.organizationId, organizationId) : undefined,
        gte(alertHistory.triggeredAt, startTime)
      ))
      .groupBy(alertHistory.severity);

    // Get active alerts
    const activeAlerts = await db
      .select()
      .from(alertHistory)
      .where(and(
        eq(alertHistory.userId, userId),
        organizationId ? eq(alertHistory.organizationId, organizationId) : undefined,
        eq(alertHistory.status, 'triggered')
      ))
      .orderBy(desc(alertHistory.triggeredAt));

    return {
      alertCounts,
      severityCounts,
      activeAlerts,
      totalAlerts: alertCounts.reduce((sum, item) => sum + item.count, 0),
    };
  }

  /**
   * Get alert trends
   */
  static async getAlertTrends(
    userId: string,
    organizationId?: string,
    days: number = 7
  ): Promise<any[]> {
    const startTime = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const trends = await db
      .select({
        date: sql<string>`DATE(triggered_at)`,
        count: sql<number>`count(*)`,
        severity: alertHistory.severity,
      })
      .from(alertHistory)
      .where(and(
        eq(alertHistory.userId, userId),
        organizationId ? eq(alertHistory.organizationId, organizationId) : undefined,
        gte(alertHistory.triggeredAt, startTime)
      ))
      .groupBy(sql`DATE(triggered_at)`, alertHistory.severity)
      .orderBy(sql`DATE(triggered_at)`);

    return trends;
  }
}
