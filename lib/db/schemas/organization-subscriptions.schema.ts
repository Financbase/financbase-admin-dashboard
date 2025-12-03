/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { pgTable, uuid, text, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { organizations } from "./organizations.schema";
import { subscriptionPlans, subscriptionStatus } from "./billing.schema";

// Organization Subscriptions table - links subscriptions to organizations instead of users
export const organizationSubscriptions = pgTable("organization_subscriptions", {
	id: uuid("id").primaryKey().defaultRandom(),
	organizationId: uuid("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
	planId: uuid("plan_id").notNull().references(() => subscriptionPlans.id),
	status: subscriptionStatus("status").default("trial"),
	currentPeriodStart: timestamp("current_period_start", { withTimezone: true }).notNull(),
	currentPeriodEnd: timestamp("current_period_end", { withTimezone: true }).notNull(),
	trialStart: timestamp("trial_start", { withTimezone: true }),
	trialEnd: timestamp("trial_end", { withTimezone: true }),
	cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
	cancelReason: text("cancel_reason"),
	nextBillingDate: timestamp("next_billing_date", { withTimezone: true }),
	autoRenew: boolean("auto_renew").default(true),
	stripeSubscriptionId: text("stripe_subscription_id"),
	stripeCustomerId: text("stripe_customer_id"),
	metadata: jsonb("metadata").default({}),
	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// Relations
export const organizationSubscriptionsRelations = relations(organizationSubscriptions, ({ one }) => ({
	organization: one(organizations, {
		fields: [organizationSubscriptions.organizationId],
		references: [organizations.id],
	}),
	plan: one(subscriptionPlans, {
		fields: [organizationSubscriptions.planId],
		references: [subscriptionPlans.id],
	}),
}));

// Types
export type OrganizationSubscription = typeof organizationSubscriptions.$inferSelect;
export type NewOrganizationSubscription = typeof organizationSubscriptions.$inferInsert;

