/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { pgTable, serial, text, timestamp, numeric, jsonb, boolean } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const monitoringMetrics = pgTable('monitoring_metrics', {
	id: serial('id').primaryKey(),
	userId: text('user_id').notNull(),

	// Metric details
	metricName: text('metric_name').notNull(),
	metricType: text('metric_type').notNull(), // counter, gauge, histogram, summary
	category: text('category').default('system'), // system, performance, business, security

	// Metric values
	value: numeric('value', { precision: 15, scale: 6 }),
	minValue: numeric('min_value', { precision: 15, scale: 6 }),
	maxValue: numeric('max_value', { precision: 15, scale: 6 }),
	avgValue: numeric('avg_value', { precision: 15, scale: 6 }),

	// Metadata
	labels: jsonb('labels'), // Additional metadata labels
	unit: text('unit'), // ms, bytes, count, percentage, etc.

	// Aggregation
	aggregationType: text('aggregation_type').default('sum'), // sum, avg, min, max, count
	timeWindow: text('time_window').default('1m'), // 1m, 5m, 1h, 1d, etc.

	// Status and thresholds
	status: text('status').default('normal'), // normal, warning, critical
	warningThreshold: numeric('warning_threshold', { precision: 15, scale: 6 }),
	criticalThreshold: numeric('critical_threshold', { precision: 15, scale: 6 }),

	// Audit
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').defaultNow(),
});

export const monitoringAlerts = pgTable('monitoring_alerts', {
	id: serial('id').primaryKey(),
	userId: text('user_id').notNull(),

	// Alert details
	alertName: text('alert_name').notNull(),
	severity: text('severity').default('medium'), // low, medium, high, critical
	status: text('status').default('active'), // active, resolved, suppressed, acknowledged

	// Trigger conditions
	metricName: text('metric_name').notNull(),
	condition: text('condition').notNull(), // greater_than, less_than, equals, not_equals
	threshold: numeric('threshold', { precision: 15, scale: 6 }).notNull(),
	duration: serial('duration').default(0), // minutes the condition must persist

	// Alert configuration
	notificationChannels: jsonb('notification_channels').$defaultFn(() => ['email']), // email, slack, webhook
	cooldownMinutes: serial('cooldown_minutes').default(60),
	maxAlertsPerHour: serial('max_alerts_per_hour').default(10),

	// Alert state
	lastTriggeredAt: timestamp('last_triggered_at'),
	lastResolvedAt: timestamp('last_resolved_at'),
	triggerCount: serial('trigger_count').default(0),
	resolutionCount: serial('resolution_count').default(0),

	// Alert content
	title: text('title').notNull(),
	message: text('message').notNull(),
	runbookUrl: text('runbook_url'),
	escalationPolicy: jsonb('escalation_policy'),

	// Audit
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').defaultNow(),
});

export const monitoringEvents = pgTable('monitoring_events', {
	id: serial('id').primaryKey(),
	userId: text('user_id').notNull(),

	// Event details
	eventType: text('event_type').notNull(), // error, warning, info, performance, security
	title: text('title').notNull(),
	message: text('message').notNull(),

	// Context
	source: text('source').notNull(), // api, database, external, system
	component: text('component'), // authentication, invoices, expenses, etc.
	environment: text('environment').default('production'),

	// Event data
	severity: text('severity').default('info'), // info, warning, error, critical
	details: jsonb('details'),
	stackTrace: text('stack_trace'),
	userAgent: text('user_agent'),
	ipAddress: text('ip_address'),

	// Performance metrics
	responseTime: numeric('response_time', { precision: 10, scale: 3}),
	memoryUsage: numeric('memory_usage', { precision: 10, scale: 2}),
	cpuUsage: numeric('cpu_usage', { precision: 5, scale: 2}),

	// Resolution
	isResolved: boolean('is_resolved').default(false),
	resolvedAt: timestamp('resolved_at'),
	resolvedBy: text('resolved_by'),

	// Audit
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').defaultNow(),
});

export const monitoringDashboards = pgTable('monitoring_dashboards', {
	id: serial('id').primaryKey(),
	userId: text('user_id').notNull(),

	// Dashboard details
	name: text('name').notNull(),
	description: text('description'),
	category: text('category').default('overview'),

	// Layout and widgets
	layout: jsonb('layout').notNull(), // Grid layout configuration
	widgets: jsonb('widgets').notNull(), // Array of widget configurations

	// Visibility and sharing
	isPublic: boolean('is_public').default(false),
	sharedWith: jsonb('shared_with').$defaultFn(() => []), // Array of user IDs
	shareToken: text('share_token'),

	// Settings
	refreshInterval: serial('refresh_interval').default(60), // seconds
	timeRange: text('time_range').default('1h'), // 1h, 24h, 7d, 30d, etc.
	autoRefresh: boolean('auto_refresh').default(true),

	// Status
	isActive: boolean('is_active').default(true),
	isDefault: boolean('is_default').default(false),

	// Audit
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').defaultNow(),
});

export const monitoringIntegrations = pgTable('monitoring_integrations', {
	id: serial('id').primaryKey(),
	userId: text('user_id').notNull(),

	// Integration details
	name: text('name').notNull(),
	type: text('type').notNull(), // prometheus, grafana, datadog, new_relic, etc.
	description: text('description'),

	// Configuration
	endpoint: text('endpoint'),
	apiKey: text('api_key'),
	username: text('username'),
	password: text('password'),

	// Status and health
	isActive: boolean('is_active').default(true),
	isVerified: boolean('is_verified').default(false),
	lastHealthCheck: timestamp('last_health_check'),
	healthStatus: text('health_status').default('unknown'),

	// Metrics collection
	metricsPrefix: text('metrics_prefix'),
	collectionInterval: serial('collection_interval').default(60), // seconds
	lastCollectionAt: timestamp('last_collection_at'),

	// Alert integration
	alertWebhook: text('alert_webhook'),
	alertChannels: jsonb('alert_channels').$defaultFn(() => []),

	// Audit
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').defaultNow(),
});

export const monitoringReports = pgTable('monitoring_reports', {
	id: serial('id').primaryKey(),
	userId: text('user_id').notNull(),

	// Report details
	name: text('name').notNull(),
	description: text('description'),
	type: text('type').notNull(), // performance, availability, error_rate, etc.

	// Report configuration
	metrics: jsonb('metrics').notNull(), // Metrics to include
	timeRange: text('time_range').default('24h'),
	groupBy: jsonb('group_by').$defaultFn(() => ['hour']), // hour, day, week, etc.
	filters: jsonb('filters'),

	// Scheduling
	isScheduled: boolean('is_scheduled').default(false),
	schedule: text('schedule'), // cron expression
	recipients: jsonb('recipients').$defaultFn(() => []),

	// Format and delivery
	format: text('format').default('pdf'), // pdf, csv, json, html
	deliveryMethod: text('delivery_method').default('email'), // email, webhook, dashboard

	// Status
	status: text('status').default('active'),
	lastGeneratedAt: timestamp('last_generated_at'),
	nextGenerationAt: timestamp('next_generation_at'),

	// Audit
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').defaultNow(),
});
