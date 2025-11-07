/**
 * Subscription RBAC Mapping Schemas
 * Maps subscription plans to roles and permissions
 */

/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { pgTable, uuid, text, timestamp, boolean, integer, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { subscriptionPlans, userSubscriptions } from "./billing.schema";

// Enum for subscription status history
export const subscriptionStatusType = pgEnum("subscription_status_type", [
	"active",
	"inactive",
	"cancelled",
	"expired",
	"suspended",
	"trial",
]);

// Subscription Plan RBAC Mappings table
export const subscriptionPlanRbacMappings = pgTable("subscription_plan_rbac_mappings", {
	id: uuid("id").primaryKey().defaultRandom(),
	planId: uuid("plan_id")
		.notNull()
		.references(() => subscriptionPlans.id, { onDelete: "cascade" }),
	role: text("role")
		.notNull()
		.$type<"admin" | "manager" | "user" | "viewer">(),
	permissions: jsonb("permissions").notNull().default([]).$type<string[]>(),
	isTrialMapping: boolean("is_trial_mapping").default(false).notNull(),
	gracePeriodDays: integer("grace_period_days").default(7).notNull(),
	metadata: jsonb("metadata").default({}),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
	uniquePlanTrialMapping: {
		columns: [table.planId, table.isTrialMapping],
	},
}));

// Subscription Status History table
export const subscriptionStatusHistory = pgTable("subscription_status_history", {
	id: uuid("id").primaryKey().defaultRandom(),
	subscriptionId: uuid("subscription_id")
		.notNull()
		.references(() => userSubscriptions.id, { onDelete: "cascade" }),
	userId: uuid("user_id").notNull(),
	previousStatus: subscriptionStatusType("previous_status"),
	newStatus: subscriptionStatusType("new_status").notNull(),
	gracePeriodStart: timestamp("grace_period_start"),
	gracePeriodEnd: timestamp("grace_period_end"),
	reason: text("reason"),
	metadata: jsonb("metadata").default({}),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const subscriptionPlanRbacMappingsRelations = relations(
	subscriptionPlanRbacMappings,
	({ one }) => ({
		plan: one(subscriptionPlans, {
			fields: [subscriptionPlanRbacMappings.planId],
			references: [subscriptionPlans.id],
		}),
	}),
);

export const subscriptionStatusHistoryRelations = relations(
	subscriptionStatusHistory,
	({ one }) => ({
		subscription: one(userSubscriptions, {
			fields: [subscriptionStatusHistory.subscriptionId],
			references: [userSubscriptions.id],
		}),
	}),
);

// Types
export type SubscriptionPlanRbacMapping =
	typeof subscriptionPlanRbacMappings.$inferSelect;
export type NewSubscriptionPlanRbacMapping =
	typeof subscriptionPlanRbacMappings.$inferInsert;
export type SubscriptionStatusHistory =
	typeof subscriptionStatusHistory.$inferSelect;
export type NewSubscriptionStatusHistory =
	typeof subscriptionStatusHistory.$inferInsert;

