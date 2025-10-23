import {
	decimal,
	pgTable,
	text,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core";
import { users } from "./users.schema";
import { clients } from "./clients.schema";

export const invoices = pgTable("invoices", {
	id: uuid("id").primaryKey().defaultRandom(),
	invoiceNumber: text("invoice_number").notNull().unique(),
	userId: uuid("user_id").references(() => users.id),
	clientId: uuid("client_id").references(() => clients.id),
	status: text("status", { enum: ["draft", "sent", "viewed", "paid", "overdue", "cancelled"] }).default("draft"),
	issueDate: timestamp("issue_date").defaultNow(),
	dueDate: timestamp("due_date"),
	paidDate: timestamp("paid_date"),
	subtotal: decimal("subtotal", { precision: 12, scale: 2 }).notNull(),
	taxRate: decimal("tax_rate", { precision: 5, scale: 4 }).default("0"),
	taxAmount: decimal("tax_amount", { precision: 12, scale: 2 }).default("0"),
	discountAmount: decimal("discount_amount", { precision: 12, scale: 2 }).default("0"),
	total: decimal("total", { precision: 12, scale: 2 }).notNull(),
	currency: text("currency").default("USD"),
	notes: text("notes"),
	terms: text("terms"),
	metadata: text("metadata"),
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow(),
	contractorId: uuid("contractor_id"),
});

export const invoiceItems = pgTable("invoice_items", {
	id: uuid("id").primaryKey().defaultRandom(),
	invoiceId: uuid("invoice_id").references(() => invoices.id),
	description: text("description").notNull(),
	quantity: decimal("quantity", { precision: 10, scale: 2 }).default("1"),
	unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
	total: decimal("total", { precision: 10, scale: 2 }).notNull(),
	createdAt: timestamp("created_at").defaultNow(),
});
