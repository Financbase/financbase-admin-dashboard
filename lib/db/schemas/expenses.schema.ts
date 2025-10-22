import {
	decimal,
	pgTable,
	text,
	timestamp,
	date,
	uuid,
	boolean,
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
	userId: uuid("user_id").references(() => users.id),
	categoryId: uuid("category_id").references(() => expenseCategories.id),
	amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
	description: text("description"),
	expenseDate: date("expense_date").notNull(), // Proper date type
	paymentMethod: text("payment_method"),
	tags: text("tags"), // Array type in DB, using text for now
	receiptUrl: text("receipt_url"),
	isRecurring: boolean("is_recurring").default(false),
	recurringFrequency: text("recurring_frequency"),
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow(),
	contractorId: uuid("contractor_id"),
});
