import {
	boolean,
	pgTable,
	text,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
	id: uuid("id").primaryKey().defaultRandom(),
	email: text("email").notNull().unique(),
	name: text("name"),
	avatar: text("avatar"),
	role: text("role", { enum: ["admin", "user", "viewer"] }).default("user"),
	isActive: boolean("is_active").default(true),
	lastLogin: timestamp("last_login"),
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow(),
});
