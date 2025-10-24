import { pgTable, serial, text, timestamp, boolean, jsonb, integer, primaryKey } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users.schema';
import { organizations } from './organizations.schema';

// Integrations Table - Available integration services
export const integrations = pgTable('financbase_integrations', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(), // e.g., 'Stripe', 'Slack', 'QuickBooks'
  slug: text('slug').notNull().unique(), // e.g., 'stripe', 'slack', 'quickbooks'
  description: text('description'),
  category: text('category').notNull(), // 'payment', 'communication', 'accounting', 'productivity'
  icon: text('icon'), // Icon name or URL
  color: text('color'), // Brand color
  isActive: boolean('is_active').default(true).notNull(),
  isOfficial: boolean('is_official').default(true).notNull(),
  version: text('version').default('1.0.0').notNull(),
  configuration: jsonb('configuration').default({}).notNull(), // OAuth config, API endpoints, etc.
  features: jsonb('features').default([]).notNull(), // Available features
  requirements: jsonb('requirements').default({}).notNull(), // System requirements
  documentation: text('documentation'), // Link to docs
  supportUrl: text('support_url'), // Support contact
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const integrationsRelations = relations(integrations, ({ many }) => ({
  connections: many(integrationConnections),
}));

// Integration Connections Table - User's connected integrations
export const integrationConnections = pgTable('financbase_integration_connections', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  organizationId: text('organization_id').references(() => organizations.id, { onDelete: 'cascade' }),
  integrationId: integer('integration_id').notNull().references(() => integrations.id, { onDelete: 'cascade' }),
  name: text('name').notNull(), // User-defined name for this connection
  status: text('status').notNull().default('active'), // 'active', 'inactive', 'error', 'expired'
  isActive: boolean('is_active').default(true).notNull(),
  
  // OAuth tokens and credentials
  accessToken: text('access_token').notNull(),
  refreshToken: text('refresh_token'),
  tokenExpiresAt: timestamp('token_expires_at'),
  scope: text('scope'), // OAuth scopes granted
  
  // Connection metadata
  externalId: text('external_id'), // External system ID (e.g., Stripe account ID)
  externalName: text('external_name'), // External system name (e.g., "My Stripe Account")
  externalData: jsonb('external_data').default({}), // Additional external system data
  
  // Configuration
  settings: jsonb('settings').default({}).notNull(), // User-specific settings
  mappings: jsonb('mappings').default({}).notNull(), // Data field mappings
  
  // Sync information
  lastSyncAt: timestamp('last_sync_at'),
  nextSyncAt: timestamp('next_sync_at'),
  syncStatus: text('sync_status').default('pending'), // 'pending', 'running', 'completed', 'failed'
  syncError: text('sync_error'),
  
  // Statistics
  syncCount: integer('sync_count').default(0).notNull(),
  successCount: integer('success_count').default(0).notNull(),
  failureCount: integer('failure_count').default(0).notNull(),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const integrationConnectionsRelations = relations(integrationConnections, ({ one, many }) => ({
  user: one(users, { fields: [integrationConnections.userId], references: [users.id] }),
  organization: one(organizations, { fields: [integrationConnections.organizationId], references: [organizations.id] }),
  integration: one(integrations, { fields: [integrationConnections.integrationId], references: [integrations.id] }),
  syncs: many(integrationSyncs),
}));

// Integration Syncs Table - Sync operation logs
export const integrationSyncs = pgTable('financbase_integration_syncs', {
  id: serial('id').primaryKey(),
  connectionId: integer('connection_id').notNull().references(() => integrationConnections.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  syncId: text('sync_id').notNull().unique(), // Unique sync operation ID
  
  // Sync details
  type: text('type').notNull(), // 'full', 'incremental', 'manual'
  direction: text('direction').notNull(), // 'import', 'export', 'bidirectional'
  status: text('status').notNull(), // 'pending', 'running', 'completed', 'failed', 'cancelled'
  
  // Sync scope
  entityTypes: jsonb('entity_types').default([]).notNull(), // ['invoices', 'payments', 'customers']
  filters: jsonb('filters').default({}).notNull(), // Sync filters (date range, status, etc.)
  
  // Progress tracking
  totalRecords: integer('total_records').default(0),
  processedRecords: integer('processed_records').default(0),
  successRecords: integer('success_records').default(0),
  failedRecords: integer('failed_records').default(0),
  
  // Timing
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),
  duration: integer('duration'), // Duration in seconds
  
  // Results
  result: jsonb('result').default({}), // Sync results and statistics
  errors: jsonb('errors').default([]), // Error details
  warnings: jsonb('warnings').default([]), // Warning details
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const integrationSyncsRelations = relations(integrationSyncs, ({ one }) => ({
  connection: one(integrationConnections, { fields: [integrationSyncs.connectionId], references: [integrationConnections.id] }),
  user: one(users, { fields: [integrationSyncs.userId], references: [users.id] }),
}));

// Integration Mappings Table - Data field mappings between systems
export const integrationMappings = pgTable('financbase_integration_mappings', {
  id: serial('id').primaryKey(),
  connectionId: integer('connection_id').notNull().references(() => integrationConnections.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  // Mapping details
  entityType: text('entity_type').notNull(), // 'invoice', 'customer', 'payment', etc.
  direction: text('direction').notNull(), // 'import', 'export', 'bidirectional'
  
  // Field mappings
  fieldMappings: jsonb('field_mappings').notNull(), // { "external_field": "internal_field" }
  transformations: jsonb('transformations').default({}), // Data transformation rules
  validations: jsonb('validations').default({}), // Validation rules
  
  // Status
  isActive: boolean('is_active').default(true).notNull(),
  lastUsedAt: timestamp('last_used_at'),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const integrationMappingsRelations = relations(integrationMappings, ({ one }) => ({
  connection: one(integrationConnections, { fields: [integrationMappings.connectionId], references: [integrationConnections.id] }),
  user: one(users, { fields: [integrationMappings.userId], references: [users.id] }),
}));

// Integration Webhooks Table - Webhook configurations for integrations
export const integrationWebhooks = pgTable('financbase_integration_webhooks', {
  id: serial('id').primaryKey(),
  connectionId: integer('connection_id').notNull().references(() => integrationConnections.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  // Webhook details
  eventType: text('event_type').notNull(), // External system event type
  webhookUrl: text('webhook_url').notNull(), // Our webhook endpoint
  externalWebhookId: text('external_webhook_id'), // External system webhook ID
  
  // Configuration
  isActive: boolean('is_active').default(true).notNull(),
  secret: text('secret'), // Webhook secret for verification
  
  // Statistics
  deliveryCount: integer('delivery_count').default(0).notNull(),
  successCount: integer('success_count').default(0).notNull(),
  failureCount: integer('failure_count').default(0).notNull(),
  lastDeliveryAt: timestamp('last_delivery_at'),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const integrationWebhooksRelations = relations(integrationWebhooks, ({ one }) => ({
  connection: one(integrationConnections, { fields: [integrationWebhooks.connectionId], references: [integrationConnections.id] }),
  user: one(users, { fields: [integrationWebhooks.userId], references: [users.id] }),
}));

// Integration Errors Table - Error tracking for integrations
export const integrationErrors = pgTable('financbase_integration_errors', {
  id: serial('id').primaryKey(),
  connectionId: integer('connection_id').notNull().references(() => integrationConnections.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  syncId: integer('sync_id').references(() => integrationSyncs.id, { onDelete: 'cascade' }),
  
  // Error details
  errorType: text('error_type').notNull(), // 'auth', 'api', 'data', 'network', 'rate_limit'
  errorCode: text('error_code'),
  errorMessage: text('error_message').notNull(),
  errorDetails: jsonb('error_details').default({}),
  
  // Context
  operation: text('operation'), // 'sync', 'auth', 'webhook', etc.
  entityType: text('entity_type'), // 'invoice', 'customer', etc.
  entityId: text('entity_id'), // Specific entity ID if applicable
  
  // Resolution
  isResolved: boolean('is_resolved').default(false).notNull(),
  resolvedAt: timestamp('resolved_at'),
  resolution: text('resolution'), // How it was resolved
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const integrationErrorsRelations = relations(integrationErrors, ({ one }) => ({
  connection: one(integrationConnections, { fields: [integrationErrors.connectionId], references: [integrationConnections.id] }),
  user: one(users, { fields: [integrationErrors.userId], references: [users.id] }),
  sync: one(integrationSyncs, { fields: [integrationErrors.syncId], references: [integrationSyncs.id] }),
}));
