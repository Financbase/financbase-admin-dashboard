/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import {
	pgTable,
	text,
	timestamp,
	uuid,
	boolean,
} from "drizzle-orm/pg-core";

export const users = pgTable("financbase.users", {
	id: uuid("id").primaryKey().defaultRandom(),
	clerkId: text("clerk_id").notNull().unique(),
	email: text("email").notNull().unique(),
	firstName: text("first_name"),
	lastName: text("last_name"),
	role: text("role", { enum: ["admin", "user", "viewer"] }).notNull().default("user"),
	isActive: boolean("is_active").notNull().default(true),
	organizationId: uuid("organization_id"), // Made nullable to support multi-organization membership
	createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
