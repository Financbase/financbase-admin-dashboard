/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { pgTable, uuid, jsonb, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { organizations } from "./organizations.schema";

// Organization Settings table - stores organization-specific configurations
export const organizationSettings = pgTable("organization_settings", {
	id: uuid("id").primaryKey().defaultRandom(),
	organizationId: uuid("organization_id").notNull().unique().references(() => organizations.id, { onDelete: "cascade" }),
	settings: jsonb("settings").default({}), // General organization settings
	branding: jsonb("branding").default({}), // Branding configuration (colors, logos, etc.)
	integrations: jsonb("integrations").default({}), // Integration configurations
	features: jsonb("features").default({}), // Feature flags and enabled features
	notifications: jsonb("notifications").default({}), // Notification preferences
	security: jsonb("security").default({}), // Security settings
	compliance: jsonb("compliance").default({}), // Compliance settings
	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// Relations
export const organizationSettingsRelations = relations(organizationSettings, ({ one }) => ({
	organization: one(organizations, {
		fields: [organizationSettings.organizationId],
		references: [organizations.id],
	}),
}));

// Types
export type OrganizationSettings = typeof organizationSettings.$inferSelect;
export type NewOrganizationSettings = typeof organizationSettings.$inferInsert;

