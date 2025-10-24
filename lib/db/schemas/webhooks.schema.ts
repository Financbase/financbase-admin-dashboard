import { pgTable, serial, text, timestamp, boolean, jsonb, integer, primaryKey } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users.schema';
import { organizations } from './organizations.schema';

// Webhooks Table
export const webhooks = pgTable('financbase_webhooks', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  organizationId: text('organization_id').references(() => organizations.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  url: text('url').notNull(),
  secret: text('secret').notNull(), // HMAC secret for signature verification
  events: jsonb('events').notNull().default([]), // Array of event types to subscribe to
  isActive: boolean('is_active').default(true).notNull(),
  retryPolicy: jsonb('retry_policy').default({
    maxRetries: 3,
    retryDelay: 1000, // milliseconds
    backoffMultiplier: 2
  }).notNull(),
  headers: jsonb('headers').default({}).notNull(), // Custom headers to include
  filters: jsonb('filters').default({}).notNull(), // Event filters
  timeout: integer('timeout').default(30000).notNull(), // Request timeout in milliseconds
  deliveryCount: integer('delivery_count').default(0).notNull(),
  successCount: integer('success_count').default(0).notNull(),
  failureCount: integer('failure_count').default(0).notNull(),
  lastDeliveryAt: timestamp('last_delivery_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const webhooksRelations = relations(webhooks, ({ one, many }) => ({
  user: one(users, { fields: [webhooks.userId], references: [users.id] }),
  organization: one(organizations, { fields: [webhooks.organizationId], references: [organizations.id] }),
  deliveries: many(webhookDeliveries),
}));

// Webhook Deliveries Table
export const webhookDeliveries = pgTable('financbase_webhook_deliveries', {
  id: serial('id').primaryKey(),
  webhookId: integer('webhook_id').notNull().references(() => webhooks.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  deliveryId: text('delivery_id').notNull().unique(), // Unique ID for each delivery attempt
  eventType: text('event_type').notNull(),
  eventId: text('event_id').notNull(), // ID of the event that triggered this delivery
  payload: jsonb('payload').notNull(), // The actual payload sent
  status: text('status').notNull(), // 'pending', 'delivered', 'failed', 'retrying'
  httpStatus: integer('http_status'), // HTTP response status code
  responseBody: text('response_body'), // Response body from the webhook endpoint
  responseHeaders: jsonb('response_headers').default({}), // Response headers
  attemptCount: integer('attempt_count').default(1).notNull(),
  maxAttempts: integer('max_attempts').default(3).notNull(),
  nextRetryAt: timestamp('next_retry_at'), // When to retry next (for failed deliveries)
  deliveredAt: timestamp('delivered_at'), // When successfully delivered
  failedAt: timestamp('failed_at'), // When permanently failed
  duration: integer('duration'), // Delivery duration in milliseconds
  errorMessage: text('error_message'), // Error message if delivery failed
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const webhookDeliveriesRelations = relations(webhookDeliveries, ({ one }) => ({
  webhook: one(webhooks, { fields: [webhookDeliveries.webhookId], references: [webhooks.id] }),
  user: one(users, { fields: [webhookDeliveries.userId], references: [users.id] }),
}));

// Webhook Events Table (for incoming webhook events that can trigger workflows)
export const webhookEvents = pgTable('financbase_webhook_events', {
  id: serial('id').primaryKey(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }), // Optional, if webhook is user-specific
  eventType: text('event_type').notNull(), // e.g., 'stripe.invoice.paid', 'github.push'
  entityId: text('entity_id'), // ID of the entity related to the event (e.g., invoice ID)
  entityType: text('entity_type'), // Type of the entity (e.g., 'invoice')
  payload: jsonb('payload').notNull(), // Full webhook payload
  status: text('status').default('pending').notNull(), // 'pending', 'processed', 'failed'
  processingAttempts: integer('processing_attempts').default(0).notNull(),
  lastAttemptAt: timestamp('last_attempt_at'),
  processedAt: timestamp('processed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const webhookEventsRelations = relations(webhookEvents, ({ one }) => ({
  user: one(users, { fields: [webhookEvents.userId], references: [users.id] }),
}));

// Webhook Event Types Table (for managing available event types)
export const webhookEventTypes = pgTable('financbase_webhook_event_types', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(), // e.g., 'invoice.created', 'expense.approved'
  description: text('description'),
  category: text('category').notNull(), // e.g., 'invoice', 'expense', 'client'
  isActive: boolean('is_active').default(true).notNull(),
  schema: jsonb('schema').default({}), // JSON schema for the event payload
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Webhook Subscriptions Table (for managing which webhooks subscribe to which events)
export const webhookSubscriptions = pgTable('financbase_webhook_subscriptions', {
  id: serial('id').primaryKey(),
  webhookId: integer('webhook_id').notNull().references(() => webhooks.id, { onDelete: 'cascade' }),
  eventType: text('event_type').notNull(),
  filters: jsonb('filters').default({}).notNull(), // Event-specific filters
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return {
    unqWebhookEvent: primaryKey(table.webhookId, table.eventType),
  };
});

export const webhookSubscriptionsRelations = relations(webhookSubscriptions, ({ one }) => ({
  webhook: one(webhooks, { fields: [webhookSubscriptions.webhookId], references: [webhooks.id] }),
}));

// Webhook Test Results Table (for storing webhook test results)
export const webhookTestResults = pgTable('financbase_webhook_test_results', {
  id: serial('id').primaryKey(),
  webhookId: integer('webhook_id').notNull().references(() => webhooks.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  testId: text('test_id').notNull().unique(),
  testPayload: jsonb('test_payload').notNull(),
  status: text('status').notNull(), // 'success', 'failed'
  httpStatus: integer('http_status'),
  responseBody: text('response_body'),
  responseHeaders: jsonb('response_headers').default({}),
  duration: integer('duration'), // Test duration in milliseconds
  errorMessage: text('error_message'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const webhookTestResultsRelations = relations(webhookTestResults, ({ one }) => ({
  webhook: one(webhooks, { fields: [webhookTestResults.webhookId], references: [webhooks.id] }),
  user: one(users, { fields: [webhookTestResults.userId], references: [users.id] }),
}));
