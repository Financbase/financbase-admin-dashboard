/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { pgTable, serial, text, timestamp, boolean, jsonb, integer, decimal, varchar, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const workflowStatusEnum = pgEnum('workflow_status', ['draft', 'active', 'paused', 'archived']);
export const executionStatusEnum = pgEnum('execution_status', ['pending', 'running', 'completed', 'failed', 'cancelled']);
export const triggerTypeEnum = pgEnum('trigger_type', ['invoice_created', 'expense_approved', 'report_generated', 'webhook', 'schedule', 'manual']);
export const stepTypeEnum = pgEnum('step_type', ['action', 'condition', 'delay', 'webhook', 'email', 'notification', 'gpt']);
export const logLevelEnum = pgEnum('log_level', ['debug', 'info', 'warning', 'error', 'critical']);

// Workflows table
export const workflows = pgTable('workflows', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  category: text('category').notNull().default('general'),
  type: text('type').notNull().default('sequential'), // sequential, parallel, conditional
  status: workflowStatusEnum('status').notNull().default('draft'),
  isActive: boolean('is_active').notNull().default(false),
  steps: jsonb('steps').notNull().default('[]'),
  triggers: jsonb('triggers').notNull().default('[]'),
  variables: jsonb('variables').default('{}'),
  settings: jsonb('settings').default('{}'),
  executionCount: integer('execution_count').notNull().default(0),
  successCount: integer('success_count').notNull().default(0),
  failureCount: integer('failure_count').notNull().default(0),
  lastExecutionAt: timestamp('last_execution_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Workflow executions table
export const workflowExecutions = pgTable('workflow_executions', {
  id: serial('id').primaryKey(),
  workflowId: integer('workflow_id').notNull().references(() => workflows.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull(),
  executionId: varchar('execution_id', { length: 50 }).notNull().unique(),
  status: executionStatusEnum('status').notNull().default('pending'),
  triggerData: jsonb('trigger_data').default('{}'),
  inputData: jsonb('input_data').default('{}'),
  outputData: jsonb('output_data').default('{}'),
  errorData: jsonb('error_data'),
  startedAt: timestamp('started_at').notNull().defaultNow(),
  completedAt: timestamp('completed_at'),
  duration: decimal('duration', { precision: 10, scale: 3 }), // in seconds
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Workflow triggers table
export const workflowTriggers = pgTable('workflow_triggers', {
  id: serial('id').primaryKey(),
  workflowId: integer('workflow_id').notNull().references(() => workflows.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull(),
  eventType: triggerTypeEnum('event_type').notNull(),
  conditions: jsonb('conditions').default('{}'),
  filters: jsonb('filters').default('{}'),
  webhookUrl: text('webhook_url'),
  scheduleExpression: text('schedule_expression'), // cron expression for scheduled triggers
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Workflow steps table
export const workflowSteps = pgTable('workflow_steps', {
  id: serial('id').primaryKey(),
  workflowId: integer('workflow_id').notNull().references(() => workflows.id, { onDelete: 'cascade' }),
  stepId: varchar('step_id', { length: 50 }).notNull(),
  name: text('name').notNull(),
  type: stepTypeEnum('type').notNull(),
  configuration: jsonb('configuration').notNull().default('{}'),
  parameters: jsonb('parameters').default('{}'),
  conditions: jsonb('conditions').default('{}'),
  timeout: integer('timeout').notNull().default(300), // in seconds
  retryCount: integer('retry_count').notNull().default(0),
  retryDelay: integer('retry_delay').notNull().default(5), // in seconds
  order: integer('order').notNull().default(0),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Workflow logs table
export const workflowLogs = pgTable('workflow_logs', {
  id: serial('id').primaryKey(),
  workflowId: integer('workflow_id').notNull().references(() => workflows.id, { onDelete: 'cascade' }),
  executionId: varchar('execution_id', { length: 50 }),
  userId: text('user_id').notNull(),
  level: logLevelEnum('level').notNull().default('info'),
  message: text('message').notNull(),
  details: jsonb('details').default('{}'),
  stepId: varchar('step_id', { length: 50 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Workflow templates table
export const workflowTemplates = pgTable('workflow_templates', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  category: text('category').notNull(),
  templateConfig: jsonb('template_config').notNull(),
  isPopular: boolean('is_popular').notNull().default(false),
  isOfficial: boolean('is_official').notNull().default(false),
  usageCount: integer('usage_count').notNull().default(0),
  authorId: text('author_id'),
  tags: jsonb('tags').default('[]'),
  version: text('version').notNull().default('1.0.0'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Note: webhookEvents table moved to webhooks.schema.ts to avoid conflicts

// Relations
export const workflowsRelations = relations(workflows, ({ many }) => ({
  executions: many(workflowExecutions),
  triggers: many(workflowTriggers),
  steps: many(workflowSteps),
  logs: many(workflowLogs),
}));

export const workflowExecutionsRelations = relations(workflowExecutions, ({ one }) => ({
  workflow: one(workflows, {
    fields: [workflowExecutions.workflowId],
    references: [workflows.id],
  }),
}));

export const workflowTriggersRelations = relations(workflowTriggers, ({ one }) => ({
  workflow: one(workflows, {
    fields: [workflowTriggers.workflowId],
    references: [workflows.id],
  }),
}));

export const workflowStepsRelations = relations(workflowSteps, ({ one }) => ({
  workflow: one(workflows, {
    fields: [workflowSteps.workflowId],
    references: [workflows.id],
  }),
}));

export const workflowLogsRelations = relations(workflowLogs, ({ one }) => ({
  workflow: one(workflows, {
    fields: [workflowLogs.workflowId],
    references: [workflows.id],
  }),
}));

// Indexes for performance
export const workflowsIndexes = {
  userId: 'workflows_user_id_idx',
  status: 'workflows_status_idx',
  isActive: 'workflows_is_active_idx',
  category: 'workflows_category_idx',
  lastExecutionAt: 'workflows_last_execution_at_idx',
};

export const workflowExecutionsIndexes = {
  workflowId: 'workflow_executions_workflow_id_idx',
  userId: 'workflow_executions_user_id_idx',
  executionId: 'workflow_executions_execution_id_idx',
  status: 'workflow_executions_status_idx',
  startedAt: 'workflow_executions_started_at_idx',
};

export const workflowTriggersIndexes = {
  workflowId: 'workflow_triggers_workflow_id_idx',
  eventType: 'workflow_triggers_event_type_idx',
  isActive: 'workflow_triggers_is_active_idx',
};

export const workflowStepsIndexes = {
  workflowId: 'workflow_steps_workflow_id_idx',
  stepId: 'workflow_steps_step_id_idx',
  order: 'workflow_steps_order_idx',
};

export const workflowLogsIndexes = {
  workflowId: 'workflow_logs_workflow_id_idx',
  executionId: 'workflow_logs_execution_id_idx',
  level: 'workflow_logs_level_idx',
  createdAt: 'workflow_logs_created_at_idx',
};

// Note: webhookEvents indexes moved to webhooks.schema.ts
