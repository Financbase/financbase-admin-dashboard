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

export const leaveTypeEnum = pgEnum("leave_type_category", [
	"vacation",
	"sick_leave",
	"personal",
	"fmla",
	"bereavement",
	"jury_duty",
	"military",
	"unpaid",
	"other",
]);

export const leaveRequestStatusEnum = pgEnum("leave_request_status", [
	"pending",
	"approved",
	"rejected",
	"cancelled",
]);

export const accrualMethodEnum = pgEnum("accrual_method", [
	"none",
	"fixed",
	"per_hour",
	"per_week",
	"per_month",
	"per_year",
	"proportional",
]);

// Leave Types Table
export const leaveTypes = pgTable("leave_types", {
	id: uuid("id").primaryKey().defaultRandom(),
	organizationId: uuid("organization_id")
		.notNull()
		.references(() => organizations.id, { onDelete: "cascade" }),

	// Leave type information
	name: text("name").notNull(),
	category: leaveTypeEnum("category").notNull(),
	description: text("description"),

	// Accrual configuration
	accrualMethod: accrualMethodEnum("accrual_method").default("none"),
	accrualRate: numeric("accrual_rate", { precision: 8, scale: 2 }), // Hours per period
	accrualPeriod: text("accrual_period", {
		enum: ["hourly", "daily", "weekly", "biweekly", "monthly", "yearly"],
	}),
	maxAccrual: numeric("max_accrual", { precision: 8, scale: 2 }), // Maximum balance
	initialBalance: numeric("initial_balance", { precision: 8, scale: 2 }).default("0"), // Starting balance

	// Carryover rules
	allowCarryover: pgBoolean("allow_carryover").default(false),
	maxCarryover: numeric("max_carryover", { precision: 8, scale: 2 }), // Maximum carryover amount
	carryoverExpiryDate: timestamp("carryover_expiry_date", { withTimezone: true }), // When carryover expires

	// Usage rules
	minIncrement: numeric("min_increment", { precision: 8, scale: 2 }), // Minimum hours that can be taken
	requiresApproval: pgBoolean("requires_approval").default(true),
	advanceNoticeDays: integer("advance_notice_days"), // Days of advance notice required

	// Status
	isActive: pgBoolean("is_active").default(true),

	// Color for calendar display
	color: text("color"),

	// Additional information
	metadata: jsonb("metadata"),

	// Timestamps
	createdAt: timestamp("created_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
});

// Leave Balances Table
export const leaveBalances = pgTable("leave_balances", {
	id: uuid("id").primaryKey().defaultRandom(),
	employeeId: uuid("employee_id")
		.notNull()
		.references(() => employees.id, { onDelete: "cascade" }),
	leaveTypeId: uuid("leave_type_id")
		.notNull()
		.references(() => leaveTypes.id, { onDelete: "cascade" }),

	// Balance information
	currentBalance: numeric("current_balance", { precision: 8, scale: 2 }).notNull().default("0"),
	accrued: numeric("accrued", { precision: 8, scale: 2 }).default("0"), // Total accrued this period
	used: numeric("used", { precision: 8, scale: 2 }).default("0"), // Total used
	pending: numeric("pending", { precision: 8, scale: 2 }).default("0"), // Pending requests
	carryover: numeric("carryover", { precision: 8, scale: 2 }).default("0"), // From previous period

	// Period information
	periodStart: timestamp("period_start", { withTimezone: true }),
	periodEnd: timestamp("period_end", { withTimezone: true }),
	lastAccrualDate: timestamp("last_accrual_date", { withTimezone: true }),

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

// Leave Requests Table
export const leaveRequests = pgTable("leave_requests", {
	id: uuid("id").primaryKey().defaultRandom(),
	employeeId: uuid("employee_id")
		.notNull()
		.references(() => employees.id, { onDelete: "cascade" }),
	leaveTypeId: uuid("leave_type_id")
		.notNull()
		.references(() => leaveTypes.id, { onDelete: "restrict" }),
	organizationId: uuid("organization_id")
		.notNull()
		.references(() => organizations.id, { onDelete: "cascade" }),

	// Request information
	startDate: timestamp("start_date", { withTimezone: true }).notNull(),
	endDate: timestamp("end_date", { withTimezone: true }).notNull(),
	duration: numeric("duration", { precision: 8, scale: 2 }).notNull(), // Hours or days
	durationUnit: text("duration_unit", {
		enum: ["hours", "days"],
	}).default("hours"),

	// Request details
	reason: text("reason"),
	notes: text("notes"),

	// Status
	status: leaveRequestStatusEnum("status").notNull().default("pending"),

	// Approval workflow
	requestedBy: text("requested_by").notNull(), // User ID
	requestedAt: timestamp("requested_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
	approvedBy: text("approved_by"), // User ID
	approvedAt: timestamp("approved_at", { withTimezone: true }),
	rejectedBy: text("rejected_by"), // User ID
	rejectedAt: timestamp("rejected_at", { withTimezone: true }),
	rejectionReason: text("rejection_reason"),

	// Additional information
	metadata: jsonb("metadata"),

	// Timestamps
	createdAt: timestamp("created_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
});

export type LeaveType = typeof leaveTypes.$inferSelect;
export type NewLeaveType = typeof leaveTypes.$inferInsert;
export type LeaveBalance = typeof leaveBalances.$inferSelect;
export type NewLeaveBalance = typeof leaveBalances.$inferInsert;
export type LeaveRequest = typeof leaveRequests.$inferSelect;
export type NewLeaveRequest = typeof leaveRequests.$inferInsert;

