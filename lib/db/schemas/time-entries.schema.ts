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
import { projects } from "./projects.schema";

export const timeEntryStatusEnum = pgEnum("time_entry_status", [
	"draft",
	"running",
	"paused",
	"completed",
	"approved",
	"billed"
]);

export const timeEntries = pgTable("time_entries", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: uuid("user_id").notNull().references(() => users.id),
	projectId: uuid("project_id").notNull().references(() => projects.id),
	
	// Time tracking
	description: text("description").notNull(),
	startTime: timestamp("start_time").notNull(),
	endTime: timestamp("end_time"),
	duration: numeric("duration", { precision: 8, scale: 2 }), // in hours
	status: timeEntryStatusEnum("status").default("draft").notNull(),
	
	// Billing
	isBillable: boolean("is_billable").default(true),
	hourlyRate: numeric("hourly_rate", { precision: 8, scale: 2 }),
	totalAmount: numeric("total_amount", { precision: 12, scale: 2 }),
	currency: text("currency").default("USD").notNull(),
	
	// Approval workflow
	requiresApproval: boolean("requires_approval").default(false),
	isApproved: boolean("is_approved").default(false),
	approvedBy: uuid("approved_by"),
	approvedAt: timestamp("approved_at"),
	
	// Billing status
	isBilled: boolean("is_billed").default(false),
	billedAt: timestamp("billed_at"),
	invoiceId: uuid("invoice_id"),
	
	// Additional data
	tags: text("tags"), // JSON array of tags
	metadata: text("metadata"), // JSON string for additional data
	notes: text("notes"),
	
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow(),
});

export type TimeEntry = typeof timeEntries.$inferSelect;
export type NewTimeEntry = typeof timeEntries.$inferInsert;
