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

export const taskStatusEnum = pgEnum("task_status", [
	"todo",
	"in_progress",
	"review",
	"completed",
	"cancelled"
]);

export const taskPriorityEnum = pgEnum("task_priority", [
	"low",
	"medium",
	"high",
	"urgent"
]);

export const tasks = pgTable("tasks", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: uuid("user_id").notNull().references(() => users.id),
	projectId: uuid("project_id").notNull().references(() => projects.id),
	parentTaskId: uuid("parent_task_id").references(() => tasks.id), // For subtasks
	
	// Task details
	title: text("title").notNull(),
	description: text("description"),
	status: taskStatusEnum("status").default("todo").notNull(),
	priority: taskPriorityEnum("priority").default("medium").notNull(),
	
	// Task timeline
	dueDate: timestamp("due_date"),
	completedDate: timestamp("completed_date"),
	
	// Time tracking
	estimatedHours: numeric("estimated_hours", { precision: 8, scale: 2 }),
	actualHours: numeric("actual_hours", { precision: 8, scale: 2 }).default("0"),
	
	// Progress tracking
	progress: numeric("progress", { precision: 5, scale: 2 }).default("0"), // 0-100%
	
	// Additional data
	tags: text("tags"), // JSON array of tags
	metadata: text("metadata"), // JSON string for additional data
	notes: text("notes"),
	
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow(),
});

export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;
