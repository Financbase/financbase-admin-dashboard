import {
	pgTable,
	text,
	timestamp,
	uuid,
	boolean as pgBoolean,
	numeric,
	pgEnum,
} from "drizzle-orm/pg-core";
import { users } from "./users.schema";

export const transactionTypeEnum = pgEnum('transaction_type', ['credit', 'debit']);
export const transactionStatusEnum = pgEnum('transaction_status', ['pending', 'completed', 'failed', 'cancelled']);
export const transactionCategoryEnum = pgEnum('transaction_category', [
	'income',
	'expense',
	'transfer',
	'refund',
	'fee',
	'tax',
	'payroll',
	'office',
	'marketing',
	'software',
	'utilities',
	'travel',
	'other'
]);

export const transactions = pgTable("transactions", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: uuid("user_id").notNull().references(() => users.id),
	transactionNumber: text("transaction_number").notNull(),
	type: transactionTypeEnum("type").notNull(),
	amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
	currency: text("currency").default("USD"),
	description: text("description").notNull(),
	category: transactionCategoryEnum("category").notNull(),
	status: transactionStatusEnum("status").default("pending"),
	paymentMethod: text("payment_method"),
	referenceId: text("reference_id"), // Links to invoice, expense, or other entity
	referenceType: text("reference_type"), // 'invoice', 'expense', 'transfer', etc.
	accountId: text("account_id"), // Bank account or payment method
	transactionDate: timestamp("transaction_date").notNull(),
	processedAt: timestamp("processed_at"),
	notes: text("notes"),
	metadata: text("metadata"), // JSON string for additional data
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow(),
});

export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
