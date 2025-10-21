import {
	decimal,
	pgTable,
	text,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core";
import { users } from "./users.schema";

export const expenseCategories = pgTable("expense_categories", {
	id: uuid("id").primaryKey().defaultRandom(),
	name: text("name").notNull(),
	description: text("description"),
	color: text("color"), // Hex color code for UI
	createdBy: uuid("created_by").references(() => users.id),
	createdAt: timestamp("created_at").defaultNow(),
});

export const expenses = pgTable("expenses", {
	id: uuid("id").primaryKey().defaultRandom(),
	amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
	currency: text("currency").default("USD"),
	description: text("description").notNull(),
	categoryId: uuid("category_id").references(() => expenseCategories.id),
	date: timestamp("date").notNull(),
	receipt: text("receipt"), // URL to receipt image/file
	vendor: text("vendor"),
	notes: text("notes"),
	status: text("status", { enum: ["pending", "approved", "rejected", "reimbursed"] }).default("pending"),
	approvedBy: uuid("approved_by").references(() => users.id),
	approvedAt: timestamp("approved_at"),
	createdBy: uuid("created_by").references(() => users.id),
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow(),
});
