import {
	pgTable,
	text,
	timestamp,
	uuid,
	numeric,
	jsonb,
} from "drizzle-orm/pg-core";
import { users } from "./users.schema";

export const transactions = pgTable("transactions", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: uuid("user_id").notNull().references(() => users.id),
	transactionNumber: text("transaction_number").notNull().unique(),
	type: text("type").notNull(), // 'income', 'expense', 'transfer', 'payment'
	amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
	currency: text("currency").default("USD"),
	description: text("description"),
	category: text("category"),
	status: text("status").default("pending"), // 'pending', 'completed', 'failed', 'cancelled'
	paymentMethod: text("payment_method"),
	referenceId: text("reference_id"), // Links to invoice, expense, or other entity
	referenceType: text("reference_type"), // 'invoice', 'expense', 'transfer', etc.
	accountId: uuid("account_id"), // Bank account or payment method
	transactionDate: timestamp("transaction_date", { withTimezone: true }).notNull().defaultNow(),
	processedAt: timestamp("processed_at", { withTimezone: true }),
	notes: text("notes"),
	metadata: jsonb("metadata"), // JSON object for additional data
	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
