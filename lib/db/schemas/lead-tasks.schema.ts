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
import { leads } from "./leads.schema";

export const taskStatusEnum = pgEnum("task_status", [
	"pending",
	"in_progress",
	"completed",
	"cancelled",
	"overdue"
]);

export const taskPriorityEnum = pgEnum("task_priority", [
	"low",
	"medium",
	"high",
	"urgent"
]);

export const leadTasks = pgTable("lead_tasks", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: uuid("user_id").notNull().references(() => users.id),
	leadId: uuid("lead_id").notNull().references(() => leads.id),
	
	// Task details
	title: text("title").notNull(),
	description: text("description"),
	status: taskStatusEnum("status").default("pending").notNull(),
	priority: taskPriorityEnum("priority").default("medium").notNull(),
	
	// Task scheduling
	dueDate: timestamp("due_date"),
	completedDate: timestamp("completed_date"),
	reminderDate: timestamp("reminder_date"),
	
	// Task assignment
	assignedTo: uuid("assigned_to"), // User ID of assigned person
	
	// Task tracking
	isRecurring: boolean("is_recurring").default(false),
	recurrencePattern: text("recurrence_pattern"), // daily, weekly, monthly, etc.
	parentTaskId: uuid("parent_task_id"), // For subtasks
	
	// Additional data
	tags: text("tags"), // JSON array of tags
	metadata: text("metadata"), // JSON string for additional data
	notes: text("notes"),
	
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow(),
});

export type LeadTask = typeof leadTasks.$inferSelect;
export type NewLeadTask = typeof leadTasks.$inferInsert;
