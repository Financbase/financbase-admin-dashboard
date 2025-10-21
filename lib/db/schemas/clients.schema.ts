import {
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
	status: text("status", { enum: ["active", "inactive", "prospect"] }).default("active"),
	createdBy: uuid("created_by").references(() => users.id),
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow(),
});
