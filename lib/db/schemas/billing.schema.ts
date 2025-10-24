// Subscription and Billing Management System Schemas

import { pgTable, uuid, text, timestamp, boolean, integer, numeric, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Enums
export const subscriptionStatus = pgEnum("subscription_status", ["active", "inactive", "cancelled", "expired", "suspended", "trial"]);
export const subscriptionInterval = pgEnum("subscription_interval", ["monthly", "yearly", "lifetime"]);
export const billingStatus = pgEnum("billing_status", ["pending", "paid", "failed", "overdue", "cancelled", "refunded"]);
export const paymentMethodStatus = pgEnum("payment_method_status", ["active", "inactive", "expired", "failed"]);

// Subscription Plans table
export const subscriptionPlans = pgTable("subscription_plans", {
	id: uuid("id").primaryKey().defaultRandom(),
	name: text("name").notNull(),
	description: text("description"),
	priceMonthly: numeric("price_monthly", { precision: 10, scale: 2 }).notNull(),
	priceYearly: numeric("price_yearly", { precision: 10, scale: 2 }).notNull(),
	interval: subscriptionInterval("interval").notNull(),
	features: jsonb("features").notNull().default({}),
	limits: jsonb("limits").notNull().default({}),
	isPopular: boolean("is_popular").default(false),
	isEnterprise: boolean("is_enterprise").default(false),
	sortOrder: integer("sort_order").default(0),
	isActive: boolean("is_active").default(true),
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow(),
});

// User Subscriptions table
export const userSubscriptions = pgTable("user_subscriptions", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: uuid("user_id").notNull(),
	planId: uuid("plan_id").notNull().references(() => subscriptionPlans.id),
	status: subscriptionStatus("status").default("trial"),
	currentPeriodStart: timestamp("current_period_start").notNull(),
	currentPeriodEnd: timestamp("current_period_end").notNull(),
	trialStart: timestamp("trial_start"),
	trialEnd: timestamp("trial_end"),
	cancelledAt: timestamp("cancelled_at"),
	cancelReason: text("cancel_reason"),
	nextBillingDate: timestamp("next_billing_date"),
	autoRenew: boolean("auto_renew").default(true),
	stripeSubscriptionId: text("stripe_subscription_id"),
	stripeCustomerId: text("stripe_customer_id"),
	metadata: jsonb("metadata"),
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow(),
});

// Billing History table
export const billingHistory = pgTable("billing_history", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: uuid("user_id").notNull(),
	subscriptionId: uuid("subscription_id").references(() => userSubscriptions.id, { onDelete: "set null" }),
	amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
	currency: text("currency").default("USD"),
	status: billingStatus("status").default("pending"),
	description: text("description"),
	invoiceUrl: text("invoice_url"),
	stripeInvoiceId: text("stripe_invoice_id"),
	stripePaymentIntentId: text("stripe_payment_intent_id"),
	paymentMethod: text("payment_method"),
	billedAt: timestamp("billed_at"),
	createdAt: timestamp("created_at").defaultNow(),
});

// Payment Methods table
export const userPaymentMethods = pgTable("user_payment_methods", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: uuid("user_id").notNull(),
	type: text("type").notNull(),
	stripePaymentMethodId: text("stripe_payment_method_id"),
	last4: text("last4"),
	brand: text("brand"),
	expiryMonth: integer("expiry_month"),
	expiryYear: integer("expiry_year"),
	isDefault: boolean("is_default").default(false),
	status: paymentMethodStatus("status").default("active"),
	metadata: jsonb("metadata"),
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow(),
});

// Usage tracking table
export const usageTracking = pgTable("usage_tracking", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: uuid("user_id").notNull(),
	feature: text("feature").notNull(),
	count: integer("count").default(0),
	limit: integer("limit"),
	periodStart: timestamp("period_start").notNull(),
	periodEnd: timestamp("period_end").notNull(),
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const subscriptionPlansRelations = relations(subscriptionPlans, ({ many }) => ({
	subscriptions: many(userSubscriptions),
}));

export const userSubscriptionsRelations = relations(userSubscriptions, ({ one, many }) => ({
	plan: one(subscriptionPlans, {
		fields: [userSubscriptions.planId],
		references: [subscriptionPlans.id],
	}),
	billingHistory: many(billingHistory),
}));

export const billingHistoryRelations = relations(billingHistory, ({ one }) => ({
	subscription: one(userSubscriptions, {
		fields: [billingHistory.subscriptionId],
		references: [userSubscriptions.id],
	}),
}));

export const userPaymentMethodsRelations = relations(userPaymentMethods, ({ one }) => ({
	user: one(subscriptionPlans, {
		fields: [userPaymentMethods.userId],
		references: [subscriptionPlans.id],
	}),
}));

// Types
export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;
export type NewSubscriptionPlan = typeof subscriptionPlans.$inferInsert;
export type UserSubscription = typeof userSubscriptions.$inferSelect;
export type NewUserSubscription = typeof userSubscriptions.$inferInsert;
export type BillingHistory = typeof billingHistory.$inferSelect;
export type NewBillingHistory = typeof billingHistory.$inferInsert;
export type UserPaymentMethod = typeof userPaymentMethods.$inferSelect;
export type NewUserPaymentMethod = typeof userPaymentMethods.$inferInsert;
export type UsageTracking = typeof usageTracking.$inferSelect;
export type NewUsageTracking = typeof usageTracking.$inferInsert;
