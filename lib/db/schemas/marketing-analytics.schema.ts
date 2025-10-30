import {
	pgTable,
	text,
	timestamp,
	uuid,
	numeric,
	pgEnum,
	index,
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

export type CampaignAnalyticsDaily = typeof campaignAnalyticsDaily.$inferSelect;
export type NewCampaignAnalyticsDaily = typeof campaignAnalyticsDaily.$inferInsert;
export type MarketingAnalyticsCache = typeof marketingAnalyticsCache.$inferSelect;
export type NewMarketingAnalyticsCache = typeof marketingAnalyticsCache.$inferInsert;

