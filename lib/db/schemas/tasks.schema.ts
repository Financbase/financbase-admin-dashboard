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
	numeric,
	integer,
} from "drizzle-orm/pg-core";
import { users } from "./users.schema";

// Note: Database uses existing task_status enum with values: 'pending', 'in_progress', 'completed', 'cancelled', 'overdue'
// Projects table uses INTEGER id, not UUID
// Using text with CHECK constraint to match existing enum values

// Define tasks table with self-reference
export const tasks = pgTable("tasks", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: uuid("user_id").notNull().references(() => users.id),
	projectId: integer("project_id").notNull(), // INTEGER reference to projects(id)
	parentTaskId: uuid("parent_task_id"), // Self-reference - foreign key constraint added separately
	
	// Task details
	title: text("title").notNull(),
	description: text("description"),
	status: text("status").default("pending").notNull(), // Uses existing task_status enum
	priority: text("priority").default("medium").notNull(), // Text with CHECK constraint
	
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
