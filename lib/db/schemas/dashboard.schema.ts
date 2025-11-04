/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { pgTable, serial, text, timestamp, boolean, jsonb, integer, primaryKey } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users.schema';
import { organizations } from './organizations.schema';

// Custom Dashboards Table - User-created dashboards
export const customDashboards = pgTable('financbase_custom_dashboards', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  organizationId: text('organization_id').references(() => organizations.id, { onDelete: 'cascade' }),
  
  // Dashboard details
  name: text('name').notNull(),
  description: text('description'),
  isDefault: boolean('is_default').default(false).notNull(),
  isPublic: boolean('is_public').default(false).notNull(),
  
  // Layout configuration
  layout: jsonb('layout').notNull(), // Grid layout configuration
  widgets: jsonb('widgets').notNull(), // Widget configurations
  settings: jsonb('settings').default({}).notNull(), // Dashboard settings
  
  // Appearance
  theme: text('theme').default('light').notNull(), // 'light', 'dark', 'auto'
  colorScheme: text('color_scheme').default('blue').notNull(),
  
  // Permissions
  permissions: jsonb('permissions').default({}).notNull(), // Access permissions
  
  // Statistics
  viewCount: integer('view_count').default(0).notNull(),
  lastViewedAt: timestamp('last_viewed_at'),
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const customDashboardsRelations = relations(customDashboards, ({ one, many }) => ({
  user: one(users, { fields: [customDashboards.userId], references: [users.id] }),
  organization: one(organizations, { fields: [customDashboards.organizationId], references: [organizations.id] }),
  widgets: many(dashboardWidgets),
  shares: many(dashboardShares),
}));

// Dashboard Widgets Table - Individual widgets on dashboards
export const dashboardWidgets = pgTable('financbase_dashboard_widgets', {
  id: serial('id').primaryKey(),
  dashboardId: integer('dashboard_id').notNull().references(() => customDashboards.id, { onDelete: 'cascade' }),
  
  // Widget details
  type: text('type').notNull(), // 'chart', 'table', 'metric', 'text', 'image', 'iframe'
  title: text('title').notNull(),
  description: text('description'),
  
  // Position and size
  position: jsonb('position').notNull(), // { x, y, w, h }
  size: jsonb('size').notNull(), // { width, height }
  
  // Widget configuration
  config: jsonb('config').notNull(), // Widget-specific configuration
  dataSource: text('data_source'), // Data source identifier
  filters: jsonb('filters').default({}).notNull(), // Applied filters
  
  // Appearance
  backgroundColor: text('background_color'),
  borderColor: text('border_color'),
  textColor: text('text_color'),
  
  // Behavior
  refreshInterval: integer('refresh_interval'), // Auto-refresh interval in seconds
  isCollapsible: boolean('is_collapsible').default(true).notNull(),
  isResizable: boolean('is_resizable').default(true).notNull(),
  isMovable: boolean('is_movable').default(true).notNull(),
  
  // Status
  isVisible: boolean('is_visible').default(true).notNull(),
  isLocked: boolean('is_locked').default(false).notNull(),
  
  // Statistics
  viewCount: integer('view_count').default(0).notNull(),
  lastUpdatedAt: timestamp('last_updated_at'),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const dashboardWidgetsRelations = relations(dashboardWidgets, ({ one, many }) => ({
  dashboard: one(customDashboards, { fields: [dashboardWidgets.dashboardId], references: [customDashboards.id] }),
  data: many(dashboardWidgetData),
}));

// Dashboard Widget Data Table - Cached widget data
export const dashboardWidgetData = pgTable('financbase_dashboard_widget_data', {
  id: serial('id').primaryKey(),
  widgetId: integer('widget_id').notNull().references(() => dashboardWidgets.id, { onDelete: 'cascade' }),
  
  // Data details
  data: jsonb('data').notNull(), // Cached widget data
  dataHash: text('data_hash').notNull(), // Hash for cache invalidation
  dataSource: text('data_source').notNull(), // Source of the data
  
  // Cache metadata
  expiresAt: timestamp('expires_at').notNull(),
  isStale: boolean('is_stale').default(false).notNull(),
  
  // Data metadata
  recordCount: integer('record_count').default(0).notNull(),
  dataSize: integer('data_size').default(0).notNull(), // Size in bytes
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const dashboardWidgetDataRelations = relations(dashboardWidgetData, ({ one }) => ({
  widget: one(dashboardWidgets, { fields: [dashboardWidgetData.widgetId], references: [dashboardWidgets.id] }),
}));

// Dashboard Shares Table - Dashboard sharing permissions
export const dashboardShares = pgTable('financbase_dashboard_shares', {
  id: serial('id').primaryKey(),
  dashboardId: integer('dashboard_id').notNull().references(() => customDashboards.id, { onDelete: 'cascade' }),
  
  // Share details
  shareType: text('share_type').notNull(), // 'user', 'organization', 'public', 'link'
  shareWith: text('share_with'), // User ID, organization ID, or public token
  shareToken: text('share_token').unique(), // For link sharing
  
  // Permissions
  canView: boolean('can_view').default(true).notNull(),
  canEdit: boolean('can_edit').default(false).notNull(),
  canShare: boolean('can_share').default(false).notNull(),
  canExport: boolean('can_export').default(false).notNull(),
  
  // Access control
  expiresAt: timestamp('expires_at'), // Optional expiration
  password: text('password'), // Optional password protection
  maxViews: integer('max_views'), // Optional view limit
  
  // Statistics
  viewCount: integer('view_count').default(0).notNull(),
  lastAccessedAt: timestamp('last_accessed_at'),
  
  // Status
  isActive: boolean('is_active').default(true).notNull(),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const dashboardSharesRelations = relations(dashboardShares, ({ one }) => ({
  dashboard: one(customDashboards, { fields: [dashboardShares.dashboardId], references: [customDashboards.id] }),
}));

// Widget Templates Table - Pre-built widget templates
export const widgetTemplates = pgTable('financbase_widget_templates', {
  id: serial('id').primaryKey(),
  
  // Template details
  name: text('name').notNull(),
  description: text('description'),
  category: text('category').notNull(), // 'financial', 'analytics', 'operational', 'custom'
  
  // Widget configuration
  type: text('type').notNull(),
  defaultConfig: jsonb('default_config').notNull(),
  defaultSize: jsonb('default_size').notNull(),
  
  // Template metadata
  isOfficial: boolean('is_official').default(false).notNull(),
  isPublic: boolean('is_public').default(true).notNull(),
  author: text('author'),
  
  // Usage statistics
  usageCount: integer('usage_count').default(0).notNull(),
  rating: integer('rating').default(0).notNull(), // Average rating (1-5)
  reviewCount: integer('review_count').default(0).notNull(),
  
  // Requirements
  dataRequirements: jsonb('data_requirements').default([]).notNull(), // Required data sources
  permissions: jsonb('permissions').default([]).notNull(), // Required permissions
  
  // Status
  isActive: boolean('is_active').default(true).notNull(),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Dashboard Analytics Table - Dashboard usage analytics
export const dashboardAnalytics = pgTable('financbase_dashboard_analytics', {
  id: serial('id').primaryKey(),
  dashboardId: integer('dashboard_id').notNull().references(() => customDashboards.id, { onDelete: 'cascade' }),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }),
  
  // Analytics data
  eventType: text('event_type').notNull(), // 'view', 'edit', 'share', 'export'
  eventData: jsonb('event_data').default({}).notNull(),
  
  // Session data
  sessionId: text('session_id'),
  userAgent: text('user_agent'),
  ipAddress: text('ip_address'),
  referrer: text('referrer'),
  
  // Timing
  duration: integer('duration'), // Event duration in milliseconds
  timestamp: timestamp('timestamp').defaultNow().notNull(),
});

export const dashboardAnalyticsRelations = relations(dashboardAnalytics, ({ one }) => ({
  dashboard: one(customDashboards, { fields: [dashboardAnalytics.dashboardId], references: [customDashboards.id] }),
  user: one(users, { fields: [dashboardAnalytics.userId], references: [users.id] }),
}));
