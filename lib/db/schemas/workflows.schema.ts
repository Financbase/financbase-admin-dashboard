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
	integer,
	boolean,
	jsonb,
	serial,
	index,
	decimal,
} from "drizzle-orm/pg-core";

/**
 * Workflows table - Stores workflow definitions
 */
export const workflows = pgTable(
	"financbase_workflows",
	{
		id: serial("id").primaryKey(),
		userId: text("user_id").notNull(),
		organizationId: text("organization_id"),
		name: text("name").notNull(),
		description: text("description"),
		triggerConfig: jsonb("trigger_config").notNull(), // { type: 'event' | 'schedule' | 'webhook', config: {...} }
		actions: jsonb("actions").notNull(), // Array of action configurations
		conditions: jsonb("conditions"), // Conditional logic for workflow execution
		status: text("status", {
			enum: ["active", "inactive", "draft", "archived"],
		})
			.notNull()
			.default("draft"),
		isTemplate: boolean("is_template").notNull().default(false),
		templateCategory: text("template_category"), // e.g., 'invoice', 'expense', 'notification'
		isPublic: boolean("is_public").notNull().default(false),
		executionCount: integer("execution_count").notNull().default(0),
		lastExecutedAt: timestamp("last_executed_at"),
		metadata: jsonb("metadata"),
		createdAt: timestamp("created_at").notNull().defaultNow(),
		updatedAt: timestamp("updated_at").notNull().defaultNow(),
	},
	(table) => ({
		userIdIdx: index("workflows_user_id_idx").on(table.userId),
		organizationIdIdx: index("workflows_organization_id_idx").on(table.organizationId),
		statusIdx: index("workflows_status_idx").on(table.status),
		isTemplateIdx: index("workflows_is_template_idx").on(table.isTemplate),
		templateCategoryIdx: index("workflows_template_category_idx").on(table.templateCategory),
		createdAtIdx: index("workflows_created_at_idx").on(table.createdAt),
		compositeUserStatusIdx: index("workflows_user_status_idx").on(
			table.userId,
			table.status
		),
	})
);

/**
 * Workflow executions table - Tracks workflow execution history
 */
export const workflowExecutions = pgTable(
	"financbase_workflow_executions",
	{
		id: serial("id").primaryKey(),
		workflowId: integer("workflow_id")
			.notNull()
			.references(() => workflows.id, { onDelete: "cascade" }),
		userId: text("user_id").notNull(),
		status: text("status", {
			enum: ["pending", "running", "completed", "failed", "cancelled"],
		})
			.notNull()
			.default("pending"),
		triggeredBy: text("triggered_by"), // 'user' | 'event' | 'schedule' | 'webhook'
		triggerData: jsonb("trigger_data"), // Data that triggered the workflow
		startedAt: timestamp("started_at").notNull().defaultNow(),
		completedAt: timestamp("completed_at"),
		duration: integer("duration"), // Duration in milliseconds
		error: text("error"), // Error message if failed
		errorDetails: jsonb("error_details"), // Detailed error information
		executionLog: jsonb("execution_log"), // Step-by-step execution log
		results: jsonb("results"), // Results from workflow execution
		metadata: jsonb("metadata"),
		createdAt: timestamp("created_at").notNull().defaultNow(),
	},
	(table) => ({
		workflowIdIdx: index("workflow_executions_workflow_id_idx").on(table.workflowId),
		userIdIdx: index("workflow_executions_user_id_idx").on(table.userId),
		statusIdx: index("workflow_executions_status_idx").on(table.status),
		startedAtIdx: index("workflow_executions_started_at_idx").on(table.startedAt),
		compositeWorkflowStatusIdx: index("workflow_executions_workflow_status_idx").on(
			table.workflowId,
			table.status
		),
		compositeUserStatusIdx: index("workflow_executions_user_status_idx").on(
			table.userId,
			table.status
		),
	})
);

/**
 * Workflow templates table - Pre-built workflow templates
 */
export const workflowTemplates = pgTable(
	"financbase_workflow_templates",
	{
		id: serial("id").primaryKey(),
		name: text("name").notNull(),
		description: text("description").notNull(),
		category: text("category").notNull(), // 'invoice', 'expense', 'notification', 'integration', etc.
		icon: text("icon"), // Icon identifier or URL
		triggerConfig: jsonb("trigger_config").notNull(),
		actions: jsonb("actions").notNull(),
		conditions: jsonb("conditions"),
		isPublic: boolean("is_public").notNull().default(true),
		isOfficial: boolean("is_official").notNull().default(false), // Official Financbase templates
		usageCount: integer("usage_count").notNull().default(0),
		rating: decimal("rating", { precision: 3, scale: 2 }), // Average rating 0-5
		ratingCount: integer("rating_count").notNull().default(0),
		createdBy: text("created_by"), // User ID who created the template
		metadata: jsonb("metadata"),
		createdAt: timestamp("created_at").notNull().defaultNow(),
		updatedAt: timestamp("updated_at").notNull().defaultNow(),
	},
	(table) => ({
		categoryIdx: index("workflow_templates_category_idx").on(table.category),
		isPublicIdx: index("workflow_templates_is_public_idx").on(table.isPublic),
		isOfficialIdx: index("workflow_templates_is_official_idx").on(table.isOfficial),
		usageCountIdx: index("workflow_templates_usage_count_idx").on(table.usageCount),
		compositeCategoryPublicIdx: index("workflow_templates_category_public_idx").on(
			table.category,
			table.isPublic
		),
	})
);
