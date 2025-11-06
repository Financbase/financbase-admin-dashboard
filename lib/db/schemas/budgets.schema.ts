/**
 * Database schema for budget tracking and management
 */

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
	serial,
	text,
	decimal,
	timestamp,
	boolean,
	jsonb,
	integer,
} from "drizzle-orm/pg-core";

/**
 * Budgets Table
 * Main table for tracking budget allocations by category
 */
export const budgets = pgTable("budgets", {
	id: serial("id").primaryKey(),
	userId: text("user_id").notNull(),
	
	// Budget details
	name: text("name").notNull(), // Budget name (e.g., "Marketing Q1 2025")
	category: text("category").notNull(), // Category name (e.g., "Marketing", "Operations")
	description: text("description"),
	
	// Budget amount
	budgetedAmount: decimal("budgeted_amount", { precision: 12, scale: 2 }).notNull(),
	currency: text("currency").notNull().default("USD"),
	
	// Period configuration
	periodType: text("period_type").notNull().default("monthly"), // monthly, yearly
	startDate: timestamp("start_date").notNull(),
	endDate: timestamp("end_date").notNull(),
	
	// Alert thresholds (JSON array of percentages: [80, 90, 100])
	alertThresholds: jsonb("alert_thresholds").$type<number[]>().default([80, 90, 100]),
	
	// Status
	status: text("status").default("active").notNull(), // active, archived, paused
	
	// Metadata
	notes: text("notes"),
	tags: jsonb("tags").$type<string[]>(),
	metadata: jsonb("metadata").$type<Record<string, unknown>>(),
	
	// Timestamps
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * Budget Categories Table
 * Predefined and custom budget categories
 */
export const budgetCategories = pgTable("budget_categories", {
	id: serial("id").primaryKey(),
	userId: text("user_id").notNull(),
	
	// Category details
	name: text("name").notNull(),
	description: text("description"),
	color: text("color").default("#3b82f6"), // Hex color code for UI
	icon: text("icon"), // Icon name for UI
	
	// Default budget settings
	defaultMonthlyBudget: decimal("default_monthly_budget", { precision: 12, scale: 2 }),
	defaultYearlyBudget: decimal("default_yearly_budget", { precision: 12, scale: 2 }),
	
	// Status
	isDefault: boolean("is_default").default(false), // System default categories
	isActive: boolean("is_active").default(true),
	
	// Timestamps
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * Budget Alerts Table
 * Track budget alert history and rules
 */
export const budgetAlerts = pgTable("budget_alerts", {
	id: serial("id").primaryKey(),
	budgetId: integer("budget_id").references(() => budgets.id).notNull(),
	userId: text("user_id").notNull(),
	
	// Alert details
	alertType: text("alert_type").notNull(), // warning, critical, over-budget
	threshold: decimal("threshold", { precision: 5, scale: 2 }).notNull(), // Percentage threshold
	message: text("message").notNull(),
	
	// Status
	isActive: boolean("is_active").default(true),
	isRead: boolean("is_read").default(false),
	acknowledgedAt: timestamp("acknowledged_at"),
	
	// Calculated values at time of alert
	spendingPercentage: decimal("spending_percentage", { precision: 5, scale: 2 }),
	budgetedAmount: decimal("budgeted_amount", { precision: 12, scale: 2 }),
	spentAmount: decimal("spent_amount", { precision: 12, scale: 2 }),
	remainingAmount: decimal("remaining_amount", { precision: 12, scale: 2 }),
	
	// Timestamps
	triggeredAt: timestamp("triggered_at").defaultNow().notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Type exports
export type Budget = typeof budgets.$inferSelect;
export type NewBudget = typeof budgets.$inferInsert;

export type BudgetCategory = typeof budgetCategories.$inferSelect;
export type NewBudgetCategory = typeof budgetCategories.$inferInsert;

export type BudgetAlert = typeof budgetAlerts.$inferSelect;
export type NewBudgetAlert = typeof budgetAlerts.$inferInsert;

