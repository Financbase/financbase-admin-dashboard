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

export const expenseCategories = pgTable("expense_categories", {
	id: serial("id").primaryKey(),
	name: text("name").notNull(),
	description: text("description"),
	color: text("color"), // Hex color code for UI
	createdBy: text("created_by"), // References user_id as text
	createdAt: timestamp("created_at").defaultNow(),
});

export const expenses = pgTable("financbase_expenses", {
	id: serial("id").primaryKey(),
	userId: text("user_id").notNull(),
	description: text("description").notNull(),
	amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
	currency: text("currency").notNull().default("USD"),
	date: timestamp("date").notNull(),
	category: text("category").notNull(),
	vendor: text("vendor"),
	paymentMethod: text("payment_method"),
	receiptUrl: text("receipt_url"),
	receiptFileName: text("receipt_file_name"),
	status: text("status", { enum: ["pending", "approved", "rejected"] }).notNull().default("pending"),
	approvedBy: text("approved_by"),
	approvedAt: timestamp("approved_at"),
	rejectedReason: text("rejected_reason"),
	taxDeductible: boolean("tax_deductible").default(true),
	taxAmount: decimal("tax_amount", { precision: 10, scale: 2 }).default("0"),
	projectId: integer("project_id"),
	clientId: integer("client_id"),
	billable: boolean("billable").default(false),
	isRecurring: boolean("is_recurring").default(false),
	recurringFrequency: text("recurring_frequency"),
	recurringEndDate: timestamp("recurring_end_date"),
	parentExpenseId: integer("parent_expense_id"),
	mileage: decimal("mileage", { precision: 10, scale: 2 }),
	mileageRate: decimal("mileage_rate", { precision: 10, scale: 2 }),
	notes: text("notes"),
	tags: jsonb("tags"),
	metadata: jsonb("metadata"),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
