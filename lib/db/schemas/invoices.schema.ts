import {
	decimal,
	pgTable,
	text,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core";
import { users } from "./users.schema";

export const clients = pgTable("clients", {
	id: uuid("id").primaryKey().defaultRandom(),
	name: text("name").notNull(),
	email: text("email"),
	phone: text("phone"),
	company: text("company"),
	address: text("address"),
	taxId: text("tax_id"),
	notes: text("notes"),
	createdBy: uuid("created_by").references(() => users.id),
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow(),
});

export const invoices = pgTable("invoices", {
	id: uuid("id").primaryKey().defaultRandom(),
	invoiceNumber: text("invoice_number").notNull().unique(),
	clientId: uuid("client_id").references(() => clients.id),
	amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
	currency: text("currency").default("USD"),
	status: text("status", { enum: ["draft", "sent", "paid", "overdue", "cancelled"] }).default("draft"),
	dueDate: timestamp("due_date"),
	issuedDate: timestamp("issued_date").defaultNow(),
	paidDate: timestamp("paid_date"),
	description: text("description"),
	notes: text("notes"),
	createdBy: uuid("created_by").references(() => users.id),
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow(),
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
