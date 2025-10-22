import {
	pgTable,
	text,
	timestamp,
	uuid,
	boolean,
	numeric,
	pgEnum,
} from "drizzle-orm/pg-core";
import { users } from "./users.schema";

export const campaignStatusEnum = pgEnum("campaign_status", [
	"draft",
	"active",
	"paused",
	"completed",
	"cancelled"
]);

export const campaignTypeEnum = pgEnum("campaign_type", [
	"search",
	"display",
	"social",
	"video",
	"email",
	"retargeting",
	"affiliate"
]);

export const campaigns = pgTable("campaigns", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: uuid("user_id").notNull().references(() => users.id),
	
	// Campaign details
	name: text("name").notNull(),
	description: text("description"),
	type: campaignTypeEnum("type").notNull(),
	status: campaignStatusEnum("status").default("draft").notNull(),
	
	// Platform and targeting
	platform: text("platform").notNull(), // Google Ads, Facebook, Instagram, etc.
	audience: text("audience"), // Target audience description
	keywords: text("keywords"), // JSON array of keywords
	demographics: text("demographics"), // JSON object with age, gender, location, etc.
	
	// Budget and bidding
	budget: numeric("budget", { precision: 12, scale: 2 }).notNull(),
	dailyBudget: numeric("daily_budget", { precision: 12, scale: 2 }),
	bidStrategy: text("bid_strategy"), // Manual, Auto, Target CPA, etc.
	maxBid: numeric("max_bid", { precision: 8, scale: 2 }),
	
	// Timeline
	startDate: timestamp("start_date").notNull(),
	endDate: timestamp("end_date"),
	
	// Performance tracking
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
	
	// Additional data
	tags: text("tags"), // JSON array of tags
	metadata: text("metadata"), // JSON string for additional data
	notes: text("notes"),
	
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow(),
});

export type Campaign = typeof campaigns.$inferSelect;
export type NewCampaign = typeof campaigns.$inferInsert;
