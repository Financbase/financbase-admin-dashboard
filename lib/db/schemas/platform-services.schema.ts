/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { pgTable, serial, text, timestamp, boolean, jsonb, integer, decimal, varchar, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users.schema';
import { organizations } from './organizations.schema';

// Platform Services Enums
export const platformServiceStatusEnum = pgEnum('platform_service_status', ['active', 'inactive', 'maintenance', 'deprecated']);
export const platformServiceTypeEnum = pgEnum('platform_service_type', ['workflow', 'webhook', 'integration', 'monitoring', 'alert']);
export const platformServiceCategoryEnum = pgEnum('platform_service_category', ['automation', 'communication', 'data', 'security', 'analytics']);

// Platform Services Registry Table
export const platformServices = pgTable('financbase.platform_services', {
  id: serial('id').primaryKey(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }),
  organizationId: text('organization_id').references(() => organizations.id, { onDelete: 'cascade' }),
  
  // Service identification
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  version: text('version').notNull().default('1.0.0'),
  
  // Service classification
  type: platformServiceTypeEnum('type').notNull(),
  category: platformServiceCategoryEnum('category').notNull(),
  status: platformServiceStatusEnum('status').notNull().default('active'),
  
  // Service configuration
  configuration: jsonb('configuration').default({}).notNull(),
  capabilities: jsonb('capabilities').default([]).notNull(),
  dependencies: jsonb('dependencies').default([]).notNull(),
  
  // Service metadata
  icon: text('icon'),
  color: text('color'),
  tags: jsonb('tags').default([]).notNull(),
  
  // Service health
  isActive: boolean('is_active').default(true).notNull(),
  healthCheckUrl: text('health_check_url'),
  lastHealthCheck: timestamp('last_health_check'),
  healthStatus: text('health_status').default('unknown'), // 'healthy', 'unhealthy', 'unknown'
  
  // Usage statistics
  usageCount: integer('usage_count').default(0).notNull(),
  lastUsedAt: timestamp('last_used_at'),
  
  // Service limits
  rateLimit: integer('rate_limit'), // requests per minute
  quotaLimit: integer('quota_limit'), // total requests per month
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const platformServicesRelations = relations(platformServices, ({ one, many }) => ({
  user: one(users, { fields: [platformServices.userId], references: [users.id] }),
  organization: one(organizations, { fields: [platformServices.organizationId], references: [organizations.id] }),
  instances: many(platformServiceInstances),
  metrics: many(platformServiceMetrics),
}));

// Platform Service Instances Table (for tracking active service instances)
export const platformServiceInstances = pgTable('financbase.platform_service_instances', {
  id: serial('id').primaryKey(),
  serviceId: integer('service_id').notNull().references(() => platformServices.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  organizationId: text('organization_id').references(() => organizations.id, { onDelete: 'cascade' }),
  
  // Instance details
  instanceId: text('instance_id').notNull().unique(),
  name: text('name').notNull(),
  status: text('status').notNull().default('active'), // 'active', 'inactive', 'error', 'maintenance'
  
  // Instance configuration
  configuration: jsonb('configuration').default({}).notNull(),
  environment: text('environment').default('production'), // 'development', 'staging', 'production'
  
  // Instance health
  healthStatus: text('health_status').default('unknown'),
  lastHealthCheck: timestamp('last_health_check'),
  errorCount: integer('error_count').default(0).notNull(),
  
  // Instance metrics
  requestCount: integer('request_count').default(0).notNull(),
  successCount: integer('success_count').default(0).notNull(),
  failureCount: integer('failure_count').default(0).notNull(),
  averageResponseTime: decimal('average_response_time', { precision: 10, scale: 3 }),
  
  // Instance lifecycle
  startedAt: timestamp('started_at').defaultNow().notNull(),
  lastActivityAt: timestamp('last_activity_at'),
  stoppedAt: timestamp('stopped_at'),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const platformServiceInstancesRelations = relations(platformServiceInstances, ({ one, many }) => ({
  service: one(platformServices, { fields: [platformServiceInstances.serviceId], references: [platformServices.id] }),
  user: one(users, { fields: [platformServiceInstances.userId], references: [users.id] }),
  organization: one(organizations, { fields: [platformServiceInstances.organizationId], references: [organizations.id] }),
  logs: many(platformServiceLogs),
}));

// Platform Service Metrics Table (for detailed service metrics)
export const platformServiceMetrics = pgTable('financbase.platform_service_metrics', {
  id: serial('id').primaryKey(),
  serviceId: integer('service_id').notNull().references(() => platformServices.id, { onDelete: 'cascade' }),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }),
  organizationId: text('organization_id').references(() => organizations.id, { onDelete: 'cascade' }),
  
  // Metric identification
  metricName: text('metric_name').notNull(),
  metricType: text('metric_type').notNull(), // 'counter', 'gauge', 'histogram', 'summary'
  category: text('category').notNull(), // 'performance', 'business', 'system', 'user'
  
  // Metric values
  value: text('value').notNull(),
  unit: text('unit'),
  
  // Context
  labels: jsonb('labels').default({}).notNull(),
  tags: jsonb('tags').default({}).notNull(),
  
  // Timing
  timestamp: timestamp('timestamp').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const platformServiceMetricsRelations = relations(platformServiceMetrics, ({ one }) => ({
  service: one(platformServices, { fields: [platformServiceMetrics.serviceId], references: [platformServices.id] }),
  user: one(users, { fields: [platformServiceMetrics.userId], references: [users.id] }),
  organization: one(organizations, { fields: [platformServiceMetrics.organizationId], references: [organizations.id] }),
}));

// Platform Service Logs Table (for service execution logs)
export const platformServiceLogs = pgTable('financbase.platform_service_logs', {
  id: serial('id').primaryKey(),
  serviceId: integer('service_id').references(() => platformServices.id, { onDelete: 'cascade' }),
  instanceId: integer('instance_id').references(() => platformServiceInstances.id, { onDelete: 'cascade' }),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }),
  organizationId: text('organization_id').references(() => organizations.id, { onDelete: 'cascade' }),
  
  // Log details
  level: text('level').notNull(), // 'debug', 'info', 'warning', 'error', 'critical'
  message: text('message').notNull(),
  details: jsonb('details').default({}).notNull(),
  
  // Context
  requestId: text('request_id'),
  sessionId: text('session_id'),
  userAgent: text('user_agent'),
  ipAddress: text('ip_address'),
  
  // Additional context
  labels: jsonb('labels').default({}).notNull(),
  tags: jsonb('tags').default({}).notNull(),
  
  timestamp: timestamp('timestamp').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const platformServiceLogsRelations = relations(platformServiceLogs, ({ one }) => ({
  service: one(platformServices, { fields: [platformServiceLogs.serviceId], references: [platformServices.id] }),
  instance: one(platformServiceInstances, { fields: [platformServiceLogs.instanceId], references: [platformServiceInstances.id] }),
  user: one(users, { fields: [platformServiceLogs.userId], references: [users.id] }),
  organization: one(organizations, { fields: [platformServiceLogs.organizationId], references: [organizations.id] }),
}));

// Platform Service Dependencies Table (for tracking service dependencies)
export const platformServiceDependencies = pgTable('financbase.platform_service_dependencies', {
  id: serial('id').primaryKey(),
  serviceId: integer('service_id').notNull().references(() => platformServices.id, { onDelete: 'cascade' }),
  dependsOnServiceId: integer('depends_on_service_id').notNull().references(() => platformServices.id, { onDelete: 'cascade' }),
  
  // Dependency details
  dependencyType: text('dependency_type').notNull(), // 'required', 'optional', 'peer'
  versionConstraint: text('version_constraint'),
  
  // Dependency status
  isActive: boolean('is_active').default(true).notNull(),
  lastCheckedAt: timestamp('last_checked_at'),
  status: text('status').default('unknown'), // 'satisfied', 'unsatisfied', 'unknown'
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const platformServiceDependenciesRelations = relations(platformServiceDependencies, ({ one }) => ({
  service: one(platformServices, { fields: [platformServiceDependencies.serviceId], references: [platformServices.id] }),
  dependsOnService: one(platformServices, { fields: [platformServiceDependencies.dependsOnServiceId], references: [platformServices.id] }),
}));

// Platform Service Events Table (for service events and notifications)
export const platformServiceEvents = pgTable('financbase.platform_service_events', {
  id: serial('id').primaryKey(),
  serviceId: integer('service_id').references(() => platformServices.id, { onDelete: 'cascade' }),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }),
  organizationId: text('organization_id').references(() => organizations.id, { onDelete: 'cascade' }),
  
  // Event details
  eventType: text('event_type').notNull(), // 'service_started', 'service_stopped', 'service_error', 'service_updated'
  eventData: jsonb('event_data').default({}).notNull(),
  
  // Event context
  severity: text('severity').default('info'), // 'info', 'warning', 'error', 'critical'
  message: text('message'),
  
  // Event processing
  isProcessed: boolean('is_processed').default(false).notNull(),
  processedAt: timestamp('processed_at'),
  
  // Additional context
  labels: jsonb('labels').default({}).notNull(),
  tags: jsonb('tags').default({}).notNull(),
  
  timestamp: timestamp('timestamp').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const platformServiceEventsRelations = relations(platformServiceEvents, ({ one }) => ({
  service: one(platformServices, { fields: [platformServiceEvents.serviceId], references: [platformServices.id] }),
  user: one(users, { fields: [platformServiceEvents.userId], references: [users.id] }),
  organization: one(organizations, { fields: [platformServiceEvents.organizationId], references: [organizations.id] }),
}));

// Platform Service Health Checks Table (for service health monitoring)
export const platformServiceHealthChecks = pgTable('financbase.platform_service_health_checks', {
  id: serial('id').primaryKey(),
  serviceId: integer('service_id').notNull().references(() => platformServices.id, { onDelete: 'cascade' }),
  instanceId: integer('instance_id').references(() => platformServiceInstances.id, { onDelete: 'cascade' }),
  
  // Health check details
  checkType: text('check_type').notNull(), // 'ping', 'http', 'database', 'custom'
  checkUrl: text('check_url'),
  checkMethod: text('check_method').default('GET'),
  checkHeaders: jsonb('check_headers').default({}),
  checkBody: text('check_body'),
  
  // Health check results
  status: text('status').notNull(), // 'healthy', 'unhealthy', 'unknown'
  responseTime: integer('response_time'), // Response time in milliseconds
  responseCode: integer('response_code'),
  responseBody: text('response_body'),
  
  // Health check configuration
  timeout: integer('timeout').default(5000), // Timeout in milliseconds
  retryCount: integer('retry_count').default(0),
  interval: integer('interval').default(60), // Check interval in seconds
  
  // Health check metadata
  lastCheckedAt: timestamp('last_checked_at').defaultNow().notNull(),
  nextCheckAt: timestamp('next_check_at'),
  consecutiveFailures: integer('consecutive_failures').default(0),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const platformServiceHealthChecksRelations = relations(platformServiceHealthChecks, ({ one }) => ({
  service: one(platformServices, { fields: [platformServiceHealthChecks.serviceId], references: [platformServices.id] }),
  instance: one(platformServiceInstances, { fields: [platformServiceHealthChecks.instanceId], references: [platformServiceInstances.id] }),
}));

// Export types
export type PlatformService = typeof platformServices.$inferSelect;
export type NewPlatformService = typeof platformServices.$inferInsert;
export type PlatformServiceInstance = typeof platformServiceInstances.$inferSelect;
export type NewPlatformServiceInstance = typeof platformServiceInstances.$inferInsert;
export type PlatformServiceMetric = typeof platformServiceMetrics.$inferSelect;
export type NewPlatformServiceMetric = typeof platformServiceMetrics.$inferInsert;
export type PlatformServiceLog = typeof platformServiceLogs.$inferSelect;
export type NewPlatformServiceLog = typeof platformServiceLogs.$inferInsert;
export type PlatformServiceDependency = typeof platformServiceDependencies.$inferSelect;
export type NewPlatformServiceDependency = typeof platformServiceDependencies.$inferInsert;
export type PlatformServiceEvent = typeof platformServiceEvents.$inferSelect;
export type NewPlatformServiceEvent = typeof platformServiceEvents.$inferInsert;
export type PlatformServiceHealthCheck = typeof platformServiceHealthChecks.$inferSelect;
export type NewPlatformServiceHealthCheck = typeof platformServiceHealthChecks.$inferInsert;
