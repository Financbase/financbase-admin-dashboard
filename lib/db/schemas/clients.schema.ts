import {
	pgTable,
	text,
	timestamp,
	uuid,
	boolean,
	jsonb,
} from "drizzle-orm/pg-core";
import { users } from "./users.schema";

export const clients = pgTable("clients", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: uuid("user_id").notNull().references(() => users.id),
	companyName: text("company_name").notNull(),
	contactName: text("contact_name"),
	email: text("email").notNull(),
	phone: text("phone"),
	address: text("address"),
	city: text("city"),
	state: text("state"),
	zipCode: text("zip_code"),
	country: text("country").default("US"),
	taxId: text("tax_id"),
	currency: text("currency").default("USD"),
	paymentTerms: text("payment_terms").default("net30"),
	isActive: boolean("is_active").default(true),
	notes: text("notes"),
	metadata: jsonb("metadata"),
	contractorId: uuid("contractor_id"),
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow(),
});

export type Client = typeof clients.$inferSelect;
export type NewClient = typeof clients.$inferInsert;
