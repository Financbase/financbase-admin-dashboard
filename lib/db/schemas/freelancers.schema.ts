import {
	pgTable,
	text,
	timestamp,
	uuid,
	numeric,
	pgEnum,
	boolean as pgBoolean,
	jsonb,
} from "drizzle-orm/pg-core";
import { users } from "./users.schema";

export const freelancerStatusEnum = pgEnum("freelancer_status", [
	"available",
	"busy",
	"unavailable",
	"inactive"
]);

export const freelancerSpecialtiesEnum = pgEnum("freelancer_specialty", [
	"web_development",
	"mobile_development",
	"ui_ux_design",
	"graphic_design",
	"digital_marketing",
	"content_writing",
	"data_analysis",
	"project_management",
	"consulting",
	"other"
]);

export const freelancers = pgTable("freelancers", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: uuid("user_id").notNull().references(() => users.id),
	
	// Profile Information
	displayName: text("display_name").notNull(),
	title: text("title").notNull(),
	bio: text("bio"),
	avatarUrl: text("avatar_url"),
	bannerUrl: text("banner_url"),
	
	// Professional Details
	specialties: jsonb("specialties").notNull().default([]), // Array of specialty enums
	skills: jsonb("skills").notNull().default([]), // Array of skill strings
	tools: jsonb("tools").notNull().default([]), // Array of tool names
	
	// Rates and Availability
	hourlyRate: numeric("hourly_rate", { precision: 8, scale: 2 }),
	projectRateMin: numeric("project_rate_min", { precision: 12, scale: 2 }),
	projectRateMax: numeric("project_rate_max", { precision: 12, scale: 2 }),
	currency: text("currency").default("USD").notNull(),
	
	// Availability
	status: freelancerStatusEnum("status").default("available").notNull(),
	availability: text("availability"), // e.g., "2-4 weeks", "ASAP"
	timezone: text("timezone").default("UTC"),
	
	// Experience and Ratings
	yearsExperience: numeric("years_experience", { precision: 3, scale: 1 }),
	rating: numeric("rating", { precision: 3, scale: 2 }).default("0"),
	reviewCount: numeric("review_count", { precision: 6, scale: 0 }).default("0"),
	
	// Portfolio and Links
	portfolioUrl: text("portfolio_url"),
	linkedinUrl: text("linkedin_url"),
	githubUrl: text("github_url"),
	websiteUrl: text("website_url"),
	
	// Location
	country: text("country"),
	city: text("city"),
	remoteWork: pgBoolean("remote_work").default(true),
	
	// Preferences
	preferredProjectTypes: jsonb("preferred_project_types").default([]),
	minProjectBudget: numeric("min_project_budget", { precision: 12, scale: 2 }),
	maxProjectBudget: numeric("max_project_budget", { precision: 12, scale: 2 }),
	
	// Verification and Trust
	isVerified: pgBoolean("is_verified").default(false),
	verificationDate: timestamp("verification_date"),
	identityVerified: pgBoolean("identity_verified").default(false),
	
	// Statistics
	projectsCompleted: numeric("projects_completed", { precision: 6, scale: 0 }).default("0"),
	totalEarnings: numeric("total_earnings", { precision: 15, scale: 2 }).default("0"),
	responseTime: numeric("response_time", { precision: 4, scale: 1 }), // Hours
	
	// Settings
	isPublic: pgBoolean("is_public").default(true),
	allowMessages: pgBoolean("allow_messages").default(true),
	notificationsEnabled: pgBoolean("notifications_enabled").default(true),
	
	// Additional Data
	tags: jsonb("tags").default([]),
	metadata: jsonb("metadata").default({}),
	
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow(),
});

export type Freelancer = typeof freelancers.$inferSelect;
export type NewFreelancer = typeof freelancers.$inferInsert;
