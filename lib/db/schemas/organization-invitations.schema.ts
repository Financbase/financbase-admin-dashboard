/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { pgTable, uuid, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { organizations } from "./organizations.schema";
import { users } from "./users.schema";

export const invitationStatus = pgEnum("invitation_status", ["pending", "accepted", "declined", "expired", "cancelled"]);

// Organization Invitations table
export const organizationInvitations = pgTable("organization_invitations", {
	id: uuid("id").primaryKey().defaultRandom(),
	organizationId: uuid("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
	email: text("email").notNull(),
	role: text("role", { enum: ["owner", "admin", "member", "viewer"] }).default("member"),
	invitedBy: uuid("invited_by").references(() => users.id, { onDelete: "set null" }),
	token: text("token").notNull().unique(),
	expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
	status: invitationStatus("status").default("pending"),
	acceptedAt: timestamp("accepted_at", { withTimezone: true }),
	declinedAt: timestamp("declined_at", { withTimezone: true }),
	message: text("message"), // Optional invitation message
	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// Relations
export const organizationInvitationsRelations = relations(organizationInvitations, ({ one }) => ({
	organization: one(organizations, {
		fields: [organizationInvitations.organizationId],
		references: [organizations.id],
	}),
	inviter: one(users, {
		fields: [organizationInvitations.invitedBy],
		references: [users.id],
	}),
}));

// Types
export type OrganizationInvitation = typeof organizationInvitations.$inferSelect;
export type NewOrganizationInvitation = typeof organizationInvitations.$inferInsert;

