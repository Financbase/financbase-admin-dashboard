import {
	pgTable,
	text,
	timestamp,
	uuid,
	numeric,
	pgEnum,
	boolean as pgBoolean,
} from "drizzle-orm/pg-core";
import { users } from "./users.schema";

export const leadStatusEnum = pgEnum("lead_status", [
	"new",
	"contacted",
	"qualified",
	"proposal",
	"negotiation",
	"closed_won",
	"closed_lost",
	"nurturing"
]);

export const leadSourceEnum = pgEnum("lead_source", [
	"website",
	"referral",
	"social_media",
	"email_campaign",
	"cold_call",
	"trade_show",
	"advertisement",
	"partner",
	"other"
]);

export const leadPriorityEnum = pgEnum("lead_priority", [
	"low",
	"medium",
	"high",
	"urgent"
]);

export const leads = pgTable("leads", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: uuid("user_id").notNull().references(() => users.id),
	
	// Lead details
	firstName: text("first_name").notNull(),
	lastName: text("last_name").notNull(),
	email: text("email").notNull(),
	phone: text("phone"),
	company: text("company"),
	jobTitle: text("job_title"),
	website: text("website"),
	
	// Lead classification
	status: leadStatusEnum("status").default("new").notNull(),
	source: leadSourceEnum("source").notNull(),
	priority: leadPriorityEnum("priority").default("medium").notNull(),
	
	// Lead scoring and qualification
	leadScore: numeric("lead_score", { precision: 3, scale: 0 }).default("0"),
	isQualified: pgBoolean("is_qualified").default(false),
	qualificationNotes: text("qualification_notes"),
	
	// Sales pipeline
	estimatedValue: numeric("estimated_value", { precision: 12, scale: 2 }),
	probability: numeric("probability", { precision: 5, scale: 2 }).default("0"), // 0-100%
	expectedCloseDate: timestamp("expected_close_date"),
	actualCloseDate: timestamp("actual_close_date"),
	
	// Lead tracking
	lastContactDate: timestamp("last_contact_date"),
	nextFollowUpDate: timestamp("next_follow_up_date"),
	contactAttempts: numeric("contact_attempts", { precision: 3, scale: 0 }).default("0"),
	
	// Lead nurturing
	assignedTo: uuid("assigned_to"), // User ID of assigned salesperson
	tags: text("tags"), // JSON array of tags
	notes: text("notes"),
	metadata: text("metadata"), // JSON string for additional data
	
	// Conversion tracking
	convertedToClient: boolean("converted_to_client").default(false),
	clientId: uuid("client_id"), // Reference to clients table if converted
	
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow(),
});

export type Lead = typeof leads.$inferSelect;
export type NewLead = typeof leads.$inferInsert;
