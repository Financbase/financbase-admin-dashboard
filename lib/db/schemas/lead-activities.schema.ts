import {
	pgTable,
	text,
	timestamp,
	uuid,
	numeric,
	pgEnum,
} from "drizzle-orm/pg-core";
import { users } from "./users.schema";
import { leads } from "./leads.schema";

export const activityTypeEnum = pgEnum("activity_type", [
	"call",
	"email",
	"meeting",
	"proposal",
	"follow_up",
	"note",
	"task",
	"conversion",
	"status_change"
]);

export const activityStatusEnum = pgEnum("activity_status", [
	"pending",
	"completed",
	"cancelled",
	"rescheduled"
]);

export const leadActivities = pgTable("lead_activities", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: uuid("user_id").notNull().references(() => users.id),
	leadId: uuid("lead_id").notNull().references(() => leads.id),
	
	// Activity details
	type: activityTypeEnum("type").notNull(),
	subject: text("subject").notNull(),
	description: text("description"),
	status: activityStatusEnum("status").default("pending").notNull(),
	
	// Scheduling
	scheduledDate: timestamp("scheduled_date"),
	completedDate: timestamp("completed_date"),
	duration: numeric("duration", { precision: 8, scale: 2 }), // in minutes
	
	// Activity outcome
	outcome: text("outcome"), // Success, No Answer, Voicemail, etc.
	nextSteps: text("next_steps"),
	notes: text("notes"),
	
	// Follow-up tracking
	requiresFollowUp: boolean("requires_follow_up").default(false),
	followUpDate: timestamp("follow_up_date"),
	
	// Additional data
	metadata: text("metadata"), // JSON string for additional data
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow(),
});

export type LeadActivity = typeof leadActivities.$inferSelect;
export type NewLeadActivity = typeof leadActivities.$inferInsert;
