/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { pgTable, serial, text, timestamp, boolean, jsonb, integer, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { organizations } from './organizations.schema';
import { users } from './users.schema';

// SIEM Event Severity Enum
export const siemEventSeverityEnum = pgEnum('siem_event_severity', [
  'low',
  'medium',
  'high',
  'critical'
]);

// SIEM Event Status Enum
export const siemEventStatusEnum = pgEnum('siem_event_status', [
  'new',
  'analyzing',
  'investigating',
  'contained',
  'resolved',
  'false_positive',
  'ignored'
]);

// SIEM Integration Type Enum
export const siemIntegrationTypeEnum = pgEnum('siem_integration_type', [
  'datadog',
  'splunk',
  'splunk_cloud',
  'splunk_enterprise',
  'elastic',
  'elastic_cloud',
  'sumo_logic',
  'azure_sentinel',
  'aws_security_hub',
  'google_chronicle',
  'qradar',
  'arcsight',
  'custom'
]);

// Alert Rule Type Enum
export const alertRuleTypeEnum = pgEnum('alert_rule_type', [
  'threshold',
  'anomaly',
  'correlation',
  'pattern',
  'machine_learning',
  'custom'
]);

// SIEM Events Table - Centralized security event log
export const siemEvents = pgTable('financbase_siem_events', {
  id: serial('id').primaryKey(),
  organizationId: text('organization_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  
  // Event identification
  eventId: text('event_id').notNull().unique(), // Unique event identifier
  correlationId: text('correlation_id'), // For correlating related events
  sourceEventId: text('source_event_id'), // Original event ID from source system
  
  // Event details
  eventType: text('event_type').notNull(), // 'authentication', 'authorization', 'data_access', 'network', 'system', etc.
  eventCategory: text('event_category').notNull(), // 'security', 'compliance', 'operational', 'audit'
  eventAction: text('event_action').notNull(), // Specific action taken
  severity: siemEventSeverityEnum('severity').notNull(),
  status: siemEventStatusEnum('status').default('new').notNull(),
  
  // Source information
  sourceSystem: text('source_system').notNull(), // System that generated the event
  sourceComponent: text('source_component'), // Component within the system
  sourceIp: text('source_ip'),
  sourceUser: text('source_user'),
  sourceHost: text('source_host'),
  
  // Target information
  targetResource: text('target_resource'), // Resource that was accessed/modified
  targetType: text('target_type'), // Type of target resource
  targetUser: text('target_user'),
  
  // Event data
  eventData: jsonb('event_data').default({}).notNull(), // Structured event data
  rawEvent: jsonb('raw_event'), // Original raw event data
  normalizedEvent: jsonb('normalized_event').default({}).notNull(), // Normalized event data
  
  // Context
  timestamp: timestamp('timestamp', { withTimezone: true }).notNull(), // Original event timestamp
  receivedAt: timestamp('received_at', { withTimezone: true }).defaultNow().notNull(), // When SIEM received it
  processedAt: timestamp('processed_at', { withTimezone: true }), // When SIEM processed it
  
  // Geographic and network context
  country: text('country'),
  region: text('region'),
  city: text('city'),
  userAgent: text('user_agent'),
  deviceType: text('device_type'),
  
  // Threat intelligence
  threatIndicators: jsonb('threat_indicators').default([]).notNull(), // Array of threat indicators
  iocMatches: jsonb('ioc_matches').default([]).notNull(), // Indicators of Compromise matches
  riskScore: integer('risk_score'), // Calculated risk score 0-100
  
  // Response
  isAlerted: boolean('is_alerted').default(false).notNull(),
  alertIds: jsonb('alert_ids').default([]).notNull(), // Array of related alert IDs
  investigationId: integer('investigation_id'), // Link to investigation if created
  
  // Compliance
  complianceRelevant: boolean('compliance_relevant').default(false).notNull(),
  complianceFrameworks: jsonb('compliance_frameworks').default([]).notNull(), // ['SOC2', 'HIPAA', 'PCI', etc.]
  retentionPeriod: integer('retention_period').default(2555).notNull(), // Days (7 years default)
  
  // Metadata
  tags: jsonb('tags').default([]).notNull(),
  metadata: jsonb('metadata').default({}).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// SIEM Integrations Table
export const siemIntegrations = pgTable('financbase_siem_integrations', {
  id: serial('id').primaryKey(),
  organizationId: text('organization_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  createdBy: text('created_by').references(() => users.id, { onDelete: 'set null' }),
  
  // Integration details
  name: text('name').notNull(),
  integrationType: siemIntegrationTypeEnum('integration_type').notNull(),
  description: text('description'),
  
  // Connection configuration
  endpoint: text('endpoint').notNull(),
  apiKey: text('api_key'), // Encrypted
  apiSecret: text('api_secret'), // Encrypted
  username: text('username'),
  password: text('password'), // Encrypted
  additionalConfig: jsonb('additional_config').default({}).notNull(), // Additional configuration
  
  // Event forwarding
  forwardEvents: boolean('forward_events').default(true).notNull(),
  eventFilters: jsonb('event_filters').default({}).notNull(), // Filters for which events to forward
  forwardFormat: text('forward_format').default('json').notNull(), // 'json', 'syslog', 'cef', 'leef'
  
  // Status
  isActive: boolean('is_active').default(true).notNull(),
  isVerified: boolean('is_verified').default(false).notNull(),
  lastHealthCheck: timestamp('last_health_check', { withTimezone: true }),
  healthStatus: text('health_status').default('unknown').notNull(), // 'healthy', 'degraded', 'down', 'unknown'
  lastError: text('last_error'),
  
  // Statistics
  eventsForwarded: integer('events_forwarded').default(0).notNull(),
  eventsFailed: integer('events_failed').default(0).notNull(),
  lastForwardedAt: timestamp('last_forwarded_at', { withTimezone: true }),
  
  // Metadata
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Real-time Alert Rules Table
export const alertRules = pgTable('financbase_alert_rules', {
  id: serial('id').primaryKey(),
  organizationId: text('organization_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  createdBy: text('created_by').references(() => users.id, { onDelete: 'set null' }),
  
  // Rule details
  name: text('name').notNull(),
  description: text('description'),
  ruleType: alertRuleTypeEnum('rule_type').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  priority: integer('priority').default(0).notNull(), // Higher priority rules evaluated first
  
  // Rule conditions
  conditions: jsonb('conditions').notNull(), // Structured rule conditions
  eventFilters: jsonb('event_filters').default({}).notNull(), // Event filters
  threshold: integer('threshold'), // For threshold-based rules
  timeWindow: integer('time_window'), // Time window in seconds
  
  // Alert configuration
  alertSeverity: siemEventSeverityEnum('alert_severity').notNull(),
  alertTitle: text('alert_title').notNull(),
  alertMessage: text('alert_message').notNull(),
  alertChannels: jsonb('alert_channels').default([]).notNull(), // ['email', 'slack', 'pagerduty', 'sms']
  alertRecipients: jsonb('alert_recipients').default([]).notNull(), // Array of user IDs or email addresses
  
  // Escalation
  escalationPolicy: jsonb('escalation_policy').default({}).notNull(), // Escalation rules
  cooldownPeriod: integer('cooldown_period').default(300).notNull(), // Seconds before same alert can fire again
  
  // Statistics
  triggerCount: integer('trigger_count').default(0).notNull(),
  lastTriggeredAt: timestamp('last_triggered_at', { withTimezone: true }),
  
  // Metadata
  tags: jsonb('tags').default([]).notNull(),
  metadata: jsonb('metadata').default({}).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Real-time Alerts Table
export const realTimeAlerts = pgTable('financbase_real_time_alerts', {
  id: serial('id').primaryKey(),
  organizationId: text('organization_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  alertRuleId: integer('alert_rule_id').references(() => alertRules.id, { onDelete: 'set null' }),
  
  // Alert details
  alertId: text('alert_id').notNull().unique(),
  severity: siemEventSeverityEnum('severity').notNull(),
  status: text('status').default('active').notNull(), // 'active', 'acknowledged', 'resolved', 'suppressed'
  title: text('title').notNull(),
  message: text('message').notNull(),
  
  // Trigger information
  triggeredAt: timestamp('triggered_at', { withTimezone: true }).defaultNow().notNull(),
  triggeredBy: text('triggered_by'), // Event ID or rule name
  relatedEvents: jsonb('related_events').default([]).notNull(), // Array of related event IDs
  
  // Response
  acknowledgedBy: text('acknowledged_by').references(() => users.id, { onDelete: 'set null' }),
  acknowledgedAt: timestamp('acknowledged_at', { withTimezone: true }),
  resolvedBy: text('resolved_by').references(() => users.id, { onDelete: 'set null' }),
  resolvedAt: timestamp('resolved_at', { withTimezone: true }),
  resolutionNotes: text('resolution_notes'),
  
  // Notifications
  notificationsSent: jsonb('notifications_sent').default([]).notNull(), // Array of notification records
  escalationLevel: integer('escalation_level').default(0).notNull(),
  
  // Metadata
  tags: jsonb('tags').default([]).notNull(),
  metadata: jsonb('metadata').default({}).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Immutable Audit Trail Table (WORM - Write Once Read Many)
export const immutableAuditTrail = pgTable('financbase_immutable_audit_trail', {
  id: serial('id').primaryKey(),
  organizationId: text('organization_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  
  // Event identification
  eventHash: text('event_hash').notNull().unique(), // Cryptographic hash of event data
  eventId: text('event_id').notNull(), // Reference to original event
  eventType: text('event_type').notNull(),
  
  // Immutable event data
  eventData: jsonb('event_data').notNull(), // Complete event data snapshot
  eventMetadata: jsonb('event_metadata').default({}).notNull(), // Metadata about the event
  
  // Integrity verification
  previousHash: text('previous_hash'), // Hash of previous event (blockchain-like chain)
  signature: text('signature'), // Digital signature for integrity verification
  
  // Timestamp (immutable)
  timestamp: timestamp('timestamp', { withTimezone: true }).notNull(),
  recordedAt: timestamp('recorded_at', { withTimezone: true }).defaultNow().notNull(),
  
  // Compliance
  complianceFrameworks: jsonb('compliance_frameworks').default([]).notNull(),
  retentionUntil: timestamp('retention_until', { withTimezone: true }).notNull(), // When this can be archived
  
  // Metadata
  sourceSystem: text('source_system').notNull(),
  tags: jsonb('tags').default([]).notNull(),
});

// Log Aggregation Configuration Table
export const logAggregationConfig = pgTable('financbase_log_aggregation_config', {
  id: serial('id').primaryKey(),
  organizationId: text('organization_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  
  // Configuration
  configName: text('config_name').notNull(),
  description: text('description'),
  isActive: boolean('is_active').default(true).notNull(),
  
  // Source configuration
  sourceSystems: jsonb('source_systems').default([]).notNull(), // Array of source systems to aggregate
  logTypes: jsonb('log_types').default([]).notNull(), // Types of logs to aggregate
  filters: jsonb('filters').default({}).notNull(), // Filters for which logs to aggregate
  
  // Aggregation settings
  aggregationInterval: integer('aggregation_interval').default(60).notNull(), // Seconds
  retentionPeriod: integer('retention_period').default(2555).notNull(), // Days (7 years)
  compressionEnabled: boolean('compression_enabled').default(true).notNull(),
  
  // Storage
  storageLocation: text('storage_location'), // Where aggregated logs are stored
  storageFormat: text('storage_format').default('json').notNull(), // 'json', 'parquet', 'csv'
  
  // Metadata
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Relations
export const siemEventsRelations = relations(siemEvents, ({ one }) => ({
  organization: one(organizations, {
    fields: [siemEvents.organizationId],
    references: [organizations.id],
  }),
}));

export const siemIntegrationsRelations = relations(siemIntegrations, ({ one }) => ({
  organization: one(organizations, {
    fields: [siemIntegrations.organizationId],
    references: [organizations.id],
  }),
}));

export const alertRulesRelations = relations(alertRules, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [alertRules.organizationId],
    references: [organizations.id],
  }),
  alerts: many(realTimeAlerts),
}));

export const realTimeAlertsRelations = relations(realTimeAlerts, ({ one }) => ({
  organization: one(organizations, {
    fields: [realTimeAlerts.organizationId],
    references: [organizations.id],
  }),
  alertRule: one(alertRules, {
    fields: [realTimeAlerts.alertRuleId],
    references: [alertRules.id],
  }),
}));

export const immutableAuditTrailRelations = relations(immutableAuditTrail, ({ one }) => ({
  organization: one(organizations, {
    fields: [immutableAuditTrail.organizationId],
    references: [organizations.id],
  }),
}));

export const logAggregationConfigRelations = relations(logAggregationConfig, ({ one }) => ({
  organization: one(organizations, {
    fields: [logAggregationConfig.organizationId],
    references: [organizations.id],
  }),
}));

