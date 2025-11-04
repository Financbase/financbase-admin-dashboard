/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import {
	decimal,
	pgTable,
	text,
	timestamp,
	integer,
	boolean,
	jsonb,
	serial,
} from "drizzle-orm/pg-core";

export const invoices = pgTable("financbase_invoices", {
	id: serial("id").primaryKey(),
	userId: text("user_id").notNull(),
	invoiceNumber: text("invoice_number").notNull().unique(),
	reference: text("reference"),
	clientId: integer("client_id"),
	clientName: text("client_name").notNull(),
	clientEmail: text("client_email").notNull(),
	clientAddress: text("client_address"),
	clientPhone: text("client_phone"),
	currency: text("currency").notNull().default("USD"),
	subtotal: decimal("subtotal", { precision: 12, scale: 2 }).notNull(),
	taxRate: decimal("tax_rate", { precision: 5, scale: 4 }).default("0"),
	taxAmount: decimal("tax_amount", { precision: 12, scale: 2 }).default("0"),
	discountAmount: decimal("discount_amount", { precision: 12, scale: 2 }).default("0"),
	total: decimal("total", { precision: 12, scale: 2 }).notNull(),
	status: text("status", { enum: ["draft", "sent", "viewed", "paid", "overdue", "cancelled"] }).notNull().default("draft"),
	issueDate: timestamp("issue_date").notNull(),
	dueDate: timestamp("due_date").notNull(),
	paidDate: timestamp("paid_date"),
	sentDate: timestamp("sent_date"),
	amountPaid: decimal("amount_paid", { precision: 12, scale: 2 }).default("0"),
	paymentMethod: text("payment_method"),
	paymentReference: text("payment_reference"),
	notes: text("notes"),
	terms: text("terms"),
	footer: text("footer"),
	items: jsonb("items").notNull(),
	isRecurring: boolean("is_recurring").notNull().default(false),
	recurringFrequency: text("recurring_frequency"),
	recurringEndDate: timestamp("recurring_end_date"),
	parentInvoiceId: integer("parent_invoice_id"),
	metadata: jsonb("metadata"),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Note: Invoice items are stored as JSONB in the items column of financbase_invoices
// This table definition is kept for reference but not used in the actual database
export const invoiceItems = pgTable("invoice_items", {
	id: serial("id").primaryKey(),
	invoiceId: integer("invoice_id").references(() => invoices.id),
	description: text("description").notNull(),
	quantity: decimal("quantity", { precision: 10, scale: 2 }).default("1"),
	unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
	total: decimal("total", { precision: 10, scale: 2 }).notNull(),
	createdAt: timestamp("created_at").defaultNow(),
});
