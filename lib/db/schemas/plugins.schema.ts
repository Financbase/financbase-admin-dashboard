import { pgTable, serial, text, timestamp, boolean, jsonb, integer, primaryKey } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users.schema';
import { organizations } from './organizations.schema';

// Marketplace Plugins Table - Available plugins in the marketplace
export const marketplacePlugins = pgTable('financbase_marketplace_plugins', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description').notNull(),
  shortDescription: text('short_description'),
  version: text('version').notNull().default('1.0.0'),
  author: text('author').notNull(),
  authorEmail: text('author_email'),
  authorWebsite: text('author_website'),
  
  // Plugin metadata
  category: text('category').notNull(), // 'productivity', 'reporting', 'integration', 'automation', 'security'
  tags: jsonb('tags').default([]).notNull(), // Array of tag strings
  icon: text('icon'), // Icon URL or name
  screenshots: jsonb('screenshots').default([]).notNull(), // Array of screenshot URLs
  
  // Plugin details
  features: jsonb('features').default([]).notNull(), // Array of feature descriptions
  requirements: jsonb('requirements').default({}).notNull(), // System requirements
  compatibility: jsonb('compatibility').default({}).notNull(), // Version compatibility
  
  // Pricing and licensing
  isFree: boolean('is_free').default(true).notNull(),
  price: integer('price'), // Price in cents
  currency: text('currency').default('USD'),
  license: text('license').default('MIT'), // MIT, GPL, Commercial, etc.
  
  // Plugin files and configuration
  pluginFile: text('plugin_file'), // URL to plugin package
  manifest: jsonb('manifest').notNull(), // Plugin manifest/configuration
  permissions: jsonb('permissions').default([]).notNull(), // Required permissions
  
  // Status and approval
  isApproved: boolean('is_approved').default(false).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  isOfficial: boolean('is_official').default(false).notNull(),
  
  // Statistics
  downloadCount: integer('download_count').default(0).notNull(),
  installCount: integer('install_count').default(0).notNull(),
  rating: integer('rating').default(0).notNull(), // Average rating (1-5)
  reviewCount: integer('review_count').default(0).notNull(),
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  publishedAt: timestamp('published_at'),
});

export const marketplacePluginsRelations = relations(marketplacePlugins, ({ many }) => ({
  installations: many(installedPlugins),
  reviews: many(pluginReviews),
}));

// Installed Plugins Table - User's installed plugins
export const installedPlugins = pgTable('financbase_installed_plugins', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  organizationId: text('organization_id').references(() => organizations.id, { onDelete: 'cascade' }),
  pluginId: integer('plugin_id').notNull().references(() => marketplacePlugins.id, { onDelete: 'cascade' }),
  
  // Installation details
  version: text('version').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  isEnabled: boolean('is_enabled').default(true).notNull(),
  
  // Plugin settings and configuration
  settings: jsonb('settings').default({}).notNull(),
  permissions: jsonb('permissions').default([]).notNull(),
  
  // Installation tracking
  installedAt: timestamp('installed_at').defaultNow().notNull(),
  lastUpdatedAt: timestamp('last_updated_at'),
  lastUsedAt: timestamp('last_used_at'),
  
  // Usage statistics
  usageCount: integer('usage_count').default(0).notNull(),
  lastError: text('last_error'),
  lastErrorAt: timestamp('last_error_at'),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const installedPluginsRelations = relations(installedPlugins, ({ one, many }) => ({
  user: one(users, { fields: [installedPlugins.userId], references: [users.id] }),
  organization: one(organizations, { fields: [installedPlugins.organizationId], references: [organizations.id] }),
  plugin: one(marketplacePlugins, { fields: [installedPlugins.pluginId], references: [marketplacePlugins.id] }),
  logs: many(pluginLogs),
}));

// Plugin Settings Table - Plugin-specific configuration
export const pluginSettings = pgTable('financbase_plugin_settings', {
  id: serial('id').primaryKey(),
  installationId: integer('installation_id').notNull().references(() => installedPlugins.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  // Settings configuration
  settingKey: text('setting_key').notNull(),
  settingValue: text('setting_value').notNull(),
  settingType: text('setting_type').notNull(), // 'string', 'number', 'boolean', 'json'
  isEncrypted: boolean('is_encrypted').default(false).notNull(),
  
  // Metadata
  description: text('description'),
  isRequired: boolean('is_required').default(false).notNull(),
  defaultValue: text('default_value'),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const pluginSettingsRelations = relations(pluginSettings, ({ one }) => ({
  installation: one(installedPlugins, { fields: [pluginSettings.installationId], references: [installedPlugins.id] }),
  user: one(users, { fields: [pluginSettings.userId], references: [users.id] }),
}));

// Plugin Reviews Table - User reviews and ratings
export const pluginReviews = pgTable('financbase_plugin_reviews', {
  id: serial('id').primaryKey(),
  pluginId: integer('plugin_id').notNull().references(() => marketplacePlugins.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  // Review content
  rating: integer('rating').notNull(), // 1-5 stars
  title: text('title'),
  content: text('content'),
  
  // Review metadata
  isVerified: boolean('is_verified').default(false).notNull(),
  isHelpful: integer('is_helpful').default(0).notNull(), // Number of helpful votes
  
  // Moderation
  isApproved: boolean('is_approved').default(true).notNull(),
  isReported: boolean('is_reported').default(false).notNull(),
  moderationNotes: text('moderation_notes'),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const pluginReviewsRelations = relations(pluginReviews, ({ one }) => ({
  plugin: one(marketplacePlugins, { fields: [pluginReviews.pluginId], references: [marketplacePlugins.id] }),
  user: one(users, { fields: [pluginReviews.userId], references: [users.id] }),
}));

// Plugin Logs Table - Plugin execution and error logs
export const pluginLogs = pgTable('financbase_plugin_logs', {
  id: serial('id').primaryKey(),
  installationId: integer('installation_id').notNull().references(() => installedPlugins.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  // Log details
  level: text('level').notNull(), // 'info', 'warn', 'error', 'debug'
  message: text('message').notNull(),
  context: jsonb('context').default({}).notNull(), // Additional context data
  
  // Execution details
  executionTime: integer('execution_time'), // Execution time in milliseconds
  memoryUsage: integer('memory_usage'), // Memory usage in bytes
  
  // Error details
  errorType: text('error_type'),
  errorStack: text('error_stack'),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const pluginLogsRelations = relations(pluginLogs, ({ one }) => ({
  installation: one(installedPlugins, { fields: [pluginLogs.installationId], references: [installedPlugins.id] }),
  user: one(users, { fields: [pluginLogs.userId], references: [users.id] }),
}));

// Plugin Hooks Table - Plugin event hooks and callbacks
export const pluginHooks = pgTable('financbase_plugin_hooks', {
  id: serial('id').primaryKey(),
  pluginId: integer('plugin_id').notNull().references(() => marketplacePlugins.id, { onDelete: 'cascade' }),
  
  // Hook configuration
  hookName: text('hook_name').notNull(), // 'invoice.created', 'payment.received', etc.
  callbackUrl: text('callback_url').notNull(),
  method: text('method').default('POST').notNull(), // HTTP method
  
  // Hook settings
  isActive: boolean('is_active').default(true).notNull(),
  priority: integer('priority').default(0).notNull(), // Execution priority
  timeout: integer('timeout').default(30000).notNull(), // Timeout in milliseconds
  
  // Security
  secret: text('secret'), // Webhook secret for verification
  headers: jsonb('headers').default({}).notNull(), // Custom headers
  
  // Statistics
  executionCount: integer('execution_count').default(0).notNull(),
  successCount: integer('success_count').default(0).notNull(),
  failureCount: integer('failure_count').default(0).notNull(),
  lastExecutedAt: timestamp('last_executed_at'),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const pluginHooksRelations = relations(pluginHooks, ({ one }) => ({
  plugin: one(marketplacePlugins, { fields: [pluginHooks.pluginId], references: [marketplacePlugins.id] }),
}));

// Plugin Dependencies Table - Plugin dependencies and requirements
export const pluginDependencies = pgTable('financbase_plugin_dependencies', {
  id: serial('id').primaryKey(),
  pluginId: integer('plugin_id').notNull().references(() => marketplacePlugins.id, { onDelete: 'cascade' }),
  dependencyPluginId: integer('dependency_plugin_id').references(() => marketplacePlugins.id, { onDelete: 'cascade' }),
  
  // Dependency details
  dependencyName: text('dependency_name').notNull(),
  dependencyType: text('dependency_type').notNull(), // 'plugin', 'npm', 'system'
  versionConstraint: text('version_constraint').notNull(), // '^1.0.0', '>=2.0.0', etc.
  isRequired: boolean('is_required').default(true).notNull(),
  
  // External dependencies
  externalUrl: text('external_url'),
  externalDescription: text('external_description'),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const pluginDependenciesRelations = relations(pluginDependencies, ({ one }) => ({
  plugin: one(marketplacePlugins, { fields: [pluginDependencies.pluginId], references: [marketplacePlugins.id] }),
  dependencyPlugin: one(marketplacePlugins, { fields: [pluginDependencies.dependencyPluginId], references: [marketplacePlugins.id] }),
}));
