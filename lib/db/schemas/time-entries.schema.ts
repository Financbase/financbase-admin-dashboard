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
	pgEnum,
	boolean as pgBoolean,
	jsonb,
} from "drizzle-orm/pg-core";
import { users } from "./users.schema";
import { projects } from "./projects.schema";
import { employees } from "./employees.schema";
import { hrContractors } from "./hr-contractors.schema";

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
	projectId: uuid("project_id").references(() => projects.id, { onDelete: "set null" }),
	
	// Employee/Contractor linking
	employeeId: uuid("employee_id").references(() => employees.id, { onDelete: "set null" }),
	contractorId: uuid("contractor_id").references(() => hrContractors.id, { onDelete: "set null" }),
	
	// Time tracking
	description: text("description").notNull(),
	startTime: timestamp("start_time", { withTimezone: true }).notNull(),
	endTime: timestamp("end_time", { withTimezone: true }),
	duration: numeric("duration", { precision: 8, scale: 2 }), // in hours
	status: timeEntryStatusEnum("status").default("draft").notNull(),
	
	// Project/Task assignment
	taskId: uuid("task_id"), // Task ID if tracking specific task
	taskName: text("task_name"), // Task name for quick reference
	
	// Billable information
	isBillable: pgBoolean("is_billable").default(true),
	hourlyRate: numeric("hourly_rate", { precision: 8, scale: 2 }),
	totalAmount: numeric("total_amount", { precision: 12, scale: 2 }),
	currency: text("currency").default("USD").notNull(),
	
	// Approval workflow
	requiresApproval: pgBoolean("requires_approval").default(false),
	isApproved: pgBoolean("is_approved").default(false),
	approvedBy: uuid("approved_by"),
	approvedAt: timestamp("approved_at", { withTimezone: true }),
	
	// Billing status
	isBilled: pgBoolean("is_billed").default(false),
	billedAt: timestamp("billed_at", { withTimezone: true }),
	invoiceId: uuid("invoice_id"),
	
	// Additional data
	tags: jsonb("tags"), // Array of tags (JSON)
	metadata: jsonb("metadata"), // Additional JSON data
	notes: text("notes"),
	
	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export type TimeEntry = typeof timeEntries.$inferSelect;
export type NewTimeEntry = typeof timeEntries.$inferInsert;
