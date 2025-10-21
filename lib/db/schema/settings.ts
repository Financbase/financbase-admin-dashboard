/**
 * Database schema for user settings and preferences
 */

import { pgTable, serial, text, boolean, timestamp, jsonb } from 'drizzle-orm/pg-core';

/**
 * Notification Preferences Table
 * Stores user-specific notification settings
 */
export const notificationPreferences = pgTable('notification_preferences', {
	id: serial('id').primaryKey(),
	userId: text('user_id').notNull().unique(),
	
	// Email notifications
	emailInvoices: boolean('email_invoices').default(true).notNull(),
	emailExpenses: boolean('email_expenses').default(true).notNull(),
	emailReports: boolean('email_reports').default(true).notNull(),
	emailAlerts: boolean('email_alerts').default(true).notNull(),
	emailWeeklySummary: boolean('email_weekly_summary').default(true).notNull(),
	emailMonthlySummary: boolean('email_monthly_summary').default(true).notNull(),
	
	// Push notifications
	pushRealtime: boolean('push_realtime').default(false).notNull(),
	pushDaily: boolean('push_daily').default(true).notNull(),
	pushWeekly: boolean('push_weekly').default(false).notNull(),
	
	// In-app notifications
	inAppInvoices: boolean('in_app_invoices').default(true).notNull(),
	inAppExpenses: boolean('in_app_expenses').default(true).notNull(),
	inAppAlerts: boolean('in_app_alerts').default(true).notNull(),
	
	// Third-party integrations
	slackEnabled: boolean('slack_enabled').default(false).notNull(),
	slackWebhook: text('slack_webhook'),
	slackChannels: jsonb('slack_channels').$type<string[]>(),
	
	// Timestamps
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/**
 * User Preferences Table
 * Stores general user preferences
 */
export const userPreferences = pgTable('user_preferences', {
	id: serial('id').primaryKey(),
	userId: text('user_id').notNull().unique(),
	
	// Display preferences
	theme: text('theme').default('system').notNull(), // 'light' | 'dark' | 'system'
	language: text('language').default('en').notNull(),
	timezone: text('timezone').default('America/New_York').notNull(),
	dateFormat: text('date_format').default('MM/DD/YYYY').notNull(),
	timeFormat: text('time_format').default('12h').notNull(), // '12h' | '24h'
	
	// Currency and number formatting
	currency: text('currency').default('USD').notNull(),
	currencySymbol: text('currency_symbol').default('$').notNull(),
	numberFormat: text('number_format').default('en-US').notNull(),
	
	// Dashboard preferences
	defaultDashboard: text('default_dashboard').default('overview').notNull(),
	dashboardLayout: jsonb('dashboard_layout').$type<Record<string, any>>(),
	sidebarCollapsed: boolean('sidebar_collapsed').default(false).notNull(),
	
	// Feature flags
	enabledFeatures: jsonb('enabled_features').$type<string[]>(),
	betaFeatures: boolean('beta_features').default(false).notNull(),
	
	// Timestamps
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/**
 * Privacy Settings Table
 * Stores user privacy and data sharing preferences
 */
export const privacySettings = pgTable('privacy_settings', {
	id: serial('id').primaryKey(),
	userId: text('user_id').notNull().unique(),
	
	// Profile visibility
	profilePublic: boolean('profile_public').default(false).notNull(),
	showEmail: boolean('show_email').default(false).notNull(),
	showPhone: boolean('show_phone').default(false).notNull(),
	
	// Data collection
	analyticsEnabled: boolean('analytics_enabled').default(true).notNull(),
	performanceTracking: boolean('performance_tracking').default(true).notNull(),
	errorReporting: boolean('error_reporting').default(true).notNull(),
	
	// Marketing preferences
	marketingEmails: boolean('marketing_emails').default(false).notNull(),
	productUpdates: boolean('product_updates').default(true).notNull(),
	thirdPartySharing: boolean('third_party_sharing').default(false).notNull(),
	
	// Timestamps
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/**
 * Security Settings Table
 * Stores security-related user settings
 */
export const securitySettings = pgTable('security_settings', {
	id: serial('id').primaryKey(),
	userId: text('user_id').notNull().unique(),
	
	// Two-factor authentication
	twoFactorEnabled: boolean('two_factor_enabled').default(false).notNull(),
	twoFactorMethod: text('two_factor_method'), // 'sms' | 'email' | 'authenticator'
	
	// Session management
	maxSessions: serial('max_sessions').default(5).notNull(),
	sessionTimeout: serial('session_timeout').default(30).notNull(), // minutes
	
	// Login security
	loginNotifications: boolean('login_notifications').default(true).notNull(),
	loginHistory: jsonb('login_history').$type<Array<{
		timestamp: string;
		ipAddress: string;
		userAgent: string;
		location?: string;
	}>>(),
	
	// API access
	apiKeysEnabled: boolean('api_keys_enabled').default(false).notNull(),
	apiKeys: jsonb('api_keys').$type<Array<{
		id: string;
		name: string;
		key: string;
		createdAt: string;
		lastUsed?: string;
	}>>(),
	
	// Timestamps
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Type exports for use in application code
export type NotificationPreferences = typeof notificationPreferences.$inferSelect;
export type NewNotificationPreferences = typeof notificationPreferences.$inferInsert;

export type UserPreferences = typeof userPreferences.$inferSelect;
export type NewUserPreferences = typeof userPreferences.$inferInsert;

export type PrivacySettings = typeof privacySettings.$inferSelect;
export type NewPrivacySettings = typeof privacySettings.$inferInsert;

export type SecuritySettings = typeof securitySettings.$inferSelect;
export type NewSecuritySettings = typeof securitySettings.$inferInsert;

