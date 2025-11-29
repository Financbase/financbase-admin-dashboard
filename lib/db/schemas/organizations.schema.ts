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
	jsonb,
} from "drizzle-orm/pg-core";
import { users } from "./users.schema";
import { subscriptionPlans } from "./billing.schema";

// Schema location: public.organizations (not financbase.organizations)
// Updated to use UUID to match migrations and users.organizationId requirements
export const organizations = pgTable("organizations", {
	id: uuid("id").primaryKey().defaultRandom(),
	name: text("name").notNull(),
	slug: text("slug").unique(),
	description: text("description"),
	logo: text("logo"),
	settings: jsonb("settings").default({}), // JSONB for organization-specific settings
	subscriptionPlanId: uuid("subscription_plan_id").references(() => subscriptionPlans.id, { onDelete: "set null" }),
	billingEmail: text("billing_email"),
	taxId: text("tax_id"),
	address: text("address"),
	phone: text("phone"),
	isActive: boolean("is_active").default(true).notNull(),
	ownerId: uuid("owner_id").references(() => users.id),
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow(),
});

// organization_members now uses UUID foreign key to match updated schema
export const organizationMembers = pgTable("organization_members", {
	id: uuid("id").primaryKey().defaultRandom(),
	organizationId: uuid("organization_id").references(() => organizations.id),
	userId: uuid("user_id").references(() => users.id),
	role: text("role", { enum: ["owner", "admin", "member", "viewer"] }).default("member"),
	permissions: text("permissions"), // JSON array of specific permissions
	joinedAt: timestamp("joined_at").defaultNow(),
});
