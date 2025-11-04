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
	boolean as pgBoolean,
	numeric,
	pgEnum,
} from "drizzle-orm/pg-core";
import { users } from "./users.schema";
import { campaigns } from "./campaigns.schema";

export const adGroupStatusEnum = pgEnum("ad_group_status", [
	"active",
	"paused",
	"removed"
]);

export const adGroups = pgTable("ad_groups", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: uuid("user_id").notNull().references(() => users.id),
	campaignId: uuid("campaign_id").notNull().references(() => campaigns.id),
	
	// Ad group details
	name: text("name").notNull(),
	description: text("description"),
	status: adGroupStatusEnum("status").default("active").notNull(),
	
	// Targeting
	keywords: text("keywords"), // JSON array of keywords
	negativeKeywords: text("negative_keywords"), // JSON array of negative keywords
	demographics: text("demographics"), // JSON object with targeting criteria
	
	// Budget and bidding
	budget: numeric("budget", { precision: 12, scale: 2 }),
	dailyBudget: numeric("daily_budget", { precision: 12, scale: 2 }),
	bidStrategy: text("bid_strategy"),
	maxBid: numeric("max_bid", { precision: 8, scale: 2 }),
	
	// Performance tracking
	impressions: numeric("impressions", { precision: 12, scale: 0 }).default("0"),
	clicks: numeric("clicks", { precision: 12, scale: 0 }).default("0"),
	conversions: numeric("conversions", { precision: 12, scale: 0 }).default("0"),
	spend: numeric("spend", { precision: 12, scale: 2 }).default("0"),
	revenue: numeric("revenue", { precision: 12, scale: 2 }).default("0"),
	
	// Calculated metrics
	ctr: numeric("ctr", { precision: 5, scale: 4 }).default("0"),
	cpc: numeric("cpc", { precision: 8, scale: 2 }).default("0"),
	cpa: numeric("cpa", { precision: 8, scale: 2 }).default("0"),
	roas: numeric("roas", { precision: 8, scale: 2 }).default("0"),
	
	// Additional data
	tags: text("tags"), // JSON array of tags
	metadata: text("metadata"), // JSON string for additional data
	notes: text("notes"),
	
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow(),
});

export type AdGroup = typeof adGroups.$inferSelect;
export type NewAdGroup = typeof adGroups.$inferInsert;
