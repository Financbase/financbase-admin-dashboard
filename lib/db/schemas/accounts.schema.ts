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
} from "drizzle-orm/pg-core";
import { users } from "./users.schema";

export const accountTypeEnum = pgEnum("account_type", [
	"checking",
	"savings", 
	"credit_card",
	"investment",
	"loan",
	"other"
]);

export const accountStatusEnum = pgEnum("account_status", [
	"active",
	"inactive", 
	"closed",
	"suspended"
]);

export const accounts = pgTable("accounts", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: uuid("user_id").notNull().references(() => users.id),
	accountName: text("account_name").notNull(),
	accountType: accountTypeEnum("account_type").notNull(),
	bankName: text("bank_name"),
	accountNumber: text("account_number"), // Last 4 digits only for security
	lastFourDigits: text("last_four_digits"),
	routingNumber: text("routing_number"),
	swiftCode: text("swift_code"),
	iban: text("iban"),
	currency: text("currency").default("USD").notNull(),
	openingBalance: numeric("opening_balance", { precision: 12, scale: 2 }).default("0"),
	currentBalance: numeric("current_balance", { precision: 12, scale: 2 }).default("0"),
	availableBalance: numeric("available_balance", { precision: 12, scale: 2 }).default("0"),
	creditLimit: numeric("credit_limit", { precision: 12, scale: 2 }), // For credit cards
	interestRate: numeric("interest_rate", { precision: 5, scale: 4 }), // Annual percentage rate
	status: accountStatusEnum("status").default("active").notNull(),
	isPrimary: pgBoolean("is_primary").default(false),
	isReconciled: pgBoolean("is_reconciled").default(false),
	lastReconciledAt: timestamp("last_reconciled_at"),
	lastSyncAt: timestamp("last_sync_at"),
	externalId: text("external_id"), // For bank API integration
	metadata: text("metadata"), // JSON string for additional data
	notes: text("notes"),
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow(),
});

export type Account = typeof accounts.$inferSelect;
export type NewAccount = typeof accounts.$inferInsert;
