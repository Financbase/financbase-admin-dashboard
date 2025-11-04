/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import {
	pgTable,
	text,
	timestamp,
	uuid,
	numeric,
	pgEnum,
	index,
	boolean as pgBoolean,
	integer,
} from "drizzle-orm/pg-core";
import { campaigns } from "./campaigns.schema";

// Enum for analytics cache type
export const analyticsCacheTypeEnum = pgEnum("analytics_cache_type", [
	"overview",
	"campaign_performance",
	"platform_breakdown",
	"daily_metrics",
	"conversion_funnel",
	"audience_insights",
]);

// Enum for contact submission status
export const contactStatusEnum = pgEnum("contact_status", [
	"new",
	"in_progress",
	"resolved",
	"archived",
]);

// Enum for contact submission priority
export const contactPriorityEnum = pgEnum("contact_priority", [
	"low",
	"medium",
	"high",
	"urgent",
]);

// Campaign Analytics Daily - Stores daily aggregated metrics per campaign
export const campaignAnalyticsDaily = pgTable(
	"campaign_analytics_daily",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		campaignId: uuid("campaign_id")
			.notNull()
			.references(() => campaigns.id, { onDelete: "cascade" }),
		
		// Date for this analytics snapshot
		date: timestamp("date").notNull(),
		
		// Performance metrics
		impressions: numeric("impressions", { precision: 12, scale: 0 }).default("0"),
		clicks: numeric("clicks", { precision: 12, scale: 0 }).default("0"),
		conversions: numeric("conversions", { precision: 12, scale: 0 }).default("0"),
		spend: numeric("spend", { precision: 12, scale: 2 }).default("0"),
		revenue: numeric("revenue", { precision: 12, scale: 2 }).default("0"),
		
		// Calculated metrics
		ctr: numeric("ctr", { precision: 5, scale: 4 }).default("0"), // Click-through rate
		cpc: numeric("cpc", { precision: 8, scale: 2 }).default("0"), // Cost per click
		cpa: numeric("cpa", { precision: 8, scale: 2 }).default("0"), // Cost per acquisition
		roas: numeric("roas", { precision: 8, scale: 2 }).default("0"), // Return on ad spend
		cpm: numeric("cpm", { precision: 8, scale: 2 }).default("0"), // Cost per mille
		conversionRate: numeric("conversion_rate", { precision: 5, scale: 4 }).default("0"),
		
		// Platform-specific data stored as JSON
		platform: text("platform"),
		adGroupId: uuid("ad_group_id"),
		adId: uuid("ad_id"),
		
		// Additional metadata
		metadata: text("metadata"), // JSON string for additional data
		
		createdAt: timestamp("created_at").defaultNow(),
		updatedAt: timestamp("updated_at").defaultNow(),
	},
	(table) => ({
		campaignIdIdx: index("campaign_analytics_daily_campaign_id_idx").on(table.campaignId),
		dateIdx: index("campaign_analytics_daily_date_idx").on(table.date),
		platformIdx: index("campaign_analytics_daily_platform_idx").on(table.platform),
		campaignDateIdx: index("campaign_analytics_daily_campaign_date_idx").on(
			table.campaignId,
			table.date
		),
	})
);

// Marketing Analytics Cache - Cached analytics calculations for performance
export const marketingAnalyticsCache = pgTable(
	"marketing_analytics_cache",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		userId: uuid("user_id").notNull(),
		
		// Cache type identifier
		cacheType: analyticsCacheTypeEnum("cache_type").notNull(),
		
		// Cache key (e.g., "overview:2024-01:all" or "campaign:CAMP-001:2024-01")
		cacheKey: text("cache_key").notNull(),
		
		// Cached data as JSON
		cachedData: text("cached_data").notNull(), // JSON string
		
		// Cache expiration
		expiresAt: timestamp("expires_at").notNull(),
		
		// Query parameters that generated this cache
		queryParams: text("query_params"), // JSON string
		
		createdAt: timestamp("created_at").defaultNow(),
		updatedAt: timestamp("updated_at").defaultNow(),
	},
	(table) => ({
		userIdIdx: index("marketing_analytics_cache_user_id_idx").on(table.userId),
		cacheTypeIdx: index("marketing_analytics_cache_type_idx").on(table.cacheType),
		cacheKeyIdx: index("marketing_analytics_cache_key_idx").on(table.cacheKey),
		expiresAtIdx: index("marketing_analytics_cache_expires_at_idx").on(table.expiresAt),
		userCacheKeyIdx: index("marketing_analytics_cache_user_cache_key_idx").on(
			table.userId,
			table.cacheKey
		),
	})
);

// Contact Submissions Table - Public contact form submissions
export const contactSubmissions = pgTable(
	"financbase_contact_submissions",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		
		// Contact information
		name: text("name").notNull(),
		email: text("email").notNull(),
		company: text("company"),
		message: text("message").notNull(),
		
		// Submission metadata
		status: contactStatusEnum("status").default("new").notNull(),
		priority: contactPriorityEnum("priority").default("medium").notNull(),
		
		// Tracking information
		ipAddress: text("ip_address"),
		userAgent: text("user_agent"),
		referrer: text("referrer"),
		source: text("source"), // Where the form was submitted from
		
		// Response tracking
		respondedAt: timestamp("responded_at"),
		responseNotes: text("response_notes"),
		
		// Additional metadata
		metadata: text("metadata"), // JSON string for additional data
		
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at").defaultNow().notNull(),
	},
	(table) => ({
		emailIdx: index("contact_submissions_email_idx").on(table.email),
		statusIdx: index("contact_submissions_status_idx").on(table.status),
		createdAtIdx: index("contact_submissions_created_at_idx").on(table.createdAt),
	})
);

// Marketing Events Table - Track marketing interactions
export const marketingEvents = pgTable(
	"financbase_marketing_events",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		userId: uuid("user_id"),
		sessionId: text("session_id"),
		
		// Event details
		eventType: text("event_type").notNull(), // 'page_view', 'click', 'download', etc.
		component: text("component"), // Component name
		page: text("page"), // Page path
		
		// Event data
		metadata: text("metadata"), // JSON string
		
		// User context
		userAgent: text("user_agent"),
		ipAddress: text("ip_address"),
		referrer: text("referrer"),
		
		createdAt: timestamp("created_at").defaultNow().notNull(),
	},
	(table) => ({
		userIdIdx: index("marketing_events_user_id_idx").on(table.userId),
		eventTypeIdx: index("marketing_events_event_type_idx").on(table.eventType),
		createdAtIdx: index("marketing_events_created_at_idx").on(table.createdAt),
	})
);

// Marketing Stats Table - Aggregated marketing statistics
export const marketingStats = pgTable(
	"financbase_marketing_stats",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		userId: uuid("user_id").notNull(),
		
		// Stat details
		metricName: text("metric_name").notNull(),
		value: numeric("value", { precision: 12, scale: 2 }).notNull(),
		change: numeric("change", { precision: 12, scale: 2 }),
		trend: text("trend"), // JSON array of trend values
		
		// Status
		isActive: pgBoolean("is_active").default(true).notNull(),
		
		// Timestamps
		lastUpdated: timestamp("last_updated").defaultNow().notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
	},
	(table) => ({
		userIdIdx: index("marketing_stats_user_id_idx").on(table.userId),
		metricNameIdx: index("marketing_stats_metric_name_idx").on(table.metricName),
	})
);

// User Feedback Table - User feedback and ratings
export const userFeedback = pgTable(
	"financbase_user_feedback",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		userId: uuid("user_id"),
		
		// Feedback details
		category: text("category").notNull(), // 'bug', 'feature_request', 'general', etc.
		rating: integer("rating"), // 1-5 star rating
		comment: text("comment"),
		isPositive: pgBoolean("is_positive"),
		
		// Context
		component: text("component"),
		page: text("page"),
		
		// User context
		userAgent: text("user_agent"),
		ipAddress: text("ip_address"),
		
		createdAt: timestamp("created_at").defaultNow().notNull(),
	},
	(table) => ({
		userIdIdx: index("user_feedback_user_id_idx").on(table.userId),
		categoryIdx: index("user_feedback_category_idx").on(table.category),
		createdAtIdx: index("user_feedback_created_at_idx").on(table.createdAt),
	})
);

export type CampaignAnalyticsDaily = typeof campaignAnalyticsDaily.$inferSelect;
export type NewCampaignAnalyticsDaily = typeof campaignAnalyticsDaily.$inferInsert;
export type MarketingAnalyticsCache = typeof marketingAnalyticsCache.$inferSelect;
export type NewMarketingAnalyticsCache = typeof marketingAnalyticsCache.$inferInsert;
export type ContactSubmission = typeof contactSubmissions.$inferSelect;
export type NewContactSubmission = typeof contactSubmissions.$inferInsert;
export type MarketingEvent = typeof marketingEvents.$inferSelect;
export type NewMarketingEvent = typeof marketingEvents.$inferInsert;
export type MarketingStat = typeof marketingStats.$inferSelect;
export type NewMarketingStat = typeof marketingStats.$inferInsert;
export type UserFeedback = typeof userFeedback.$inferSelect;
export type NewUserFeedback = typeof userFeedback.$inferInsert;

