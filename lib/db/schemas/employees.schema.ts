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
	jsonb,
	pgEnum,
	boolean as pgBoolean,
} from "drizzle-orm/pg-core";
import { organizations } from "./organizations.schema";

export const employeeStatusEnum = pgEnum("employee_status", [
	"active",
	"on_leave",
	"terminated",
	"suspended",
]);

export const performanceRatingEnum = pgEnum("performance_rating", [
	"excellent",
	"good",
	"satisfactory",
	"needs_improvement",
	"poor",
]);

export const employees = pgTable("employees", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: text("user_id").notNull(), // Clerk user ID
	organizationId: uuid("organization_id")
		.notNull()
		.references(() => organizations.id, { onDelete: "cascade" }),

	// Personal information
	firstName: text("first_name").notNull(),
	lastName: text("last_name").notNull(),
	email: text("email").notNull(),
	phone: text("phone"),
	avatar: text("avatar"),

	// Employment details
	position: text("position").notNull(),
	department: text("department").notNull(),
	managerId: uuid("manager_id").references(() => employees.id, {
		onDelete: "set null",
	}),
	employeeNumber: text("employee_number").unique(),

	// Compensation
	salary: numeric("salary", { precision: 12, scale: 2 }),
	currency: text("currency").default("USD"),
	payFrequency: text("pay_frequency", {
		enum: ["hourly", "weekly", "biweekly", "monthly", "annual"],
	}).default("monthly"),

	// Employment dates
	startDate: timestamp("start_date", { withTimezone: true }).notNull(),
	endDate: timestamp("end_date", { withTimezone: true }),
	lastReviewDate: timestamp("last_review_date", { withTimezone: true }),
	nextReviewDate: timestamp("next_review_date", { withTimezone: true }),

	// Status and performance
	status: employeeStatusEnum("status").notNull().default("active"),
	performance: performanceRatingEnum("performance"),
	performanceNotes: text("performance_notes"),

	// Location
	location: text("location"), // Remote, Office address, etc.
	timezone: text("timezone").default("UTC"),

	// Additional information
	notes: text("notes"),
	tags: jsonb("tags"), // Array of tags
	metadata: jsonb("metadata"), // Additional JSON data

	// Payroll integration
	isPayrollEnabled: pgBoolean("is_payroll_enabled").default(true),
	payrollEmployeeId: text("payroll_employee_id"), // External payroll system ID
	lastPayrollSync: timestamp("last_payroll_sync", { withTimezone: true }),

	// Leave balance tracking
	totalLeaveBalance: numeric("total_leave_balance", { precision: 8, scale: 2 }).default("0"),
	lastLeaveAccrual: timestamp("last_leave_accrual", { withTimezone: true }),

	// Attendance tracking
	isAttendanceTracked: pgBoolean("is_attendance_tracked").default(true),
	attendanceMethod: text("attendance_method", {
		enum: ["clock", "manual", "hybrid"],
	}).default("clock"),
	defaultWorkHours: numeric("default_work_hours", { precision: 8, scale: 2 }).default("8"), // Per day
	overtimeThreshold: numeric("overtime_threshold", { precision: 8, scale: 2 }).default("40"), // Per week

	// Timestamps
	createdAt: timestamp("created_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
});

export const departments = pgTable("departments", {
	id: uuid("id").primaryKey().defaultRandom(),
	organizationId: uuid("organization_id")
		.notNull()
		.references(() => organizations.id, { onDelete: "cascade" }),
	name: text("name").notNull(),
	description: text("description"),
	headId: uuid("head_id").references(() => employees.id, { onDelete: "set null" }),
	budget: numeric("budget", { precision: 12, scale: 2 }),
	color: text("color"), // For UI display
	metadata: jsonb("metadata"),
	createdAt: timestamp("created_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
});

export type Employee = typeof employees.$inferSelect;
export type NewEmployee = typeof employees.$inferInsert;
export type Department = typeof departments.$inferSelect;
export type NewDepartment = typeof departments.$inferInsert;

