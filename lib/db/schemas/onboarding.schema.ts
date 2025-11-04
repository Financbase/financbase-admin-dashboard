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
	boolean as pgBoolean,
	pgEnum,
	jsonb,
	integer,
} from "drizzle-orm/pg-core";

// Enums for onboarding system
export const persona = pgEnum("persona", [
	"digital_agency",
	"real_estate", 
	"tech_startup",
	"freelancer"
]);

export const onboardingStatus = pgEnum("onboarding_status", [
	"not_started",
	"in_progress", 
	"completed",
	"skipped"
]);

export const stepStatus = pgEnum("step_status", [
	"not_started",
	"in_progress",
	"completed", 
	"skipped"
]);

// User Onboarding table - tracks overall onboarding progress
export const userOnboarding = pgTable("user_onboarding", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: uuid("user_id").notNull().unique(),
	persona: persona("persona").notNull(),
	status: onboardingStatus("status").default("not_started"),
	currentStep: text("current_step"),
	totalSteps: integer("total_steps").default(0),
	completedSteps: integer("completed_steps").default(0),
	startedAt: timestamp("started_at"),
	completedAt: timestamp("completed_at"),
	skippedAt: timestamp("skipped_at"),
	metadata: jsonb("metadata").default({}),
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow(),
});

// Onboarding Steps table - tracks individual step progress
export const onboardingSteps = pgTable("onboarding_steps", {
	id: uuid("id").primaryKey().defaultRandom(),
	userOnboardingId: uuid("user_onboarding_id").notNull(),
	stepId: text("step_id").notNull(), // e.g., "import_clients", "setup_integrations"
	stepName: text("step_name").notNull(),
	stepOrder: integer("step_order").notNull(),
	status: stepStatus("status").default("not_started"),
	isRequired: pgBoolean("is_required").default(true),
	stepData: jsonb("step_data").default({}), // Store submitted form data
	startedAt: timestamp("started_at"),
	completedAt: timestamp("completed_at"),
	skippedAt: timestamp("skipped_at"),
	errorMessage: text("error_message"),
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow(),
});

// Onboarding Templates table - stores step definitions for each persona
export const onboardingTemplates = pgTable("onboarding_templates", {
	id: uuid("id").primaryKey().defaultRandom(),
	persona: persona("persona").notNull(),
	stepId: text("step_id").notNull(),
	stepName: text("step_name").notNull(),
	stepOrder: integer("step_order").notNull(),
	isRequired: pgBoolean("is_required").default(true),
	stepType: text("step_type", { enum: ["form", "import", "integration", "demo", "invite"] }).notNull(),
	stepConfig: jsonb("step_config").notNull(), // Configuration for the step
	description: text("description"),
	helpText: text("help_text"),
	estimatedTime: integer("estimated_time"), // in minutes
	isActive: pgBoolean("is_active").default(true),
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow(),
});

// Onboarding Analytics table - track completion metrics
export const onboardingAnalytics = pgTable("onboarding_analytics", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: uuid("user_id").notNull(),
	persona: persona("persona").notNull(),
	eventType: text("event_type", { 
		enum: ["started", "step_completed", "step_skipped", "completed", "abandoned"] 
	}).notNull(),
	stepId: text("step_id"),
	stepName: text("step_name"),
	timeSpent: integer("time_spent"), // in seconds
	metadata: jsonb("metadata").default({}),
	createdAt: timestamp("created_at").defaultNow(),
});

// Types
export type UserOnboarding = typeof userOnboarding.$inferSelect;
export type NewUserOnboarding = typeof userOnboarding.$inferInsert;
export type OnboardingStep = typeof onboardingSteps.$inferSelect;
export type NewOnboardingStep = typeof onboardingSteps.$inferInsert;
export type OnboardingTemplate = typeof onboardingTemplates.$inferSelect;
export type NewOnboardingTemplate = typeof onboardingTemplates.$inferInsert;
export type OnboardingAnalytics = typeof onboardingAnalytics.$inferSelect;
export type NewOnboardingAnalytics = typeof onboardingAnalytics.$inferInsert;

// Persona and status types
export type Persona = typeof persona.enumValues[number];
export type OnboardingStatus = typeof onboardingStatus.enumValues[number];
export type StepStatus = typeof stepStatus.enumValues[number];
