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
	jsonb,
	decimal,
	serial,
} from "drizzle-orm/pg-core";

export const clients = pgTable("financbase_clients", {
	id: serial("id").primaryKey(),
	userId: text("user_id").notNull(),
	name: text("name").notNull(),
	email: text("email").notNull(),
	phone: text("phone"),
	company: text("company"),
	address: text("address"),
	city: text("city"),
	state: text("state"),
	zipCode: text("zip_code"),
	country: text("country").default("US"),
	taxId: text("tax_id"),
	currency: text("currency").default("USD"),
	paymentTerms: text("payment_terms"),
	status: text("status", { enum: ["active", "inactive", "suspended"] }).notNull().default("active"),
	totalInvoiced: decimal("total_invoiced", { precision: 12, scale: 2 }).default("0"),
	totalPaid: decimal("total_paid", { precision: 12, scale: 2 }).default("0"),
	outstandingBalance: decimal("outstanding_balance", { precision: 12, scale: 2 }).default("0"),
	notes: text("notes"),
	tags: jsonb("tags"),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type Client = typeof clients.$inferSelect;
export type NewClient = typeof clients.$inferInsert;
