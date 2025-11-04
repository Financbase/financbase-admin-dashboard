/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { pgTable, text, integer, timestamp, boolean, uuid, jsonb } from "drizzle-orm/pg-core";
import type { webhookEvents as WorkflowWebhookEvents } from "./webhooks.schema";

// Reports table
export const reports = pgTable("reports", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: text("user_id").notNull(),
	name: text("name").notNull(),
	description: text("description"),
	type: text("type").notNull(), // 'financial', 'property', 'client', 'custom'
	templateId: uuid("template_id").references(() => reportTemplates.id),
	parameters: jsonb("parameters"), // Report parameters
	status: text("status").default("pending"), // 'pending', 'running', 'completed', 'failed'
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Report history table
export const reportHistory = pgTable("report_history", {
	id: uuid("id").primaryKey().defaultRandom(),
	reportId: uuid("report_id").references(() => reports.id, { onDelete: "cascade" }).notNull(),
	userId: text("user_id").notNull(),
	executionId: text("execution_id").notNull(),
	status: text("status").notNull(), // 'success', 'failed', 'running'
	result: jsonb("result"), // Report result data
	error: text("error"), // Error message if failed
	startedAt: timestamp("started_at").notNull(),
	completedAt: timestamp("completed_at"),
	duration: integer("duration"), // Duration in milliseconds
	createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Report templates table
export const reportTemplates = pgTable("report_templates", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: text("user_id").notNull(),
	name: text("name").notNull(),
	description: text("description"),
	category: text("category").notNull(), // 'financial', 'property', 'client', 'operational'
	query: text("query").notNull(), // SQL query template
	parameters: jsonb("parameters"), // Available parameters
	isPublic: boolean("is_public").default(false),
	isActive: boolean("is_active").default(true),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Webhook events table - using the one from webhooks.schema.ts
export { webhookEvents as WorkflowWebhookEvents } from "./webhooks.schema";
export type WebhookEvent = typeof webhookEvents.$inferSelect;
export type NewWebhookEvent = typeof webhookEvents.$inferInsert;