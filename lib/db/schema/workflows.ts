import { pgTable, serial, text, timestamp, jsonb, boolean, numeric } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const workflows = pgTable('workflows', {
	id: serial('id').primaryKey(),
	userId: text('user_id').notNull(),

	// Workflow metadata
	name: text('name').notNull(),
	description: text('description'),
	category: text('category').default('general'), // invoice, expense, reporting, etc.
	type: text('type').default('sequential'), // sequential, parallel, conditional

	// Status and lifecycle
	status: text('status').default('draft'), // draft, active, paused, archived
	isActive: boolean('is_active').default(true),
	isTemplate: boolean('is_template').default(false),

	// Workflow structure
	steps: jsonb('steps').notNull(), // Array of workflow steps
	triggers: jsonb('triggers').notNull(), // Array of trigger conditions
	conditions: jsonb('conditions'), // Conditional logic
	variables: jsonb('variables'), // Global workflow variables

	// Scheduling and automation
	isScheduled: boolean('is_scheduled').default(false),
	schedule: jsonb('schedule'), // Cron expression or schedule config
	maxExecutions: serial('max_executions'),
	executionCount: serial('execution_count').default(0),

	// Performance and monitoring
	avgExecutionTime: numeric('avg_execution_time', { precision: 10, scale: 2 }),
	lastExecutionAt: timestamp('last_execution_at'),
	nextExecutionAt: timestamp('next_execution_at'),
	errorCount: serial('error_count').default(0),
	successRate: numeric('success_rate', { precision: 5, scale: 2 }).default('100'),

	// Integration settings
	webhookUrl: text('webhook_url'),
	apiKey: text('api_key'),
	integrationSettings: jsonb('integration_settings'),

	// Audit trail
	createdBy: text('created_by'),
	updatedBy: text('updated_by'),
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').defaultNow(),
});

export const workflowExecutions = pgTable('workflow_executions', {
	id: serial('id').primaryKey(),
	workflowId: serial('workflow_id').notNull(),
	userId: text('user_id').notNull(),

	// Execution details
	executionId: text('execution_id').notNull().unique(), // UUID for tracking
	status: text('status').default('running'), // running, completed, failed, cancelled
	startTime: timestamp('start_time').defaultNow(),
	endTime: timestamp('end_time'),
	duration: numeric('duration', { precision: 10, scale: 2 }), // execution time in seconds

	// Input and output
	triggerData: jsonb('trigger_data'), // Data that triggered the workflow
	inputData: jsonb('input_data'), // Input parameters
	outputData: jsonb('output_data'), // Execution results
	errorData: jsonb('error_data'), // Error details if failed

	// Step tracking
	currentStep: text('current_step'),
	completedSteps: jsonb('completed_steps').$defaultFn(() => []),
	stepResults: jsonb('step_results'), // Results from each step

	// Performance metrics
	cpuTime: numeric('cpu_time', { precision: 10, scale: 3 }),
	memoryUsage: numeric('memory_usage', { precision: 10, scale: 2 }),
	apiCalls: serial('api_calls').default(0),

	// Audit
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').defaultNow(),
});

export const workflowTriggers = pgTable('workflow_triggers', {
	id: serial('id').primaryKey(),
	workflowId: serial('workflow_id').notNull(),
	userId: text('user_id').notNull(),

	// Trigger configuration
	type: text('type').notNull(), // invoice_created, expense_approved, report_generated, webhook, schedule, manual
	name: text('name').notNull(),
	description: text('description'),

	// Trigger conditions
	conditions: jsonb('conditions').notNull(), // Specific conditions for triggering
	filters: jsonb('filters'), // Additional filtering logic

	// Event data
	eventType: text('event_type'), // invoice, expense, user, system, etc.
	entityId: text('entity_id'), // ID of the entity that triggered
	entityType: text('entity_type'), // invoice, expense, user, etc.

	// Webhook configuration
	webhookUrl: text('webhook_url'),
	webhookSecret: text('webhook_secret'),
	webhookHeaders: jsonb('webhook_headers'),

	// Status
	isActive: boolean('is_active').default(true),
	priority: text('priority').default('normal'), // low, normal, high, urgent

	// Rate limiting
	maxExecutionsPerHour: serial('max_executions_per_hour').default(100),
	executionsThisHour: serial('executions_this_hour').default(0),

	// Audit
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').defaultNow(),
});

export const workflowSteps = pgTable('workflow_steps', {
	id: serial('id').primaryKey(),
	workflowId: serial('workflow_id').notNull(),
	userId: text('user_id').notNull(),

	// Step configuration
	stepId: text('step_id').notNull(), // Unique identifier within workflow
	name: text('name').notNull(),
	description: text('description'),
	type: text('type').notNull(), // action, condition, delay, webhook, email, notification, etc.

	// Step logic
	configuration: jsonb('configuration').notNull(), // Step-specific settings
	parameters: jsonb('parameters'), // Input parameters
	conditions: jsonb('conditions'), // Conditional logic for execution

	// Position and flow
	position: serial('position').notNull(), // Order in workflow
	nextSteps: jsonb('next_steps'), // Array of next step IDs
	previousSteps: jsonb('previous_steps'), // Array of previous step IDs

	// Execution settings
	timeout: serial('timeout').default(300), // seconds
	retryCount: serial('retry_count').default(3),
	retryDelay: serial('retry_delay').default(60), // seconds

	// Status and performance
	isActive: boolean('is_active').default(true),
	executionCount: serial('execution_count').default(0),
	successCount: serial('success_count').default(0),
	errorCount: serial('error_count').default(0),
	avgExecutionTime: numeric('avg_execution_time', { precision: 10, scale: 2 }),

	// Integration
	integrationId: text('integration_id'),
	webhookUrl: text('webhook_url'),
	apiEndpoint: text('api_endpoint'),

	// Audit
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').defaultNow(),
});

export const workflowIntegrations = pgTable('workflow_integrations', {
	id: serial('id').primaryKey(),
	userId: text('user_id').notNull(),

	// Integration details
	name: text('name').notNull(),
	type: text('type').notNull(), // slack, email, webhook, api, database, etc.
	description: text('description'),

	// Configuration
	configuration: jsonb('configuration').notNull(), // Integration-specific settings
	credentials: jsonb('credentials'), // Encrypted credentials
	webhookUrl: text('webhook_url'),
	apiKey: text('api_key'),
	apiSecret: text('api_secret'),

	// Status and limits
	isActive: boolean('is_active').default(true),
	isVerified: boolean('is_verified').default(false),
	maxRequestsPerHour: serial('max_requests_per_hour').default(1000),
	requestsThisHour: serial('requests_this_hour').default(0),

	// Metadata
	icon: text('icon'),
	color: text('color'),
	documentationUrl: text('documentation_url'),

	// Audit
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').defaultNow(),
});

export const workflowTemplates = pgTable('workflow_templates', {
	id: serial('id').primaryKey(),
	userId: text('user_id'), // null for public templates

	// Template metadata
	name: text('name').notNull(),
	description: text('description').notNull(),
	category: text('category').notNull(),
	tags: jsonb('tags').$defaultFn(() => []),

	// Template content
	workflowDefinition: jsonb('workflow_definition').notNull(),
	defaultVariables: jsonb('default_variables'),
	exampleData: jsonb('example_data'),

	// Usage and popularity
	usageCount: serial('usage_count').default(0),
	rating: numeric('rating', { precision: 3, scale: 2 }).default('0'),
	reviewCount: serial('review_count').default(0),

	// Visibility
	isPublic: boolean('is_public').default(false),
	isFeatured: boolean('is_featured').default(false),
	isVerified: boolean('is_verified').default(false),

	// Preview and screenshots
	previewImage: text('preview_image'),
	screenshots: jsonb('screenshots'),

	// Status
	isActive: boolean('is_active').default(true),

	// Audit
	createdBy: text('created_by'),
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').defaultNow(),
});

export const workflowLogs = pgTable('workflow_logs', {
	id: serial('id').primaryKey(),
	workflowId: serial('workflow_id'),
	executionId: text('execution_id'),
	userId: text('user_id').notNull(),

	// Log details
	level: text('level').default('info'), // info, warning, error, debug
	message: text('message').notNull(),
	details: jsonb('details'),

	// Context
	stepId: text('step_id'),
	entityId: text('entity_id'),
	entityType: text('entity_type'),

	// Performance
	executionTime: numeric('execution_time', { precision: 10, scale: 3 }),
	memoryUsage: numeric('memory_usage', { precision: 10, scale: 2}),

	// Error tracking
	errorCode: text('error_code'),
	errorStack: text('error_stack'),

	// Audit
	createdAt: timestamp('created_at').defaultNow(),
});

export const webhookEvents = pgTable('webhook_events', {
	id: serial('id').primaryKey(),
	userId: text('user_id').notNull(),

	// Event details
	eventType: text('event_type').notNull(), // invoice.created, expense.approved, etc.
	entityId: text('entity_id').notNull(),
	entityType: text('entity_type').notNull(),

	// Webhook configuration
	webhookUrl: text('webhook_url').notNull(),
	webhookSecret: text('webhook_secret'),

	// Payload and delivery
	payload: jsonb('payload').notNull(),
	headers: jsonb('headers'),
	signature: text('signature'),

	// Delivery tracking
	deliveryAttempts: serial('delivery_attempts').default(0),
	lastAttemptAt: timestamp('last_attempt_at'),
	deliveredAt: timestamp('delivered_at'),
	failedAt: timestamp('failed_at'),

	// Status
	status: text('status').default('pending'), // pending, delivered, failed, retrying
	responseStatus: serial('response_status'),
	responseBody: text('response_body'),

	// Retry logic
	maxRetries: serial('max_retries').default(5),
	nextRetryAt: timestamp('next_retry_at'),

	// Audit
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').defaultNow(),
});
