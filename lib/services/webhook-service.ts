import { db } from '@/lib/db';
import {
  webhooks,
  webhookDeliveries,
  webhookEvents,
  webhookEventTypes,
  webhookSubscriptions,
  webhookTestResults
} from '@/lib/db/schemas';
import { eq, and, desc, sql } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import crypto from 'crypto';

export interface WebhookPayload {
  id: string;
  event: string;
  data: Record<string, any>;
  timestamp: string;
  version: string;
}

export interface WebhookDeliveryResult {
  success: boolean;
  httpStatus?: number;
  responseBody?: string;
  responseHeaders?: Record<string, string>;
  duration: number;
  errorMessage?: string;
}

export interface RetryPolicy {
  maxRetries: number;
  retryDelay: number; // milliseconds
  backoffMultiplier: number;
}

export class WebhookService {
  /**
   * Create a new webhook
   */
  static async createWebhook(data: {
    userId: string;
    organizationId?: string;
    name: string;
    description?: string;
    url: string;
    events: string[];
    secret: string;
    retryPolicy?: RetryPolicy;
    headers?: Record<string, string>;
    filters?: Record<string, any>;
    timeout?: number;
  }) {
    const webhook = await db.insert(webhooks).values({
      userId: data.userId,
      organizationId: data.organizationId,
      name: data.name,
      description: data.description,
      url: data.url,
      secret: data.secret,
      events: data.events,
      retryPolicy: data.retryPolicy || {
        maxRetries: 3,
        retryDelay: 1000,
        backoffMultiplier: 2
      },
      headers: data.headers || {},
      filters: data.filters || {},
      timeout: data.timeout || 30000,
    }).returning();

    // Create subscriptions for each event
    for (const eventType of data.events) {
      await db.insert(webhookSubscriptions).values({
        webhookId: webhook[0].id,
        eventType,
        filters: data.filters || {},
        isActive: true,
      });
    }

    return webhook[0];
  }

  /**
   * Update webhook
   */
  static async updateWebhook(
    webhookId: number,
    userId: string,
    updates: Partial<{
      name: string;
      description: string;
      url: string;
      events: string[];
      secret: string;
      retryPolicy: RetryPolicy;
      headers: Record<string, string>;
      filters: Record<string, any>;
      timeout: number;
      isActive: boolean;
    }>
  ) {
    const webhook = await db
      .update(webhooks)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(and(eq(webhooks.id, webhookId), eq(webhooks.userId, userId)))
      .returning();

    if (webhook.length === 0) {
      throw new Error('Webhook not found');
    }

    // Update subscriptions if events changed
    if (updates.events) {
      // Delete existing subscriptions
      await db
        .delete(webhookSubscriptions)
        .where(eq(webhookSubscriptions.webhookId, webhookId));

      // Create new subscriptions
      for (const eventType of updates.events) {
        await db.insert(webhookSubscriptions).values({
          webhookId,
          eventType,
          filters: updates.filters || {},
          isActive: true,
        });
      }
    }

    return webhook[0];
  }

  /**
   * Delete webhook
   */
  static async deleteWebhook(webhookId: number, userId: string) {
    const deleted = await db
      .delete(webhooks)
      .where(and(eq(webhooks.id, webhookId), eq(webhooks.userId, userId)))
      .returning();

    return deleted.length > 0;
  }

  /**
   * Get webhook by ID
   */
  static async getWebhook(webhookId: number, userId: string) {
    const result = await db
      .select()
      .from(webhooks)
      .where(and(eq(webhooks.id, webhookId), eq(webhooks.userId, userId)))
      .limit(1);

    return result[0] || null;
  }

  /**
   * Get all webhooks for user
   */
  static async getUserWebhooks(userId: string, organizationId?: string) {
    let query = db
      .select()
      .from(webhooks)
      .where(eq(webhooks.userId, userId))
      .orderBy(desc(webhooks.createdAt));

    if (organizationId) {
      query = query.where(and(
        eq(webhooks.userId, userId),
        eq(webhooks.organizationId, organizationId)
      ));
    }

    return await query;
  }

  /**
   * Process webhook event
   */
  static async processWebhookEvent(
    eventType: string,
    eventId: string,
    entityId: string,
    entityType: string,
    payload: Record<string, any>,
    userId?: string
  ) {
    try {
      // Create webhook event record
      await db.insert(webhookEvents).values({
        userId,
        eventType,
        entityId,
        entityType,
        payload,
        status: 'pending',
      });

      // Get all active webhooks subscribed to this event
      const subscriptions = await db
        .select({
          webhook: webhooks,
          subscription: webhookSubscriptions,
        })
        .from(webhookSubscriptions)
        .innerJoin(webhooks, eq(webhookSubscriptions.webhookId, webhooks.id))
        .where(and(
          eq(webhookSubscriptions.eventType, eventType),
          eq(webhookSubscriptions.isActive, true),
          eq(webhooks.isActive, true)
        ));

      // Process each webhook
      for (const { webhook, subscription } of subscriptions) {
        // Check if webhook filters match
        if (this.matchesFilters(payload, subscription.filters)) {
          await this.deliverWebhook(webhook, eventType, eventId, payload);
        }
      }

      // Update event status
      await db
        .update(webhookEvents)
        .set({
          status: 'processed',
          processedAt: new Date(),
        })
        .where(and(
          eq(webhookEvents.eventType, eventType),
          eq(webhookEvents.entityId, entityId)
        ));

    } catch (error) {
      console.error('Error processing webhook event:', error);
      
      // Update event status to failed
      await db
        .update(webhookEvents)
        .set({
          status: 'failed',
          processingAttempts: sql`processing_attempts + 1`,
          lastAttemptAt: new Date(),
        })
        .where(and(
          eq(webhookEvents.eventType, eventType),
          eq(webhookEvents.entityId, entityId)
        ));
    }
  }

  /**
   * Deliver webhook to endpoint
   */
  private static async deliverWebhook(
    webhook: any,
    eventType: string,
    eventId: string,
    payload: Record<string, any>
  ) {
    const deliveryId = nanoid();
    const startTime = Date.now();

    try {
      // Create delivery record
      await db.insert(webhookDeliveries).values({
        webhookId: webhook.id,
        userId: webhook.userId,
        deliveryId,
        eventType,
        eventId,
        payload,
        status: 'pending',
        attemptCount: 1,
        maxAttempts: webhook.retryPolicy.maxRetries,
      });

      // Prepare webhook payload
      const webhookPayload: WebhookPayload = {
        id: deliveryId,
        event: eventType,
        data: payload,
        timestamp: new Date().toISOString(),
        version: '1.0',
      };

      // Generate signature
      const signature = this.generateSignature(webhookPayload, webhook.secret);

      // Prepare headers
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-Webhook-Signature': signature,
        'X-Webhook-Event': eventType,
        'X-Webhook-Delivery': deliveryId,
        'User-Agent': 'Financbase-Webhooks/1.0',
        ...webhook.headers,
      };

      // Make HTTP request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), webhook.timeout);

      const response = await fetch(webhook.url, {
        method: 'POST',
        headers,
        body: JSON.stringify(webhookPayload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const responseBody = await response.text();
      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      const duration = Date.now() - startTime;

      // Update delivery record
      await this.updateDeliveryRecord(deliveryId, {
        success: response.ok,
        httpStatus: response.status,
        responseBody,
        responseHeaders,
        duration,
      });

      // Update webhook statistics
      await this.updateWebhookStats(webhook.id, response.ok);

    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      // Update delivery record with error
      await this.updateDeliveryRecord(deliveryId, {
        success: false,
        duration,
        errorMessage,
      });

      // Schedule retry if not exceeded max attempts
      await this.scheduleRetry(deliveryId, webhook);

      // Update webhook statistics
      await this.updateWebhookStats(webhook.id, false);
    }
  }

  /**
   * Update delivery record
   */
  private static async updateDeliveryRecord(
    deliveryId: string,
    result: WebhookDeliveryResult
  ) {
    const status = result.success ? 'delivered' : 'failed';
    const updateData: any = {
      status,
      httpStatus: result.httpStatus,
      responseBody: result.responseBody,
      responseHeaders: result.responseHeaders,
      duration: result.duration,
      errorMessage: result.errorMessage,
      updatedAt: new Date(),
    };

    if (result.success) {
      updateData.deliveredAt = new Date();
    } else {
      updateData.failedAt = new Date();
    }

    await db
      .update(webhookDeliveries)
      .set(updateData)
      .where(eq(webhookDeliveries.deliveryId, deliveryId));
  }

  /**
   * Schedule retry for failed delivery
   */
  private static async scheduleRetry(deliveryId: string, webhook: any) {
    const delivery = await db
      .select()
      .from(webhookDeliveries)
      .where(eq(webhookDeliveries.deliveryId, deliveryId))
      .limit(1);

    if (delivery.length === 0) return;

    const currentDelivery = delivery[0];
    const retryPolicy = webhook.retryPolicy;

    if (currentDelivery.attemptCount < retryPolicy.maxRetries) {
      const retryDelay = retryPolicy.retryDelay * Math.pow(
        retryPolicy.backoffMultiplier,
        currentDelivery.attemptCount - 1
      );

      const nextRetryAt = new Date(Date.now() + retryDelay);

      await db
        .update(webhookDeliveries)
        .set({
          status: 'retrying',
          nextRetryAt,
          attemptCount: currentDelivery.attemptCount + 1,
        })
        .where(eq(webhookDeliveries.deliveryId, deliveryId));

      // In a real implementation, you would schedule this retry with a job queue
      // For now, we'll just update the record
    }
  }

  /**
   * Update webhook statistics
   */
  private static async updateWebhookStats(webhookId: number, success: boolean) {
    const updateData: any = {
      deliveryCount: sql`delivery_count + 1`,
      lastDeliveryAt: new Date(),
    };

    if (success) {
      updateData.successCount = sql`success_count + 1`;
    } else {
      updateData.failureCount = sql`failure_count + 1`;
    }

    await db
      .update(webhooks)
      .set(updateData)
      .where(eq(webhooks.id, webhookId));
  }

  /**
   * Generate HMAC signature for webhook payload
   */
  private static generateSignature(payload: WebhookPayload, secret: string): string {
    const payloadString = JSON.stringify(payload);
    const signature = crypto
      .createHmac('sha256', secret)
      .update(payloadString)
      .digest('hex');
    
    return `sha256=${signature}`;
  }

  /**
   * Verify webhook signature
   */
  static verifySignature(payload: string, signature: string, secret: string): boolean {
    const expectedSignature = this.generateSignature(JSON.parse(payload), secret);
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  }

  /**
   * Check if payload matches webhook filters
   */
  private static matchesFilters(payload: Record<string, any>, filters: Record<string, any>): boolean {
    if (!filters || Object.keys(filters).length === 0) {
      return true;
    }

    for (const [key, expectedValue] of Object.entries(filters)) {
      const actualValue = this.getNestedValue(payload, key);
      
      if (typeof expectedValue === 'object' && expectedValue.operator) {
        // Advanced filter with operator
        switch (expectedValue.operator) {
          case 'equals':
            if (actualValue !== expectedValue.value) return false;
            break;
          case 'not_equals':
            if (actualValue === expectedValue.value) return false;
            break;
          case 'greater_than':
            if (Number(actualValue) <= Number(expectedValue.value)) return false;
            break;
          case 'less_than':
            if (Number(actualValue) >= Number(expectedValue.value)) return false;
            break;
          case 'contains':
            if (!String(actualValue).includes(String(expectedValue.value))) return false;
            break;
          case 'in':
            if (!expectedValue.value.includes(actualValue)) return false;
            break;
          default:
            return false;
        }
      } else {
        // Simple equality check
        if (actualValue !== expectedValue) return false;
      }
    }

    return true;
  }

  /**
   * Get nested value from object using dot notation
   */
  private static getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  /**
   * Test webhook endpoint
   */
  static async testWebhook(
    webhookId: number,
    userId: string,
    testPayload: Record<string, any>
  ) {
    const webhook = await this.getWebhook(webhookId, userId);
    if (!webhook) {
      throw new Error('Webhook not found');
    }

    const testId = nanoid();
    const startTime = Date.now();

    try {
      // Prepare test payload
      const webhookPayload: WebhookPayload = {
        id: testId,
        event: 'webhook.test',
        data: testPayload,
        timestamp: new Date().toISOString(),
        version: '1.0',
      };

      // Generate signature
      const signature = this.generateSignature(webhookPayload, webhook.secret);

      // Prepare headers
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-Webhook-Signature': signature,
        'X-Webhook-Event': 'webhook.test',
        'X-Webhook-Delivery': testId,
        'User-Agent': 'Financbase-Webhooks/1.0',
        ...webhook.headers,
      };

      // Make test request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), webhook.timeout);

      const response = await fetch(webhook.url, {
        method: 'POST',
        headers,
        body: JSON.stringify(webhookPayload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const responseBody = await response.text();
      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      const duration = Date.now() - startTime;
      const success = response.ok;

      // Store test result
      await db.insert(webhookTestResults).values({
        webhookId,
        userId,
        testId,
        testPayload,
        status: success ? 'success' : 'failed',
        httpStatus: response.status,
        responseBody,
        responseHeaders,
        duration,
        errorMessage: success ? null : `HTTP ${response.status}: ${responseBody}`,
      });

      return {
        success,
        httpStatus: response.status,
        responseBody,
        responseHeaders,
        duration,
        errorMessage: success ? null : `HTTP ${response.status}: ${responseBody}`,
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      // Store test result
      await db.insert(webhookTestResults).values({
        webhookId,
        userId,
        testId,
        testPayload,
        status: 'failed',
        duration,
        errorMessage,
      });

      return {
        success: false,
        duration,
        errorMessage,
      };
    }
  }

  /**
   * Get webhook delivery history
   */
  static async getWebhookDeliveries(
    webhookId: number,
    userId: string,
    limit: number = 50,
    offset: number = 0
  ) {
    return await db
      .select()
      .from(webhookDeliveries)
      .where(and(
        eq(webhookDeliveries.webhookId, webhookId),
        eq(webhookDeliveries.userId, userId)
      ))
      .orderBy(desc(webhookDeliveries.createdAt))
      .limit(limit)
      .offset(offset);
  }

  /**
   * Get webhook test results
   */
  static async getWebhookTestResults(
    webhookId: number,
    userId: string,
    limit: number = 20
  ) {
    return await db
      .select()
      .from(webhookTestResults)
      .where(and(
        eq(webhookTestResults.webhookId, webhookId),
        eq(webhookTestResults.userId, userId)
      ))
      .orderBy(desc(webhookTestResults.createdAt))
      .limit(limit);
  }

  /**
   * Retry failed webhook delivery
   */
  static async retryWebhookDelivery(deliveryId: string, userId: string) {
    const delivery = await db
      .select()
      .from(webhookDeliveries)
      .where(and(
        eq(webhookDeliveries.deliveryId, deliveryId),
        eq(webhookDeliveries.userId, userId)
      ))
      .limit(1);

    if (delivery.length === 0) {
      throw new Error('Delivery not found');
    }

    const webhook = await this.getWebhook(delivery[0].webhookId, userId);
    if (!webhook) {
      throw new Error('Webhook not found');
    }

    // Reset delivery status
    await db
      .update(webhookDeliveries)
      .set({
        status: 'pending',
        nextRetryAt: null,
        errorMessage: null,
        updatedAt: new Date(),
      })
      .where(eq(webhookDeliveries.deliveryId, deliveryId));

    // Trigger delivery
    await this.deliverWebhook(
      webhook,
      delivery[0].eventType,
      delivery[0].eventId,
      delivery[0].payload
    );
  }
}
