import { pgTable, serial, text, timestamp, boolean, jsonb, integer, primaryKey } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users.schema';
import { organizations } from './organizations.schema';

// System Metrics Table
export const systemMetrics = pgTable('financbase_system_metrics', {
  id: serial('id').primaryKey(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }),
  organizationId: text('organization_id').references(() => organizations.id, { onDelete: 'cascade' }),
  
  // Metric identification
  metricName: text('metric_name').notNull(), // e.g., 'api_response_time', 'workflow_execution_time'
  metricType: text('metric_type').notNull(), // 'counter', 'gauge', 'histogram', 'summary'
  category: text('category').notNull(), // 'performance', 'business', 'system', 'user'
  
  // Metric values
  value: text('value').notNull(), // JSON string of metric value
  unit: text('unit'), // 'ms', 'bytes', 'count', 'percentage'
  
  // Context
  labels: jsonb('labels').default({}).notNull(), // Key-value pairs for filtering
  tags: jsonb('tags').default({}).notNull(), // Additional metadata
  
  // Timing
  timestamp: timestamp('timestamp').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const systemMetricsRelations = relations(systemMetrics, ({ one }) => ({
  user: one(users, { fields: [systemMetrics.userId], references: [users.id] }),
  organization: one(organizations, { fields: [systemMetrics.organizationId], references: [organizations.id] }),
}));

// Alert Rules Table
export const alertRules = pgTable('financbase_alert_rules', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  organizationId: text('organization_id').references(() => organizations.id, { onDelete: 'cascade' }),
  
  // Rule configuration
  name: text('name').notNull(),
  description: text('description'),
  isActive: boolean('is_active').default(true).notNull(),
  
  // Metric conditions
  metricName: text('metric_name').notNull(),
  condition: text('condition').notNull(), // 'greater_than', 'less_than', 'equals', 'not_equals'
  threshold: text('threshold').notNull(), // Threshold value
  timeWindow: integer('time_window').default(300).notNull(), // Time window in seconds
  
  // Alert settings
  severity: text('severity').notNull(), // 'low', 'medium', 'high', 'critical'
  channels: jsonb('channels').default([]).notNull(), // ['email', 'slack', 'webhook']
  
  // Notification settings
  cooldownPeriod: integer('cooldown_period').default(3600).notNull(), // Cooldown in seconds
  maxAlertsPerHour: integer('max_alerts_per_hour').default(10).notNull(),
  
  // Labels and filters
  labels: jsonb('labels').default({}).notNull(),
  filters: jsonb('filters').default({}).notNull(),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const alertRulesRelations = relations(alertRules, ({ one, many }) => ({
  user: one(users, { fields: [alertRules.userId], references: [users.id] }),
  organization: one(organizations, { fields: [alertRules.organizationId], references: [organizations.id] }),
  alerts: many(alertHistory),
}));

// Alert History Table
export const alertHistory = pgTable('financbase_alert_history', {
  id: serial('id').primaryKey(),
  ruleId: integer('rule_id').notNull().references(() => alertRules.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  organizationId: text('organization_id').references(() => organizations.id, { onDelete: 'cascade' }),
  
  // Alert details
  status: text('status').notNull(), // 'triggered', 'resolved', 'acknowledged'
  severity: text('severity').notNull(),
  message: text('message').notNull(),
  
  // Metric data that triggered the alert
  metricValue: text('metric_value').notNull(),
  threshold: text('threshold').notNull(),
  labels: jsonb('labels').default({}).notNull(),
  
  // Notification status
  notificationsSent: jsonb('notifications_sent').default([]).notNull(), // Array of sent notifications
  acknowledgedBy: text('acknowledged_by'), // User who acknowledged
  acknowledgedAt: timestamp('acknowledged_at'),
  
  // Resolution
  resolvedAt: timestamp('resolved_at'),
  resolution: text('resolution'), // How it was resolved
  
  // Timing
  triggeredAt: timestamp('triggered_at').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const alertHistoryRelations = relations(alertHistory, ({ one }) => ({
  rule: one(alertRules, { fields: [alertHistory.ruleId], references: [alertRules.id] }),
  user: one(users, { fields: [alertHistory.userId], references: [users.id] }),
  organization: one(organizations, { fields: [alertHistory.organizationId], references: [organizations.id] }),
}));

// Performance Metrics Table (for detailed performance tracking)
export const performanceMetrics = pgTable('financbase_performance_metrics', {
  id: serial('id').primaryKey(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }),
  organizationId: text('organization_id').references(() => organizations.id, { onDelete: 'cascade' }),
  
  // Request details
  endpoint: text('endpoint').notNull(), // API endpoint or page path
  method: text('method'), // HTTP method
  statusCode: integer('status_code'),
  
  // Performance data
  responseTime: integer('response_time').notNull(), // Response time in milliseconds
  memoryUsage: integer('memory_usage'), // Memory usage in bytes
  cpuUsage: integer('cpu_usage'), // CPU usage percentage
  
  // Database metrics
  dbQueryTime: integer('db_query_time'), // Database query time in milliseconds
  dbQueryCount: integer('db_query_count'), // Number of database queries
  
  // Cache metrics
  cacheHitRate: integer('cache_hit_rate'), // Cache hit rate percentage
  cacheSize: integer('cache_size'), // Cache size in bytes
  
  // User context
  userAgent: text('user_agent'),
  ipAddress: text('ip_address'),
  sessionId: text('session_id'),
  
  // Additional context
  labels: jsonb('labels').default({}).notNull(),
  metadata: jsonb('metadata').default({}).notNull(),
  
  timestamp: timestamp('timestamp').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const performanceMetricsRelations = relations(performanceMetrics, ({ one }) => ({
  user: one(users, { fields: [performanceMetrics.userId], references: [users.id] }),
  organization: one(organizations, { fields: [performanceMetrics.organizationId], references: [organizations.id] }),
}));

// Business Metrics Table (for business-specific metrics)
export const businessMetrics = pgTable('financbase_business_metrics', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  organizationId: text('organization_id').references(() => organizations.id, { onDelete: 'cascade' }),
  
  // Business metric identification
  metricName: text('metric_name').notNull(), // e.g., 'revenue', 'expenses', 'invoice_count'
  metricType: text('metric_type').notNull(), // 'revenue', 'expense', 'count', 'ratio'
  
  // Metric values
  value: text('value').notNull(), // JSON string of metric value
  currency: text('currency').default('USD'),
  unit: text('unit'), // 'dollars', 'count', 'percentage'
  
  // Time period
  period: text('period').notNull(), // 'daily', 'weekly', 'monthly', 'yearly'
  periodStart: timestamp('period_start').notNull(),
  periodEnd: timestamp('period_end').notNull(),
  
  // Context
  labels: jsonb('labels').default({}).notNull(),
  tags: jsonb('tags').default({}).notNull(),
  
  // Aggregation
  isAggregated: boolean('is_aggregated').default(false).notNull(),
  sourceMetrics: jsonb('source_metrics').default([]).notNull(), // IDs of source metrics
  
  timestamp: timestamp('timestamp').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const businessMetricsRelations = relations(businessMetrics, ({ one }) => ({
  user: one(users, { fields: [businessMetrics.userId], references: [users.id] }),
  organization: one(organizations, { fields: [businessMetrics.organizationId], references: [organizations.id] }),
}));
