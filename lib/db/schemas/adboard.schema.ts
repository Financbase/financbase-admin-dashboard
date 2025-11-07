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
	boolean,
	numeric,
	integer,
	jsonb,
	pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./users.schema";

// Enums - Using unique names to avoid conflicts with campaigns.schema and ads.schema
export const adboardCampaignStatusEnum = pgEnum("adboard_campaign_status", [
	"draft",
	"active",
	"paused",
	"completed",
]);

export const campaignObjectiveEnum = pgEnum("adboard_campaign_objective", [
	"awareness",
	"traffic",
	"leads",
	"conversions",
]);

export const adboardAdStatusEnum = pgEnum("adboard_ad_status", [
	"draft",
	"active",
	"paused",
	"completed",
]);

export const adboardAdTypeEnum = pgEnum("adboard_ad_type", [
	"image",
	"video",
	"carousel",
	"text",
	"story",
]);

export const platformEnum = pgEnum("adboard_platform", [
	"meta",
	"google",
	"tiktok",
	"twitter",
	"linkedin",
]);

export const audienceTypeEnum = pgEnum("adboard_audience_type", [
	"custom",
	"lookalike",
	"retargeting",
	"interest",
]);

// Adboard Campaigns Table
export const adboardCampaigns = pgTable("adboard_campaigns", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
	name: text("name").notNull(),
	description: text("description"),
	objective: campaignObjectiveEnum("objective").notNull(),
	status: adboardCampaignStatusEnum("status").default("draft").notNull(),
	budget: numeric("budget", { precision: 12, scale: 2 }).notNull(),
	spent: numeric("spent", { precision: 12, scale: 2 }).default("0").notNull(),
	startDate: timestamp("start_date"),
	endDate: timestamp("end_date"),
	targetAudience: jsonb("target_audience"),
	settings: jsonb("settings").default({}).notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Adboard Ads Table
export const adboardAds = pgTable("adboard_ads", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
	campaignId: uuid("campaign_id").notNull().references(() => adboardCampaigns.id, { onDelete: "cascade" }),
	name: text("name").notNull(),
	platform: platformEnum("platform").notNull(),
	adType: adboardAdTypeEnum("ad_type").notNull(),
	status: adboardAdStatusEnum("status").default("draft").notNull(),
	headline: text("headline"),
	description: text("description"),
	callToAction: text("call_to_action"),
	creativeUrl: text("creative_url"),
	landingPageUrl: text("landing_page_url"),
	budget: numeric("budget", { precision: 12, scale: 2 }),
	spent: numeric("spent", { precision: 12, scale: 2 }).default("0").notNull(),
	settings: jsonb("settings").default({}).notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Adboard Budgets Table
export const adboardBudgets = pgTable("adboard_budgets", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
	name: text("name").notNull(),
	description: text("description"),
	totalBudget: numeric("total_budget", { precision: 12, scale: 2 }).notNull(),
	spent: numeric("spent", { precision: 12, scale: 2 }).default("0").notNull(),
	remaining: numeric("remaining", { precision: 12, scale: 2 }).notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	startDate: timestamp("start_date"),
	endDate: timestamp("end_date"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Adboard Performance Metrics Table
export const adboardPerformanceMetrics = pgTable("adboard_performance_metrics", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
	campaignId: uuid("campaign_id").references(() => adboardCampaigns.id, { onDelete: "cascade" }),
	adId: uuid("ad_id").references(() => adboardAds.id, { onDelete: "cascade" }),
	platform: platformEnum("platform").notNull(),
	date: timestamp("date").notNull(),
	impressions: numeric("impressions", { precision: 12, scale: 0 }).default("0").notNull(),
	clicks: numeric("clicks", { precision: 12, scale: 0 }).default("0").notNull(),
	conversions: numeric("conversions", { precision: 12, scale: 0 }).default("0").notNull(),
	spend: numeric("spend", { precision: 12, scale: 2 }).default("0").notNull(),
	revenue: numeric("revenue", { precision: 12, scale: 2 }).default("0").notNull(),
	ctr: numeric("ctr", { precision: 5, scale: 4 }).default("0").notNull(),
	cpc: numeric("cpc", { precision: 8, scale: 2 }).default("0").notNull(),
	cpm: numeric("cpm", { precision: 8, scale: 2 }).default("0").notNull(), // Cost per mille (thousand impressions)
	cpa: numeric("cpa", { precision: 8, scale: 2 }).default("0").notNull(),
	roas: numeric("roas", { precision: 8, scale: 2 }).default("0").notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Adboard Platform Integrations Table
export const adboardPlatformIntegrations = pgTable("adboard_platform_integrations", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
	platform: platformEnum("platform").notNull(),
	accountId: text("account_id").notNull(),
	accountName: text("account_name"),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	tokenExpiresAt: timestamp("token_expires_at"),
	isActive: boolean("is_active").default(true).notNull(),
	lastSyncAt: timestamp("last_sync_at"),
	syncSettings: jsonb("sync_settings").default({}).notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Adboard Campaign Platforms Table (junction table)
export const adboardCampaignPlatforms = pgTable("adboard_campaign_platforms", {
	id: uuid("id").primaryKey().defaultRandom(),
	campaignId: uuid("campaign_id").notNull().references(() => adboardCampaigns.id, { onDelete: "cascade" }),
	platformIntegrationId: uuid("platform_integration_id").notNull().references(() => adboardPlatformIntegrations.id, { onDelete: "cascade" }),
	platformCampaignId: text("platform_campaign_id"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Adboard Audiences Table
export const adboardAudiences = pgTable("adboard_audiences", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
	name: text("name").notNull(),
	description: text("description"),
	audienceType: audienceTypeEnum("audience_type").notNull(),
	platform: platformEnum("platform").notNull(),
	size: integer("size"),
	criteria: jsonb("criteria").default({}).notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Adboard Ad Creatives Table
export const adboardAdCreatives = pgTable("adboard_ad_creatives", {
	id: uuid("id").primaryKey().defaultRandom(),
	adId: uuid("ad_id").notNull().references(() => adboardAds.id, { onDelete: "cascade" }),
	creativeType: text("creative_type").notNull(), // image, video, carousel
	url: text("url").notNull(),
	thumbnailUrl: text("thumbnail_url"),
	metadata: jsonb("metadata").default({}).notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Adboard Ad Placements Table
export const adboardAdPlacements = pgTable("adboard_ad_placements", {
	id: uuid("id").primaryKey().defaultRandom(),
	adId: uuid("ad_id").notNull().references(() => adboardAds.id, { onDelete: "cascade" }),
	placementType: text("placement_type").notNull(), // feed, story, reels, etc.
	platform: platformEnum("platform").notNull(),
	settings: jsonb("settings").default({}).notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Legacy alias for backward compatibility
export const adboardPerformance = adboardPerformanceMetrics;

// Type exports
export type AdboardCampaign = typeof adboardCampaigns.$inferSelect;
export type NewAdboardCampaign = typeof adboardCampaigns.$inferInsert;
export type AdboardAd = typeof adboardAds.$inferSelect;
export type NewAdboardAd = typeof adboardAds.$inferInsert;
export type AdboardBudget = typeof adboardBudgets.$inferSelect;
export type NewAdboardBudget = typeof adboardBudgets.$inferInsert;
export type AdboardPerformanceMetric = typeof adboardPerformanceMetrics.$inferSelect;
export type NewAdboardPerformanceMetric = typeof adboardPerformanceMetrics.$inferInsert;
export type AdboardPlatformIntegration = typeof adboardPlatformIntegrations.$inferSelect;
export type NewAdboardPlatformIntegration = typeof adboardPlatformIntegrations.$inferInsert;
export type AdboardCampaignPlatform = typeof adboardCampaignPlatforms.$inferSelect;
export type NewAdboardCampaignPlatform = typeof adboardCampaignPlatforms.$inferInsert;
export type AdboardAudience = typeof adboardAudiences.$inferSelect;
export type NewAdboardAudience = typeof adboardAudiences.$inferInsert;
export type AdboardAdCreative = typeof adboardAdCreatives.$inferSelect;
export type NewAdboardAdCreative = typeof adboardAdCreatives.$inferInsert;
export type AdboardAdPlacement = typeof adboardAdPlacements.$inferSelect;
export type NewAdboardAdPlacement = typeof adboardAdPlacements.$inferInsert;

// Relations
export const adboardCampaignsRelations = relations(adboardCampaigns, ({ many }) => ({
	ads: many(adboardAds),
	performanceMetrics: many(adboardPerformanceMetrics),
	campaignPlatforms: many(adboardCampaignPlatforms),
}));

export const adboardAdsRelations = relations(adboardAds, ({ one, many }) => ({
	campaign: one(adboardCampaigns, {
		fields: [adboardAds.campaignId],
		references: [adboardCampaigns.id],
	}),
	performanceMetrics: many(adboardPerformanceMetrics),
	creatives: many(adboardAdCreatives),
	placements: many(adboardAdPlacements),
}));

export const adboardPerformanceMetricsRelations = relations(adboardPerformanceMetrics, ({ one }) => ({
	campaign: one(adboardCampaigns, {
		fields: [adboardPerformanceMetrics.campaignId],
		references: [adboardCampaigns.id],
	}),
	ad: one(adboardAds, {
		fields: [adboardPerformanceMetrics.adId],
		references: [adboardAds.id],
	}),
}));

export const adboardPlatformIntegrationsRelations = relations(adboardPlatformIntegrations, ({ many }) => ({
	campaignPlatforms: many(adboardCampaignPlatforms),
}));

export const adboardCampaignPlatformsRelations = relations(adboardCampaignPlatforms, ({ one }) => ({
	campaign: one(adboardCampaigns, {
		fields: [adboardCampaignPlatforms.campaignId],
		references: [adboardCampaigns.id],
	}),
	platformIntegration: one(adboardPlatformIntegrations, {
		fields: [adboardCampaignPlatforms.platformIntegrationId],
		references: [adboardPlatformIntegrations.id],
	}),
}));

export const adboardAdCreativesRelations = relations(adboardAdCreatives, ({ one }) => ({
	ad: one(adboardAds, {
		fields: [adboardAdCreatives.adId],
		references: [adboardAds.id],
	}),
}));

export const adboardAdPlacementsRelations = relations(adboardAdPlacements, ({ one }) => ({
	ad: one(adboardAds, {
		fields: [adboardAdPlacements.adId],
		references: [adboardAds.id],
	}),
}));

