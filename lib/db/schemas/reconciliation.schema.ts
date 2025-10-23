import {
	pgTable,
	text,
	timestamp,
	uuid,
	numeric,
	jsonb,
	pgEnum,
	boolean,
	integer,
} from "drizzle-orm/pg-core";
import { users } from "./users.schema";
import { transactions } from "./transactions.schema";
import { accounts } from "./accounts.schema";

// Enums for reconciliation
export const reconciliationStatusEnum = pgEnum("reconciliation_status", [
	"pending",
	"in_progress",
	"completed",
	"failed",
	"cancelled"
]);

export const reconciliationTypeEnum = pgEnum("reconciliation_type", [
	"bank_statement",
	"credit_card",
	"investment_account",
	"manual"
]);

export const matchStatusEnum = pgEnum("match_status", [
	"matched",
	"unmatched",
	"disputed",
	"resolved"
]);

export const matchConfidenceEnum = pgEnum("match_confidence", [
	"high",
	"medium",
	"low",
	"manual"
]);

export const discrepancyTypeEnum = pgEnum("discrepancy_type", [
	"amount_mismatch",
	"date_mismatch",
	"description_mismatch",
	"missing_transaction",
	"duplicate_transaction",
	"other"
]);

// Reconciliation sessions table
export const reconciliationSessions = pgTable("reconciliation_sessions", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: uuid("user_id").notNull().references(() => users.id),
	accountId: uuid("account_id").notNull().references(() => accounts.id),
	name: text("name").notNull(),
	description: text("description"),
	type: reconciliationTypeEnum("type").default("bank_statement"),
	status: reconciliationStatusEnum("status").default("pending"),

	// Date range for reconciliation
	startDate: timestamp("start_date", { withTimezone: true }).notNull(),
	endDate: timestamp("end_date", { withTimezone: true }).notNull(),

	// Reconciliation results
	totalTransactions: integer("total_transactions").default(0),
	matchedTransactions: integer("matched_transactions").default(0),
	unmatchedTransactions: integer("unmatched_transactions").default(0),
	discrepanciesFound: integer("discrepancies_found").default(0),

	// Financial totals
	statementBalance: numeric("statement_balance", { precision: 12, scale: 2 }),
	bookBalance: numeric("book_balance", { precision: 12, scale: 2 }),
	difference: numeric("difference", { precision: 12, scale: 2 }),

	// AI/ML insights
	aiConfidence: numeric("ai_confidence", { precision: 5, scale: 2 }), // 0-100
	aiRecommendations: jsonb("ai_recommendations"),

	// Session metadata
	metadata: jsonb("metadata"),
	notes: text("notes"),
	completedAt: timestamp("completed_at", { withTimezone: true }),
	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// Transaction matches table
export const reconciliationMatches = pgTable("reconciliation_matches", {
	id: uuid("id").primaryKey().defaultRandom(),
	sessionId: uuid("session_id").notNull().references(() => reconciliationSessions.id),

	// Bank statement side
	statementTransactionId: uuid("statement_transaction_id"),
	statementAmount: numeric("statement_amount", { precision: 12, scale: 2 }),
	statementDescription: text("statement_description"),
	statementDate: timestamp("statement_date", { withTimezone: true }),
	statementReference: text("statement_reference"),

	// Book transaction side
	bookTransactionId: uuid("book_transaction_id").references(() => transactions.id),
	bookAmount: numeric("book_amount", { precision: 12, scale: 2 }),
	bookDescription: text("book_description"),
	bookDate: timestamp("book_date", { withTimezone: true }),
	bookReference: text("book_reference"),

	// Match details
	status: matchStatusEnum("status").default("matched"),
	confidence: matchConfidenceEnum("confidence").default("medium"),
	confidenceScore: numeric("confidence_score", { precision: 5, scale: 2 }), // 0-100

	// Match criteria used
	matchCriteria: jsonb("match_criteria"), // What fields were used for matching
	matchReason: text("match_reason"), // AI explanation of why this match was made

	// Manual adjustments
	adjustedAmount: numeric("adjusted_amount", { precision: 12, scale: 2 }),
	adjustmentReason: text("adjustment_reason"),
	adjustmentBy: uuid("adjustment_by").references(() => users.id),
	adjustedAt: timestamp("adjusted_at", { withTimezone: true }),

	// Metadata
	metadata: jsonb("metadata"),
	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// Reconciliation rules for automated matching
export const reconciliationRules = pgTable("reconciliation_rules", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: uuid("user_id").notNull().references(() => users.id),
	accountId: uuid("account_id").references(() => accounts.id), // null = global rule

	name: text("name").notNull(),
	description: text("description"),
	isActive: boolean("is_active").default(true),
	priority: integer("priority").default(1), // Higher number = higher priority

	// Rule conditions (JSON logic)
	conditions: jsonb("conditions").notNull(), // Complex rule conditions

	// Rule actions
	actions: jsonb("actions").notNull(), // What to do when rule matches

	// Performance tracking
	timesUsed: integer("times_used").default(0),
	successRate: numeric("success_rate", { precision: 5, scale: 2 }), // 0-100
	lastUsedAt: timestamp("last_used_at", { withTimezone: true }),

	// Rule metadata
	tags: text("tags"), // comma-separated tags for categorization
	metadata: jsonb("metadata"),
	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// Discrepancies found during reconciliation
export const reconciliationDiscrepancies = pgTable("reconciliation_discrepancies", {
	id: uuid("id").primaryKey().defaultRandom(),
	sessionId: uuid("session_id").notNull().references(() => reconciliationSessions.id),
	matchId: uuid("match_id").references(() => reconciliationMatches.id),

	type: discrepancyTypeEnum("type").notNull(),
	severity: text("severity").default("medium"), // low, medium, high, critical

	// Discrepancy details
	description: text("description").notNull(),
	expectedValue: text("expected_value"),
	actualValue: text("actual_value"),
	difference: numeric("difference", { precision: 12, scale: 2 }),

	// Transaction references
	statementTransactionId: uuid("statement_transaction_id"),
	bookTransactionId: uuid("book_transaction_id").references(() => transactions.id),

	// Resolution tracking
	status: text("status").default("open"), // open, investigating, resolved, dismissed
	resolution: text("resolution"),
	resolutionNotes: text("resolution_notes"),
	resolvedBy: uuid("resolved_by").references(() => users.id),
	resolvedAt: timestamp("resolved_at", { withTimezone: true }),

	// AI suggestions
	aiSuggestions: jsonb("ai_suggestions"),
	aiConfidence: numeric("ai_confidence", { precision: 5, scale: 2 }),

	// Metadata
	metadata: jsonb("metadata"),
	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// Transaction categorization improvements for ML
export const transactionCategorizationHistory = pgTable("transaction_categorization_history", {
	id: uuid("id").primaryKey().defaultRandom(),
	transactionId: uuid("transaction_id").notNull().references(() => transactions.id),
	userId: uuid("user_id").notNull().references(() => users.id),

	// Original categorization
	originalCategory: text("original_category"),
	originalConfidence: numeric("original_confidence", { precision: 5, scale: 2 }),

	// New categorization
	newCategory: text("new_category"),
	newConfidence: numeric("new_confidence", { precision: 5, scale: 2 }),

	// Categorization method
	method: text("method").notNull(), // 'ai', 'rule', 'manual', 'bulk'
	modelVersion: text("model_version"), // AI model version used
	processingTime: integer("processing_time_ms"), // Time taken to categorize

	// User feedback
	userFeedback: text("user_feedback"), // 'correct', 'incorrect', 'unsure'
	feedbackReason: text("feedback_reason"),
	feedbackAt: timestamp("feedback_at", { withTimezone: true }),

	// Context data used for categorization
	contextData: jsonb("context_data"), // Additional data used for categorization
	featureVector: jsonb("feature_vector"), // ML features extracted

	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// Enhanced transaction schema with reconciliation fields
export const transactionReconciliation = pgTable("transaction_reconciliation", {
	id: uuid("id").primaryKey().defaultRandom(),
	transactionId: uuid("transaction_id").notNull().references(() => transactions.id).unique(),

	// Reconciliation status
	isReconciled: boolean("is_reconciled").default(false),
	reconciledAt: timestamp("reconciled_at", { withTimezone: true }),
	reconciledBy: uuid("reconciled_by").references(() => users.id),
	reconciliationSessionId: uuid("reconciliation_session_id").references(() => reconciliationSessions.id),

	// Statement matching
	statementId: text("statement_id"), // External statement identifier
	statementMatchConfidence: numeric("statement_match_confidence", { precision: 5, scale: 2 }),

	// Reconciliation notes
	reconciliationNotes: text("reconciliation_notes"),
	adjustmentAmount: numeric("adjustment_amount", { precision: 12, scale: 2 }),
	adjustmentReason: text("adjustment_reason"),

	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// Export types
export type ReconciliationSession = typeof reconciliationSessions.$inferSelect;
export type NewReconciliationSession = typeof reconciliationSessions.$inferInsert;

export type ReconciliationMatch = typeof reconciliationMatches.$inferSelect;
export type NewReconciliationMatch = typeof reconciliationMatches.$inferInsert;

export type ReconciliationRule = typeof reconciliationRules.$inferSelect;
export type NewReconciliationRule = typeof reconciliationRules.$inferInsert;

export type ReconciliationDiscrepancy = typeof reconciliationDiscrepancies.$inferSelect;
export type NewReconciliationDiscrepancy = typeof reconciliationDiscrepancies.$inferInsert;

export type TransactionCategorizationHistory = typeof transactionCategorizationHistory.$inferSelect;
export type NewTransactionCategorizationHistory = typeof transactionCategorizationHistory.$inferInsert;

export type TransactionReconciliation = typeof transactionReconciliation.$inferSelect;
export type NewTransactionReconciliation = typeof transactionReconciliation.$inferInsert;
