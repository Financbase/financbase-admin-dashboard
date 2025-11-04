/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

// User Preferences System Schemas

import { pgTable, uuid, text, timestamp, boolean, pgEnum, jsonb } from "drizzle-orm/pg-core";

// Enums for user preferences
export const theme = pgEnum("theme", ["light", "dark", "system"]);
export const language = pgEnum("language", ["en", "es", "fr", "de", "it", "pt", "ja", "ko", "zh"]);
export const timezone = pgEnum("timezone", [
	"UTC",
	"America/New_York",
	"America/Chicago",
	"America/Denver",
	"America/Los_Angeles",
	"Europe/London",
	"Europe/Paris",
	"Europe/Berlin",
	"Asia/Tokyo",
	"Asia/Shanghai",
	"Asia/Kolkata",
	"Australia/Sydney",
	"Pacific/Auckland"
]);
export const dateFormat = pgEnum("date_format", ["MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD", "DD MMM YYYY"]);
export const timeFormat = pgEnum("time_format", ["12h", "24h"]);
export const currency = pgEnum("currency", ["USD", "EUR", "GBP", "JPY", "CAD", "AUD", "CHF", "CNY", "INR", "BRL"]);
export const numberFormat = pgEnum("number_format", ["1,234.56", "1.234,56", "1 234.56", "1'234.56"]);

// User Preferences table
export const userPreferences = pgTable("user_preferences", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: uuid("user_id").notNull().unique(),

	// Appearance preferences
	theme: theme("theme").default("system"),
	sidebarCollapsed: boolean("sidebar_collapsed").default(false),
	compactMode: boolean("compact_mode").default(false),
	highContrast: boolean("high_contrast").default(false),
	fontSize: text("font_size", { enum: ["small", "medium", "large"] }).default("medium"),

	// Language and region preferences
	language: language("language").default("en"),
	timezone: timezone("timezone").default("UTC"),
	dateFormat: dateFormat("date_format").default("MM/DD/YYYY"),
	timeFormat: timeFormat("time_format").default("12h"),
	currency: currency("currency").default("USD"),
	numberFormat: numberFormat("number_format").default("1,234.56"),

	// Dashboard preferences
	defaultDashboard: text("default_dashboard").default("overview"),
	chartsEnabled: boolean("charts_enabled").default(true),
	analyticsEnabled: boolean("analytics_enabled").default(true),
	autoRefresh: boolean("auto_refresh").default(true),
	refreshInterval: text("refresh_interval", { enum: ["30s", "1m", "5m", "15m", "30m"] }).default("5m"),

	// Notification preferences
	emailNotifications: boolean("email_notifications").default(true),
	pushNotifications: boolean("push_notifications").default(true),
	desktopNotifications: boolean("desktop_notifications").default(false),
	notificationSounds: boolean("notification_sounds").default(true),
	weeklyDigest: boolean("weekly_digest").default(true),
	monthlyReport: boolean("monthly_report").default(true),

	// Privacy preferences
	analyticsTracking: boolean("analytics_tracking").default(true),
	errorReporting: boolean("error_reporting").default(true),
	usageStats: boolean("usage_stats").default(false),
	marketingEmails: boolean("marketing_emails").default(false),
	dataExport: boolean("data_export").default(true),

	// Advanced preferences
	betaFeatures: boolean("beta_features").default(false),
	experimentalFeatures: boolean("experimental_features").default(false),
	developerMode: boolean("developer_mode").default(false),
	apiAccess: boolean("api_access").default(false),

	// Custom preferences (JSON for flexible extension)
	customPreferences: jsonb("custom_preferences").default({}),

	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow(),
});

// Notification Preferences table (for detailed notification settings)
export const notificationPreferences = pgTable("notification_preferences", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: uuid("user_id").notNull().unique(),

	// Email notification preferences
	emailInvoices: boolean("email_invoices").default(true),
	emailPayments: boolean("email_payments").default(true),
	emailReports: boolean("email_reports").default(true),
	emailSecurity: boolean("email_security").default(true),
	emailUpdates: boolean("email_updates").default(true),
	emailMarketing: boolean("email_marketing").default(false),

	// Push notification preferences
	pushInvoices: boolean("push_invoices").default(false),
	pushPayments: boolean("push_payments").default(true),
	pushReports: boolean("push_reports").default(false),
	pushSecurity: boolean("push_security").default(true),
	pushUpdates: boolean("push_updates").default(false),

	// In-app notification preferences
	inAppInvoices: boolean("in_app_invoices").default(true),
	inAppPayments: boolean("in_app_payments").default(true),
	inAppReports: boolean("in_app_reports").default(true),
	inAppSecurity: boolean("in_app_security").default(true),
	inAppUpdates: boolean("in_app_updates").default(true),
	inAppComments: boolean("in_app_comments").default(true),
	inAppMentions: boolean("in_app_mentions").default(true),

	// Quiet hours
	quietHoursEnabled: boolean("quiet_hours_enabled").default(false),
	quietHoursStart: text("quiet_hours_start"), // "22:00"
	quietHoursEnd: text("quiet_hours_end"), // "08:00"
	quietHoursTimezone: timezone("quiet_hours_timezone").default("UTC"),

	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow(),
});

// Privacy Settings table (for detailed privacy controls)
export const privacySettings = pgTable("privacy_settings", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: uuid("user_id").notNull().unique(),

	// Data collection preferences
	analyticsTracking: boolean("analytics_tracking").default(true),
	errorReporting: boolean("error_reporting").default(true),
	performanceMonitoring: boolean("performance_monitoring").default(true),
	usageStatistics: boolean("usage_statistics").default(false),
	crashReports: boolean("crash_reports").default(true),

	// Data sharing preferences
	shareWithPartners: boolean("share_with_partners").default(false),
	shareForResearch: boolean("share_for_research").default(false),
	shareForMarketing: boolean("share_for_marketing").default(false),
	allowPersonalization: boolean("allow_personalization").default(true),

	// Data retention preferences
	dataRetentionPeriod: text("data_retention_period", { enum: ["1year", "2years", "5years", "forever"] }).default("5years"),
	autoDeleteInactive: boolean("auto_delete_inactive").default(false),
	downloadData: boolean("download_data").default(true),
	deleteAccount: boolean("delete_account").default(false),

	// Third-party integrations
	allowThirdPartyIntegrations: boolean("allow_third_party_integrations").default(true),
	requireConsentForNewIntegrations: boolean("require_consent_for_new_integrations").default(true),

	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations (if needed in the future)
// export const userPreferencesRelations = relations(userPreferences, ({ one }) => ({
// 	user: one(users, {
// 		fields: [userPreferences.userId],
// 		references: [users.id],
// 	}),
// }));

// Types
export type UserPreferences = typeof userPreferences.$inferSelect;
export type NewUserPreferences = typeof userPreferences.$inferInsert;
export type NotificationPreferences = typeof notificationPreferences.$inferSelect;
export type NewNotificationPreferences = typeof notificationPreferences.$inferInsert;
export type PrivacySettings = typeof privacySettings.$inferSelect;
export type NewPrivacySettings = typeof privacySettings.$inferInsert;
