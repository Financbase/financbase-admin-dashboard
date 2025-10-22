import { pgTable, serial, text, timestamp, jsonb, boolean, numeric } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const marketplacePlugins = pgTable('marketplace_plugins', {
	id: serial('id').primaryKey(),
	userId: text('user_id').notNull(), // null for public plugins

	// Plugin metadata
	name: text('name').notNull(),
	description: text('description').notNull(),
	version: text('version').notNull(),
	author: text('author').notNull(),
	authorEmail: text('author_email'),
	website: text('website'),
	repository: text('repository'),

	// Plugin details
	category: text('category').notNull(), // finance, reporting, integrations, automation, etc.
	tags: jsonb('tags').$defaultFn(() => []),
	icon: text('icon'),
	screenshots: jsonb('screenshots'),

	// Technical details
	entryPoint: text('entry_point').notNull(), // Main plugin file
	dependencies: jsonb('dependencies'), // Required packages
	configuration: jsonb('configuration'), // Plugin configuration schema
	permissions: jsonb('permissions'), // Required permissions

	// Installation and compatibility
	minPlatformVersion: text('min_platform_version'),
	maxPlatformVersion: text('max_platform_version'),
	supportedFeatures: jsonb('supported_features'),

	// Pricing and licensing
	pricingModel: text('pricing_model').default('free'), // free, freemium, paid, subscription
	price: numeric('price', { precision: 10, scale: 2 }),
	currency: text('currency').default('USD'),
	trialPeriod: serial('trial_period').default(0), // days
	licenseKey: text('license_key'),

	// Status and visibility
	status: text('status').default('pending'), // pending, approved, rejected, suspended
	isPublic: boolean('is_public').default(false),
	isFeatured: boolean('is_featured').default(false),
	isVerified: boolean('is_verified').default(false),

	// Usage statistics
	installationCount: serial('installation_count').default(0),
	rating: numeric('rating', { precision: 3, scale: 2 }).default('0'),
	reviewCount: serial('review_count').default(0),
	lastUsedAt: timestamp('last_used_at'),

	// Security
	securityScanStatus: text('security_scan_status').default('pending'), // pending, passed, failed
	securityScanDate: timestamp('security_scan_date'),
	securityIssues: jsonb('security_issues'),

	// Audit
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').defaultNow(),
});

export const pluginInstallations = pgTable('plugin_installations', {
	id: serial('id').primaryKey(),
	userId: text('user_id').notNull(),
	pluginId: serial('plugin_id').notNull(),

	// Installation details
	version: text('version').notNull(),
	status: text('status').default('active'), // active, inactive, error, updating

	// Configuration
	configuration: jsonb('configuration'), // User-specific plugin settings
	customSettings: jsonb('custom_settings'),

	// Integration
	apiKey: text('api_key'),
	webhookUrl: text('webhook_url'),
	integrationData: jsonb('integration_data'),

	// Usage tracking
	lastUsedAt: timestamp('last_used_at'),
	usageCount: serial('usage_count').default(0),
	errorCount: serial('error_count').default(0),

	// Subscription (for paid plugins)
	subscriptionId: text('subscription_id'),
	subscriptionStatus: text('subscription_status'),
	billingCycle: text('billing_cycle'),

	// Audit
	installedAt: timestamp('installed_at').defaultNow(),
	updatedAt: timestamp('updated_at').defaultNow(),
});

export const pluginReviews = pgTable('plugin_reviews', {
	id: serial('id').primaryKey(),
	pluginId: serial('plugin_id').notNull(),
	userId: text('user_id').notNull(),

	// Review content
	rating: serial('rating').notNull(), // 1-5 stars
	title: text('title'),
	review: text('review'),
	pros: jsonb('pros'),
	cons: jsonb('cons'),

	// Usage context
	version: text('version'),
	usageDuration: serial('usage_duration').default(0), // days

	// Status
	isVerified: boolean('is_verified').default(false),
	isPublic: boolean('is_public').default(true),

	// Moderation
	moderationStatus: text('moderation_status').default('pending'), // pending, approved, rejected
	moderationNotes: text('moderation_notes'),

	// Audit
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').defaultNow(),
});

export const pluginIntegrations = pgTable('plugin_integrations', {
	id: serial('id').primaryKey(),
	pluginId: serial('plugin_id').notNull(),
	userId: text('user_id').notNull(),

	// Integration details
	integrationType: text('integration_type').notNull(), // api, webhook, database, file, etc.
	name: text('name').notNull(),
	description: text('description'),

	// Configuration
	configuration: jsonb('configuration').notNull(),
	credentials: jsonb('credentials'), // Encrypted credentials

	// Connection status
	isConnected: boolean('is_connected').default(false),
	lastConnectionAt: timestamp('last_connection_at'),
	connectionError: text('connection_error'),

	// Data flow
	syncDirection: text('sync_direction').default('bidirectional'), // inbound, outbound, bidirectional
	syncFrequency: text('sync_frequency'), // realtime, hourly, daily, manual

	// Status
	isActive: boolean('is_active').default(true),

	// Audit
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').defaultNow(),
});

export const pluginAnalytics = pgTable('plugin_analytics', {
	id: serial('id').primaryKey(),
	pluginId: serial('plugin_id').notNull(),
	userId: text('user_id').notNull(),

	// Usage metrics
	usageCount: serial('usage_count').default(0),
	errorCount: serial('error_count').default(0),
	performanceScore: numeric('performance_score', { precision: 5, scale: 2 }).default('0'),

	// Resource usage
	memoryUsage: numeric('memory_usage', { precision: 10, scale: 2 }),
	cpuUsage: numeric('cpu_usage', { precision: 5, scale: 2 }),
	apiCalls: serial('api_calls').default(0),

	// Business metrics
	recordsProcessed: serial('records_processed').default(0),
	processingTime: numeric('processing_time', { precision: 10, scale: 3 }),

	// Audit
	recordedAt: timestamp('recorded_at').defaultNow(),
});

export const pluginMarketplace = pgTable('plugin_marketplace', {
	id: serial('id').primaryKey(),

	// Marketplace listing
	title: text('title').notNull(),
	description: text('description').notNull(),
	category: text('category').notNull(),
	tags: jsonb('tags').$defaultFn(() => []),

	// Plugin reference
	pluginId: serial('plugin_id').notNull(),

	// Pricing
	pricingModel: text('pricing_model').notNull(),
	price: numeric('price', { precision: 10, scale: 2 }),
	currency: text('currency').default('USD'),
	trialPeriod: serial('trial_period').default(0),

	// Statistics
	installationCount: serial('installation_count').default(0),
	rating: numeric('rating', { precision: 3, scale: 2 }).default('0'),
	reviewCount: serial('review_count').default(0),

	// Featured and promotion
	isFeatured: boolean('is_featured').default(false),
	isVerified: boolean('is_verified').default(false),
	promotionBanner: text('promotion_banner'),

	// Status
	isActive: boolean('is_active').default(true),
	isApproved: boolean('is_approved').default(false),

	// Audit
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').defaultNow(),
});
