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
import { campaigns } from "./campaigns.schema";
import { adGroups } from "./ad-groups.schema";

export const adStatusEnum = pgEnum("ad_status", [
	"active",
	"paused",
	"removed",
	"under_review",
	"rejected"
]);

export const adTypeEnum = pgEnum("ad_type", [
	"text",
	"image",
	"video",
	"carousel",
	"collection",
	"shopping",
	"responsive"
]);

export const ads = pgTable("ads", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: uuid("user_id").notNull().references(() => users.id),
	campaignId: uuid("campaign_id").notNull().references(() => campaigns.id),
	adGroupId: uuid("ad_group_id").references(() => adGroups.id),
	
	// Ad details
	name: text("name").notNull(),
	headline: text("headline").notNull(),
	description: text("description"),
	callToAction: text("call_to_action"),
	type: adTypeEnum("type").notNull(),
	status: adStatusEnum("status").default("active").notNull(),
	
	// Creative assets
	imageUrl: text("image_url"),
	videoUrl: text("video_url"),
	landingPageUrl: text("landing_page_url"),
	
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
	
	// Quality metrics
	qualityScore: numeric("quality_score", { precision: 3, scale: 1 }).default("0"),
	relevanceScore: numeric("relevance_score", { precision: 3, scale: 1 }).default("0"),
	
	// Additional data
	tags: text("tags"), // JSON array of tags
	metadata: text("metadata"), // JSON string for additional data
	notes: text("notes"),
	
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow(),
});

export type Ad = typeof ads.$inferSelect;
export type NewAd = typeof ads.$inferInsert;
