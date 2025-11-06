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
	integer,
} from "drizzle-orm/pg-core";
import { organizations } from "./organizations.schema";
import { employees } from "./employees.schema";
import { hrContractors } from "./hr-contractors.schema";
import { payrollRuns } from "./payroll.schema";

export const attendanceStatusEnum = pgEnum("attendance_status", [
	"present",
	"absent",
	"late",
	"early_leave",
	"half_day",
	"on_leave",
]);

export const clockMethodEnum = pgEnum("clock_method", [
	"web",
	"mobile",
	"kiosk",
	"biometric",
	"api",
	"manual",
]);

export const timeCardStatusEnum = pgEnum("time_card_status", [
	"draft",
	"submitted",
	"approved",
	"rejected",
	"paid",
]);

// Attendance Records Table
export const attendanceRecords = pgTable("attendance_records", {
	id: uuid("id").primaryKey().defaultRandom(),
	employeeId: uuid("employee_id").references(() => employees.id, { onDelete: "cascade" }),
	contractorId: uuid("contractor_id").references(() => hrContractors.id, { onDelete: "cascade" }),
	organizationId: uuid("organization_id")
		.notNull()
		.references(() => organizations.id, { onDelete: "cascade" }),

	// Clock in/out information
	clockInTime: timestamp("clock_in_time", { withTimezone: true }),
	clockOutTime: timestamp("clock_out_time", { withTimezone: true }),
	date: timestamp("date", { withTimezone: true }).notNull(), // Date of attendance

	// Duration
	duration: numeric("duration", { precision: 8, scale: 2 }), // Hours worked
	breakDuration: numeric("break_duration", { precision: 8, scale: 2 }).default("0"), // Break hours
	overtimeDuration: numeric("overtime_duration", { precision: 8, scale: 2 }).default("0"), // Overtime hours

	// Status
	status: attendanceStatusEnum("status").default("present"),

	// Location information
	clockInLocation: jsonb("clock_in_location"), // { latitude, longitude, address, ip }
	clockOutLocation: jsonb("clock_out_location"), // { latitude, longitude, address, ip }
	clockInMethod: clockMethodEnum("clock_in_method").default("web"),
	clockOutMethod: clockMethodEnum("clock_out_method").default("web"),

	// Time card link
	timeCardId: uuid("time_card_id"), // Will be linked later

	// Additional information
	notes: text("notes"),
	metadata: jsonb("metadata"),

	// Timestamps
	createdAt: timestamp("created_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
});

// Time Cards Table
export const timeCards = pgTable("time_cards", {
	id: uuid("id").primaryKey().defaultRandom(),
	employeeId: uuid("employee_id").references(() => employees.id, { onDelete: "cascade" }),
	contractorId: uuid("contractor_id").references(() => hrContractors.id, { onDelete: "cascade" }),
	organizationId: uuid("organization_id")
		.notNull()
		.references(() => organizations.id, { onDelete: "cascade" }),
	payrollRunId: uuid("payroll_run_id").references(() => payrollRuns.id, { onDelete: "set null" }),

	// Pay period
	payPeriodStart: timestamp("pay_period_start", { withTimezone: true }).notNull(),
	payPeriodEnd: timestamp("pay_period_end", { withTimezone: true }).notNull(),
	payFrequency: text("pay_frequency", {
		enum: ["weekly", "biweekly", "semimonthly", "monthly"],
	}).notNull(),

	// Hours summary
	totalHours: numeric("total_hours", { precision: 8, scale: 2 }).default("0"),
	regularHours: numeric("regular_hours", { precision: 8, scale: 2 }).default("0"),
	overtimeHours: numeric("overtime_hours", { precision: 8, scale: 2 }).default("0"),
	breakHours: numeric("break_hours", { precision: 8, scale: 2 }).default("0"),

	// Attendance summary
	daysPresent: integer("days_present").default(0),
	daysAbsent: integer("days_absent").default(0),
	daysLate: integer("days_late").default(0),
	daysOnLeave: integer("days_on_leave").default(0),

	// Status
	status: timeCardStatusEnum("status").notNull().default("draft"),

	// Submission workflow
	submittedBy: text("submitted_by"), // User ID
	submittedAt: timestamp("submitted_at", { withTimezone: true }),
	approvedBy: text("approved_by"), // User ID
	approvedAt: timestamp("approved_at", { withTimezone: true }),
	rejectedBy: text("rejected_by"), // User ID
	rejectedAt: timestamp("rejected_at", { withTimezone: true }),
	rejectionReason: text("rejection_reason"),

	// Links to attendance records
	attendanceRecordIds: jsonb("attendance_record_ids"), // Array of UUIDs

	// Additional information
	notes: text("notes"),
	metadata: jsonb("metadata"),

	// Timestamps
	createdAt: timestamp("created_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
});

export type AttendanceRecord = typeof attendanceRecords.$inferSelect;
export type NewAttendanceRecord = typeof attendanceRecords.$inferInsert;
export type TimeCard = typeof timeCards.$inferSelect;
export type NewTimeCard = typeof timeCards.$inferInsert;

