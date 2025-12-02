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
	numeric,
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

/**
 * Workflow triggers table - Stores workflow trigger configurations
 */
export const workflowTriggers = pgTable(
	"financbase_workflow_triggers",
	{
		id: serial("id").primaryKey(),
		workflowId: integer("workflow_id")
			.notNull()
			.references(() => workflows.id, { onDelete: "cascade" }),
		userId: text("user_id").notNull(),
		type: text("type").notNull(), // invoice_created, expense_approved, report_generated, webhook, schedule, manual
		name: text("name").notNull(),
		description: text("description"),
		conditions: jsonb("conditions").notNull(), // Specific conditions for triggering
		filters: jsonb("filters"), // Additional filtering logic
		eventType: text("event_type"), // invoice, expense, user, system, etc.
		entityId: text("entity_id"), // ID of the entity that triggered
		entityType: text("entity_type"), // invoice, expense, user, etc.
		webhookUrl: text("webhook_url"),
		webhookSecret: text("webhook_secret"),
		webhookHeaders: jsonb("webhook_headers"),
		isActive: boolean("is_active").notNull().default(true),
		priority: text("priority").default("normal"), // low, normal, high, urgent
		maxExecutionsPerHour: integer("max_executions_per_hour").default(100),
		executionsThisHour: integer("executions_this_hour").default(0),
		createdAt: timestamp("created_at").notNull().defaultNow(),
		updatedAt: timestamp("updated_at").notNull().defaultNow(),
	},
	(table) => ({
		workflowIdIdx: index("workflow_triggers_workflow_id_idx").on(table.workflowId),
		userIdIdx: index("workflow_triggers_user_id_idx").on(table.userId),
		typeIdx: index("workflow_triggers_type_idx").on(table.type),
		isActiveIdx: index("workflow_triggers_is_active_idx").on(table.isActive),
	})
);

/**
 * Workflow logs table - Stores workflow execution logs
 */
export const workflowLogs = pgTable(
	"financbase_workflow_logs",
	{
		id: serial("id").primaryKey(),
		workflowId: integer("workflow_id")
			.references(() => workflows.id, { onDelete: "cascade" }),
		executionId: text("execution_id"),
		userId: text("user_id").notNull(),
		level: text("level").default("info"), // info, warning, error, debug
		message: text("message").notNull(),
		details: jsonb("details"),
		stepId: text("step_id"),
		entityId: text("entity_id"),
		entityType: text("entity_type"),
		executionTime: numeric("execution_time", { precision: 10, scale: 3 }),
		memoryUsage: numeric("memory_usage", { precision: 10, scale: 2 }),
		errorCode: text("error_code"),
		errorStack: text("error_stack"),
		createdAt: timestamp("created_at").notNull().defaultNow(),
	},
	(table) => ({
		workflowIdIdx: index("workflow_logs_workflow_id_idx").on(table.workflowId),
		executionIdIdx: index("workflow_logs_execution_id_idx").on(table.executionId),
		userIdIdx: index("workflow_logs_user_id_idx").on(table.userId),
		levelIdx: index("workflow_logs_level_idx").on(table.level),
		createdAtIdx: index("workflow_logs_created_at_idx").on(table.createdAt),
	})
);
