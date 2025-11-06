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

export const payrollRunStatusEnum = pgEnum("payroll_run_status", [
	"draft",
	"processing",
	"completed",
	"error",
	"cancelled",
]);

export const payrollEntryStatusEnum = pgEnum("payroll_entry_status", [
	"pending",
	"calculated",
	"approved",
	"paid",
	"error",
]);

export const deductionTypeEnum = pgEnum("deduction_type", [
	"401k",
	"403b",
	"health_insurance",
	"dental_insurance",
	"vision_insurance",
	"life_insurance",
	"disability_insurance",
	"hsa",
	"fsa",
	"parking",
	"transit",
	"union_dues",
	"garnishment",
	"loan",
	"other",
]);

export const taxTypeEnum = pgEnum("tax_type", [
	"federal_income",
	"state_income",
	"local_income",
	"social_security",
	"medicare",
	"federal_unemployment",
	"state_unemployment",
	"other",
]);

export const benefitTypeEnum = pgEnum("benefit_type", [
	"health_insurance",
	"dental_insurance",
	"vision_insurance",
	"life_insurance",
	"disability_insurance",
	"retirement",
	"stock_options",
	"tuition",
	"wellness",
	"other",
]);

// Payroll Runs Table
export const payrollRuns = pgTable("payroll_runs", {
	id: uuid("id").primaryKey().defaultRandom(),
	organizationId: uuid("organization_id")
		.notNull()
		.references(() => organizations.id, { onDelete: "cascade" }),
	createdBy: text("created_by").notNull(), // User ID

	// Pay period information
	payPeriodStart: timestamp("pay_period_start", { withTimezone: true }).notNull(),
	payPeriodEnd: timestamp("pay_period_end", { withTimezone: true }).notNull(),
	payDate: timestamp("pay_date", { withTimezone: true }).notNull(),
	payFrequency: text("pay_frequency", {
		enum: ["weekly", "biweekly", "semimonthly", "monthly"],
	}).notNull(),

	// Status
	status: payrollRunStatusEnum("status").notNull().default("draft"),

	// Totals
	totalEmployees: integer("total_employees").default(0),
	totalGrossPay: numeric("total_gross_pay", { precision: 15, scale: 2 }).default("0"),
	totalDeductions: numeric("total_deductions", { precision: 15, scale: 2 }).default("0"),
	totalTaxes: numeric("total_taxes", { precision: 15, scale: 2 }).default("0"),
	totalBenefits: numeric("total_benefits", { precision: 15, scale: 2 }).default("0"),
	totalNetPay: numeric("total_net_pay", { precision: 15, scale: 2 }).default("0"),

	// Processing information
	processedAt: timestamp("processed_at", { withTimezone: true }),
	processedBy: text("processed_by"), // User ID
	errorMessage: text("error_message"),

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

// Payroll Entries Table
export const payrollEntries = pgTable("payroll_entries", {
	id: uuid("id").primaryKey().defaultRandom(),
	payrollRunId: uuid("payroll_run_id")
		.notNull()
		.references(() => payrollRuns.id, { onDelete: "cascade" }),
	employeeId: uuid("employee_id").references(() => employees.id, { onDelete: "set null" }),
	contractorId: uuid("contractor_id").references(() => hrContractors.id, { onDelete: "set null" }),
	
	// Pay information
	payPeriodStart: timestamp("pay_period_start", { withTimezone: true }).notNull(),
	payPeriodEnd: timestamp("pay_period_end", { withTimezone: true }).notNull(),
	
	// Hours and rate
	hoursWorked: numeric("hours_worked", { precision: 8, scale: 2 }).default("0"),
	regularHours: numeric("regular_hours", { precision: 8, scale: 2 }).default("0"),
	overtimeHours: numeric("overtime_hours", { precision: 8, scale: 2 }).default("0"),
	hourlyRate: numeric("hourly_rate", { precision: 12, scale: 2 }),
	salaryAmount: numeric("salary_amount", { precision: 12, scale: 2 }),

	// Pay amounts
	grossPay: numeric("gross_pay", { precision: 12, scale: 2 }).notNull().default("0"),
	overtimePay: numeric("overtime_pay", { precision: 12, scale: 2 }).default("0"),
	bonus: numeric("bonus", { precision: 12, scale: 2 }).default("0"),
	commission: numeric("commission", { precision: 12, scale: 2 }).default("0"),
	otherPay: numeric("other_pay", { precision: 12, scale: 2 }).default("0"),

	// Deductions
	totalDeductions: numeric("total_deductions", { precision: 12, scale: 2 }).default("0"),
	deductionsBreakdown: jsonb("deductions_breakdown"), // Array of deduction objects

	// Taxes
	totalTaxes: numeric("total_taxes", { precision: 12, scale: 2 }).default("0"),
	taxesBreakdown: jsonb("taxes_breakdown"), // Array of tax objects

	// Benefits
	totalBenefits: numeric("total_benefits", { precision: 12, scale: 2 }).default("0"),
	benefitsBreakdown: jsonb("benefits_breakdown"), // Array of benefit objects

	// Net pay
	netPay: numeric("net_pay", { precision: 12, scale: 2 }).notNull().default("0"),

	// Status
	status: payrollEntryStatusEnum("status").notNull().default("pending"),

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

// Payroll Deductions Table
export const payrollDeductions = pgTable("payroll_deductions", {
	id: uuid("id").primaryKey().defaultRandom(),
	organizationId: uuid("organization_id")
		.notNull()
		.references(() => organizations.id, { onDelete: "cascade" }),
	employeeId: uuid("employee_id").references(() => employees.id, { onDelete: "cascade" }),
	contractorId: uuid("contractor_id").references(() => hrContractors.id, { onDelete: "cascade" }),

	// Deduction information
	name: text("name").notNull(),
	type: deductionTypeEnum("type").notNull(),
	description: text("description"),

	// Amount configuration
	amountType: text("amount_type", {
		enum: ["fixed", "percentage"],
	}).notNull(),
	amount: numeric("amount", { precision: 12, scale: 2 }),
	percentage: numeric("percentage", { precision: 5, scale: 2 }), // 0-100

	// Frequency
	frequency: text("frequency", {
		enum: ["per_paycheck", "monthly", "yearly", "one_time"],
	}).default("per_paycheck"),

	// Limits
	maxAmount: numeric("max_amount", { precision: 12, scale: 2 }),
	minAmount: numeric("min_amount", { precision: 12, scale: 2 }),

	// Status
	isActive: pgBoolean("is_active").default(true),
	startDate: timestamp("start_date", { withTimezone: true }),
	endDate: timestamp("end_date", { withTimezone: true }),

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

// Payroll Taxes Table
export const payrollTaxes = pgTable("payroll_taxes", {
	id: uuid("id").primaryKey().defaultRandom(),
	organizationId: uuid("organization_id")
		.notNull()
		.references(() => organizations.id, { onDelete: "cascade" }),

	// Tax information
	name: text("name").notNull(),
	type: taxTypeEnum("type").notNull(),
	description: text("description"),

	// Tax configuration
	jurisdiction: text("jurisdiction"), // Federal, State name, City name
	rate: numeric("rate", { precision: 8, scale: 4 }), // Percentage rate
	flatAmount: numeric("flat_amount", { precision: 12, scale: 2 }),

	// Tax brackets (for progressive taxes)
	taxBrackets: jsonb("tax_brackets"), // Array of bracket objects

	// Employee exemptions
	exemptions: jsonb("exemptions"), // Array of exemption rules

	// Limits
	wageBase: numeric("wage_base", { precision: 12, scale: 2 }), // Maximum wage subject to tax
	maxTax: numeric("max_tax", { precision: 12, scale: 2 }), // Maximum tax amount

	// Status
	isActive: pgBoolean("is_active").default(true),
	effectiveDate: timestamp("effective_date", { withTimezone: true }),
	endDate: timestamp("end_date", { withTimezone: true }),

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

// Payroll Benefits Table
export const payrollBenefits = pgTable("payroll_benefits", {
	id: uuid("id").primaryKey().defaultRandom(),
	organizationId: uuid("organization_id")
		.notNull()
		.references(() => organizations.id, { onDelete: "cascade" }),
	employeeId: uuid("employee_id").references(() => employees.id, { onDelete: "cascade" }),
	contractorId: uuid("contractor_id").references(() => hrContractors.id, { onDelete: "cascade" }),

	// Benefit information
	name: text("name").notNull(),
	type: benefitTypeEnum("type").notNull(),
	description: text("description"),

	// Coverage
	coverageType: text("coverage_type", {
		enum: ["individual", "family", "employee_plus_one"],
	}).default("individual"),
	coverageDetails: jsonb("coverage_details"), // Detailed coverage information

	// Cost
	employerCost: numeric("employer_cost", { precision: 12, scale: 2 }).default("0"),
	employeeCost: numeric("employee_cost", { precision: 12, scale: 2 }).default("0"),
	totalCost: numeric("total_cost", { precision: 12, scale: 2 }).default("0"),

	// Frequency
	frequency: text("frequency", {
		enum: ["per_paycheck", "monthly", "yearly"],
	}).default("per_paycheck"),

	// Enrollment
	enrollmentDate: timestamp("enrollment_date", { withTimezone: true }),
	effectiveDate: timestamp("effective_date", { withTimezone: true }),
	endDate: timestamp("end_date", { withTimezone: true }),

	// Status
	isActive: pgBoolean("is_active").default(true),
	status: text("status", {
		enum: ["enrolled", "pending", "cancelled", "terminated"],
	}).default("enrolled"),

	// Additional information
	provider: text("provider"), // Insurance provider name
	policyNumber: text("policy_number"),
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

export type PayrollRun = typeof payrollRuns.$inferSelect;
export type NewPayrollRun = typeof payrollRuns.$inferInsert;
export type PayrollEntry = typeof payrollEntries.$inferSelect;
export type NewPayrollEntry = typeof payrollEntries.$inferInsert;
export type PayrollDeduction = typeof payrollDeductions.$inferSelect;
export type NewPayrollDeduction = typeof payrollDeductions.$inferInsert;
export type PayrollTax = typeof payrollTaxes.$inferSelect;
export type NewPayrollTax = typeof payrollTaxes.$inferInsert;
export type PayrollBenefit = typeof payrollBenefits.$inferSelect;
export type NewPayrollBenefit = typeof payrollBenefits.$inferInsert;

