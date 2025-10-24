import { db } from '@/lib/db';
import {
  systemMetrics,
  performanceMetrics,
  businessMetrics,
  alertRules,
  alertHistory
} from '@/lib/db/schemas';
import { eq, and, desc, sql, gte, lte } from 'drizzle-orm';
import * as Sentry from '@sentry/nextjs';

export interface MetricValue {
  value: number | string | boolean;
  unit?: string;
  labels?: Record<string, string>;
  tags?: Record<string, any>;
}

export interface PerformanceMetric {
  endpoint: string;
  method?: string;
  statusCode?: number;
  responseTime: number;
  memoryUsage?: number;
  cpuUsage?: number;
  dbQueryTime?: number;
  dbQueryCount?: number;
  cacheHitRate?: number;
  cacheSize?: number;
  userAgent?: string;
  ipAddress?: string;
  sessionId?: string;
  labels?: Record<string, string>;
  metadata?: Record<string, any>;
}

export interface BusinessMetric {
  metricName: string;
  metricType: 'revenue' | 'expense' | 'count' | 'ratio';
  value: number;
  currency?: string;
  unit?: string;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  periodStart: Date;
  periodEnd: Date;
  labels?: Record<string, string>;
  tags?: Record<string, any>;
}

export class MetricsCollector {
  /**
   * Record a system metric
   */
  static async recordSystemMetric(
    metricName: string,
    metricType: 'counter' | 'gauge' | 'histogram' | 'summary',
    value: MetricValue,
    category: 'performance' | 'business' | 'system' | 'user',
    userId?: string,
    organizationId?: string
  ): Promise<void> {
    try {
      await db.insert(systemMetrics).values({
        userId,
        organizationId,
        metricName,
        metricType,
        category,
        value: JSON.stringify(value.value),
        unit: value.unit,
        labels: value.labels || {},
        tags: value.tags || {},
      });

      // Check for alerts
      await this.checkAlerts(metricName, value.value, userId, organizationId);

    } catch (error) {
      console.error('Failed to record system metric:', error);
      Sentry.captureException(error);
    }
  }

  /**
   * Record a performance metric
   */
  static async recordPerformanceMetric(
    metric: PerformanceMetric,
    userId?: string,
    organizationId?: string
  ): Promise<void> {
    try {
      await db.insert(performanceMetrics).values({
        userId,
        organizationId,
        endpoint: metric.endpoint,
        method: metric.method,
        statusCode: metric.statusCode,
        responseTime: metric.responseTime,
        memoryUsage: metric.memoryUsage,
        cpuUsage: metric.cpuUsage,
        dbQueryTime: metric.dbQueryTime,
        dbQueryCount: metric.dbQueryCount,
        cacheHitRate: metric.cacheHitRate,
        cacheSize: metric.cacheSize,
        userAgent: metric.userAgent,
        ipAddress: metric.ipAddress,
        sessionId: metric.sessionId,
        labels: metric.labels || {},
        metadata: metric.metadata || {},
      });

      // Record system metrics for alerting
      await this.recordSystemMetric(
        'api_response_time',
        'histogram',
        { value: metric.responseTime, unit: 'ms' },
        'performance',
        userId,
        organizationId
      );

    } catch (error) {
      console.error('Failed to record performance metric:', error);
      Sentry.captureException(error);
    }
  }

  /**
   * Record a business metric
   */
  static async recordBusinessMetric(
    metric: BusinessMetric,
    userId: string,
    organizationId?: string
  ): Promise<void> {
    try {
      await db.insert(businessMetrics).values({
        userId,
        organizationId,
        metricName: metric.metricName,
        metricType: metric.metricType,
        value: JSON.stringify(metric.value),
        currency: metric.currency,
        unit: metric.unit,
        period: metric.period,
        periodStart: metric.periodStart,
        periodEnd: metric.periodEnd,
        labels: metric.labels || {},
        tags: metric.tags || {},
      });

      // Record system metrics for alerting
      await this.recordSystemMetric(
        metric.metricName,
        'gauge',
        { value: metric.value, unit: metric.unit },
        'business',
        userId,
        organizationId
      );

    } catch (error) {
      console.error('Failed to record business metric:', error);
      Sentry.captureException(error);
    }
  }

  /**
   * Record API response time
   */
  static async recordApiResponseTime(
    endpoint: string,
    method: string,
    responseTime: number,
    statusCode: number,
    userId?: string,
    organizationId?: string
  ): Promise<void> {
    await this.recordPerformanceMetric({
      endpoint,
      method,
      statusCode,
      responseTime,
    }, userId, organizationId);
  }

  /**
   * Record workflow execution metrics
   */
  static async recordWorkflowExecution(
    workflowId: number,
    executionTime: number,
    success: boolean,
    userId: string,
    organizationId?: string
  ): Promise<void> {
    await this.recordSystemMetric(
      'workflow_execution_time',
      'histogram',
      { value: executionTime, unit: 'ms' },
      'performance',
      userId,
      organizationId
    );

    await this.recordSystemMetric(
      'workflow_execution_success',
      'counter',
      { value: success ? 1 : 0, unit: 'count' },
      'business',
      userId,
      organizationId
    );
  }

  /**
   * Record webhook delivery metrics
   */
  static async recordWebhookDelivery(
    webhookId: number,
    deliveryTime: number,
    success: boolean,
    httpStatus: number,
    userId: string,
    organizationId?: string
  ): Promise<void> {
    await this.recordSystemMetric(
      'webhook_delivery_time',
      'histogram',
      { value: deliveryTime, unit: 'ms' },
      'performance',
      userId,
      organizationId
    );

    await this.recordSystemMetric(
      'webhook_delivery_success',
      'counter',
      { value: success ? 1 : 0, unit: 'count' },
      'business',
      userId,
      organizationId
    );
  }

  /**
   * Record integration sync metrics
   */
  static async recordIntegrationSync(
    integrationId: number,
    syncTime: number,
    recordsProcessed: number,
    success: boolean,
    userId: string,
    organizationId?: string
  ): Promise<void> {
    await this.recordSystemMetric(
      'integration_sync_time',
      'histogram',
      { value: syncTime, unit: 'ms' },
      'performance',
      userId,
      organizationId
    );

    await this.recordSystemMetric(
      'integration_sync_records',
      'counter',
      { value: recordsProcessed, unit: 'count' },
      'business',
      userId,
      organizationId
    );
  }

  /**
   * Record revenue metrics
   */
  static async recordRevenue(
    amount: number,
    currency: string,
    period: 'daily' | 'weekly' | 'monthly' | 'yearly',
    periodStart: Date,
    periodEnd: Date,
    userId: string,
    organizationId?: string
  ): Promise<void> {
    await this.recordBusinessMetric({
      metricName: 'revenue',
      metricType: 'revenue',
      value: amount,
      currency,
      period,
      periodStart,
      periodEnd,
    }, userId, organizationId);
  }

  /**
   * Record expense metrics
   */
  static async recordExpense(
    amount: number,
    currency: string,
    period: 'daily' | 'weekly' | 'monthly' | 'yearly',
    periodStart: Date,
    periodEnd: Date,
    userId: string,
    organizationId?: string
  ): Promise<void> {
    await this.recordBusinessMetric({
      metricName: 'expenses',
      metricType: 'expense',
      value: amount,
      currency,
      period,
      periodStart,
      periodEnd,
    }, userId, organizationId);
  }

  /**
   * Record invoice metrics
   */
  static async recordInvoiceMetrics(
    invoiceCount: number,
    totalAmount: number,
    currency: string,
    period: 'daily' | 'weekly' | 'monthly' | 'yearly',
    periodStart: Date,
    periodEnd: Date,
    userId: string,
    organizationId?: string
  ): Promise<void> {
    await this.recordBusinessMetric({
      metricName: 'invoice_count',
      metricType: 'count',
      value: invoiceCount,
      unit: 'count',
      period,
      periodStart,
      periodEnd,
    }, userId, organizationId);

    await this.recordBusinessMetric({
      metricName: 'invoice_amount',
      metricType: 'revenue',
      value: totalAmount,
      currency,
      period,
      periodStart,
      periodEnd,
    }, userId, organizationId);
  }

  /**
   * Check for alerts
   */
  private static async checkAlerts(
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
      Sentry.captureException(error);
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

      // Create alert record
      await db.insert(alertHistory).values({
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
      });

      // Send notifications (this would integrate with notification service)
      console.log(`Alert triggered: ${rule.name} - ${rule.metricName} = ${value}`);

    } catch (error) {
      console.error('Failed to trigger alert:', error);
      Sentry.captureException(error);
    }
  }

  /**
   * Get metrics for dashboard
   */
  static async getMetrics(
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

    // Get system metrics
    const systemMetricsData = await db
      .select()
      .from(systemMetrics)
      .where(and(
        eq(systemMetrics.userId, userId),
        gte(systemMetrics.timestamp, startTime)
      ))
      .orderBy(desc(systemMetrics.timestamp));

    // Get performance metrics
    const performanceMetricsData = await db
      .select()
      .from(performanceMetrics)
      .where(and(
        eq(performanceMetrics.userId, userId),
        gte(performanceMetrics.timestamp, startTime)
      ))
      .orderBy(desc(performanceMetrics.timestamp));

    // Get business metrics
    const businessMetricsData = await db
      .select()
      .from(businessMetrics)
      .where(and(
        eq(businessMetrics.userId, userId),
        gte(businessMetrics.timestamp, startTime)
      ))
      .orderBy(desc(businessMetrics.timestamp));

    return {
      system: systemMetricsData,
      performance: performanceMetricsData,
      business: businessMetricsData,
    };
  }

  /**
   * Get alert rules for user
   */
  static async getAlertRules(userId: string, organizationId?: string): Promise<any[]> {
    return await db
      .select()
      .from(alertRules)
      .where(and(
        eq(alertRules.userId, userId),
        organizationId ? eq(alertRules.organizationId, organizationId) : undefined
      ))
      .orderBy(desc(alertRules.createdAt));
  }

  /**
   * Get alert history for user
   */
  static async getAlertHistory(
    userId: string,
    organizationId?: string,
    limit: number = 50
  ): Promise<any[]> {
    return await db
      .select()
      .from(alertHistory)
      .where(and(
        eq(alertHistory.userId, userId),
        organizationId ? eq(alertHistory.organizationId, organizationId) : undefined
      ))
      .orderBy(desc(alertHistory.triggeredAt))
      .limit(limit);
  }
}
