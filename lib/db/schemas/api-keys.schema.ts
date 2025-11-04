/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

// API Key Management System Schemas

import { pgTable, uuid, text, timestamp, boolean, integer, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Enums for API key system
export const apiKeyStatus = pgEnum("api_key_status", ["active", "inactive", "revoked", "expired"]);
export const apiKeyType = pgEnum("api_key_type", ["production", "development", "testing"]);
export const apiKeyScope = pgEnum("api_key_scope", ["read", "write", "admin"]);

// User API Keys table
export const userApiKeys = pgTable("user_api_keys", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: uuid("user_id").notNull(),
	name: text("name").notNull(),
	description: text("description"),
	keyHash: text("key_hash").notNull(),
	keyPrefix: text("key_prefix").notNull(),
	keySuffix: text("key_suffix").notNull(),
	type: apiKeyType("type").default("production"),
	scopes: apiKeyScope("scopes").array().default(["read", "write"]),
	status: apiKeyStatus("status").default("active"),
	lastUsedAt: timestamp("last_used_at"),
	expiresAt: timestamp("expires_at"),
	rateLimitPerMinute: integer("rate_limit_per_minute").default(1000),
	rateLimitPerHour: integer("rate_limit_per_hour").default(10000),
	usageCount: integer("usage_count").default(0),
	usageToday: integer("usage_today").default(0),
	usageThisMonth: integer("usage_this_month").default(0),
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow(),
	createdBy: uuid("created_by"),
	lastUsedIp: text("last_used_ip"),
	lastUsedUserAgent: text("last_used_user_agent"),
	metadata: jsonb("metadata"),
});

// API Key Usage Logs table
export const apiKeyUsageLogs = pgTable("api_key_usage_logs", {
	id: uuid("id").primaryKey().defaultRandom(),
	apiKeyId: uuid("api_key_id").references(() => userApiKeys.id, { onDelete: "cascade" }),
	endpoint: text("endpoint").notNull(),
	method: text("method").notNull(),
	statusCode: integer("status_code").notNull(),
	responseTimeMs: integer("response_time_ms"),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	requestSizeBytes: integer("request_size_bytes"),
	responseSizeBytes: integer("response_size_bytes"),
	errorMessage: text("error_message"),
	createdAt: timestamp("created_at").defaultNow(),
});

// Security Settings table
export const userSecuritySettings = pgTable("user_security_settings", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: uuid("user_id").notNull(),
	twoFactorEnabled: boolean("two_factor_enabled").default(false),
	loginNotifications: boolean("login_notifications").default(true),
	suspiciousActivityAlerts: boolean("suspicious_activity_alerts").default(true),
	apiKeyNotifications: boolean("api_key_notifications").default(true),
	sessionTimeoutMinutes: integer("session_timeout_minutes").default(480),
	maxConcurrentSessions: integer("max_concurrent_sessions").default(5),
	requirePasswordChangeDays: integer("require_password_change_days").default(90),
	allowedIps: text("allowed_ips").array(),
	blockedIps: text("blocked_ips").array(),
	trustedDevices: jsonb("trusted_devices"),
	securityQuestions: jsonb("security_questions"),
	backupCodes: text("backup_codes").array(),
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const userApiKeysRelations = relations(userApiKeys, ({ many }) => ({
	usageLogs: many(apiKeyUsageLogs),
}));

export const apiKeyUsageLogsRelations = relations(apiKeyUsageLogs, ({ one }) => ({
	apiKey: one(userApiKeys, {
		fields: [apiKeyUsageLogs.apiKeyId],
		references: [userApiKeys.id],
	}),
}));

// Types
export type UserApiKey = typeof userApiKeys.$inferSelect;
export type NewUserApiKey = typeof userApiKeys.$inferInsert;
export type ApiKeyUsageLog = typeof apiKeyUsageLogs.$inferSelect;
export type NewApiKeyUsageLog = typeof apiKeyUsageLogs.$inferInsert;
export type UserSecuritySettings = typeof userSecuritySettings.$inferSelect;
export type NewUserSecuritySettings = typeof userSecuritySettings.$inferInsert;
