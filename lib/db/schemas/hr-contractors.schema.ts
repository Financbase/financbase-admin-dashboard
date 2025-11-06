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
import { users } from "./users.schema";

export const contractorTypeEnum = pgEnum("contractor_type", [
	"1099",
	"w2",
	"c2c",
	"other",
]);

export const contractorStatusEnum = pgEnum("contractor_status", [
	"active",
	"inactive",
	"terminated",
	"pending",
]);

export const paymentTermsEnum = pgEnum("payment_terms", [
	"net_15",
	"net_30",
	"net_45",
	"net_60",
	"due_on_receipt",
	"custom",
]);

export const hrContractors = pgTable("hr_contractors", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
	organizationId: uuid("organization_id")
		.notNull()
		.references(() => organizations.id, { onDelete: "cascade" }),

	// Personal information
	firstName: text("first_name").notNull(),
	lastName: text("last_name").notNull(),
	email: text("email").notNull(),
	phone: text("phone"),
	avatar: text("avatar"),

	// Contractor details
	contractorType: contractorTypeEnum("contractor_type").notNull().default("1099"),
	companyName: text("company_name"),
	contractorNumber: text("contractor_number").unique(),

	// Tax information
	ssn: text("ssn"), // Encrypted
	ein: text("ein"), // Employer Identification Number
	w9Status: text("w9_status").default("pending"), // pending, received, verified
	w9ReceivedDate: timestamp("w9_received_date", { withTimezone: true }),
	taxId: text("tax_id"), // For international contractors

	// Contract details
	contractStartDate: timestamp("contract_start_date", { withTimezone: true }).notNull(),
	contractEndDate: timestamp("contract_end_date", { withTimezone: true }),
	contractDocumentUrl: text("contract_document_url"),

	// Rate and payment
	hourlyRate: numeric("hourly_rate", { precision: 12, scale: 2 }),
	monthlyRate: numeric("monthly_rate", { precision: 12, scale: 2 }),
	annualRate: numeric("annual_rate", { precision: 12, scale: 2 }),
	currency: text("currency").default("USD"),
	paymentTerms: paymentTermsEnum("payment_terms").default("net_30"),
	customPaymentTerms: text("custom_payment_terms"),

	// Status
	status: contractorStatusEnum("status").notNull().default("active"),

	// Location
	location: text("location"), // Remote, Office address, etc.
	timezone: text("timezone").default("UTC"),

	// Additional information
	notes: text("notes"),
	tags: jsonb("tags"), // Array of tags
	metadata: jsonb("metadata"), // Additional JSON data

	// Timestamps
	createdAt: timestamp("created_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
});

export type HRContractor = typeof hrContractors.$inferSelect;
export type NewHRContractor = typeof hrContractors.$inferInsert;

