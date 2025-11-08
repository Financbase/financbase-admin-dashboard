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
	uuid,
	text,
	decimal,
	timestamp,
	integer,
	jsonb,
	pgEnum,
} from "drizzle-orm/pg-core";

/**
 * Tax Obligation Type Enum
 */
export const taxObligationTypeEnum = pgEnum("tax_obligation_type", [
	"federal_income",
	"state_income",
	"local_income",
	"self_employment",
	"sales_tax",
	"property_tax",
	"payroll_tax",
	"other",
]);

/**
 * Tax Obligation Status Enum
 */
export const taxObligationStatusEnum = pgEnum("tax_obligation_status", [
	"pending",
	"paid",
	"overdue",
	"cancelled",
]);

/**
 * Tax Documents Type Enum
 */
export const taxDocumentTypeEnum = pgEnum("tax_document_type", [
	"w2",
	"1099",
	"tax_return",
	"receipt",
	"invoice",
	"expense_report",
	"other",
]);

/**
 * Tax Obligations Table
 * Track tax obligations (Federal Income, State Income, Self-Employment, Sales Tax, etc.)
 */
export const taxObligations = pgTable("tax_obligations", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: text("user_id").notNull(),

	// Obligation details
	name: text("name").notNull(), // e.g., "Federal Income Tax", "State Income Tax"
	type: taxObligationTypeEnum("type").notNull(),
	amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
	dueDate: timestamp("due_date", { withTimezone: true }).notNull(),
	status: taxObligationStatusEnum("status").notNull().default("pending"),

	// Period information
	quarter: text("quarter"), // e.g., "Q1 2025"
	year: integer("year").notNull(),

	// Payment tracking
	paid: decimal("paid", { precision: 12, scale: 2 }).default("0"),
	paymentDate: timestamp("payment_date", { withTimezone: true }),
	paymentMethod: text("payment_method"), // e.g., "bank_transfer", "check", "credit_card"

	// Additional information
	notes: text("notes"),
	metadata: jsonb("metadata").$type<Record<string, unknown>>(),

	// Timestamps
	createdAt: timestamp("created_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
});

/**
 * Tax Deductions Table
 * Track tax deduction categories and amounts
 */
export const taxDeductions = pgTable("tax_deductions", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: text("user_id").notNull(),

	// Deduction details
	category: text("category").notNull(), // e.g., "Business Expenses", "Home Office"
	amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
	percentage: decimal("percentage", { precision: 5, scale: 2 }), // Percentage of total deductions
	transactionCount: integer("transaction_count").default(0), // Number of transactions in this category
	year: integer("year").notNull(),

	// Additional information
	description: text("description"),
	metadata: jsonb("metadata").$type<Record<string, unknown>>(),

	// Timestamps
	createdAt: timestamp("created_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
});

/**
 * Tax Documents Table
 * Store tax document references
 */
export const taxDocuments = pgTable("tax_documents", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: text("user_id").notNull(),

	// Document details
	name: text("name").notNull(), // e.g., "2024 Tax Summary", "Expense Report"
	type: taxDocumentTypeEnum("type").notNull(),
	year: integer("year").notNull(),

	// File information
	fileUrl: text("file_url").notNull(),
	fileSize: integer("file_size"), // Size in bytes
	fileName: text("file_name"), // Original filename
	mimeType: text("mime_type"), // e.g., "application/pdf", "image/jpeg"

	// Additional information
	description: text("description"),
	metadata: jsonb("metadata").$type<Record<string, unknown>>(),

	// Timestamps
	uploadedAt: timestamp("uploaded_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
	createdAt: timestamp("created_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
});

// Type exports
export type TaxObligation = typeof taxObligations.$inferSelect;
export type NewTaxObligation = typeof taxObligations.$inferInsert;

export type TaxDeduction = typeof taxDeductions.$inferSelect;
export type NewTaxDeduction = typeof taxDeductions.$inferInsert;

export type TaxDocument = typeof taxDocuments.$inferSelect;
export type NewTaxDocument = typeof taxDocuments.$inferInsert;

/**
 * Tax Payments Table
 * Track individual tax payments for history and compliance
 */
export const taxPayments = pgTable("tax_payments", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: text("user_id").notNull(),
	obligationId: uuid("obligation_id").references(() => taxObligations.id, { onDelete: 'cascade' }),

	// Payment details
	amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
	paymentDate: timestamp("payment_date", { withTimezone: true }).notNull(),
	paymentMethod: text("payment_method"), // e.g., "bank_transfer", "check", "credit_card"
	reference: text("reference"), // Payment reference number
	quarter: integer("quarter"), // Quarter number (1-4) for quarterly payments
	year: integer("year").notNull(),

	// Additional information
	notes: text("notes"),
	metadata: jsonb("metadata").$type<Record<string, unknown>>(),

	// Timestamps
	createdAt: timestamp("created_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
});

export type TaxPayment = typeof taxPayments.$inferSelect;
export type NewTaxPayment = typeof taxPayments.$inferInsert;

