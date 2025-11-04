/**
 * Database schema for expense tracking
 */

/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */


import { pgTable, serial, text, decimal, timestamp, jsonb, integer, boolean } from 'drizzle-orm/pg-core';

/**
 * Expenses Table
 * Main table for tracking business expenses
 */
export const expenses = pgTable('expenses', {
	id: serial('id').primaryKey(),
	userId: text('user_id').notNull(),
	
	// Basic information
	description: text('description').notNull(),
	amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
	currency: text('currency').default('USD').notNull(),
	date: timestamp('date').notNull(),
	
	// Categorization
	category: text('category').notNull(), // office, travel, meals, equipment, etc.
	vendor: text('vendor'),
	paymentMethod: text('payment_method'), // cash, card, bank_transfer, etc.
	
	// Receipt tracking
	receiptUrl: text('receipt_url'),
	receiptFileName: text('receipt_file_name'),
	
	// Approval workflow
	status: text('status').default('pending').notNull(), // pending, approved, rejected
	approvedBy: text('approved_by'),
	approvedAt: timestamp('approved_at'),
	rejectedReason: text('rejected_reason'),
	
	// Tax & accounting
	taxDeductible: boolean('tax_deductible').default(true),
	taxAmount: decimal('tax_amount', { precision: 12, scale: 2 }).default('0'),
	
	// Project/client tracking
	projectId: integer('project_id'),
	clientId: integer('client_id'),
	billable: boolean('billable').default(false),
	
	// Recurring expense
	isRecurring: boolean('is_recurring').default(false),
	recurringFrequency: text('recurring_frequency'), // monthly, quarterly, yearly
	recurringEndDate: timestamp('recurring_end_date'),
	parentExpenseId: integer('parent_expense_id'),
	
	// Mileage tracking (for travel expenses)
	mileage: decimal('mileage', { precision: 10, scale: 2 }),
	mileageRate: decimal('mileage_rate', { precision: 5, scale: 2 }),
	
	// Additional metadata
	notes: text('notes'),
	tags: jsonb('tags').$type<string[]>(),
	metadata: jsonb('metadata').$type<Record<string, unknown>>(),
	
	// Timestamps
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/**
 * Expense Categories Table
 * Predefined and custom expense categories
 */
export const expenseCategories = pgTable('expense_categories', {
	id: serial('id').primaryKey(),
	userId: text('user_id').notNull(),
	
	// Category details
	name: text('name').notNull(),
	description: text('description'),
	color: text('color').default('#3b82f6'),
	icon: text('icon'),
	
	// Budget tracking
	monthlyBudget: decimal('monthly_budget', { precision: 12, scale: 2 }),
	yearlyBudget: decimal('yearly_budget', { precision: 12, scale: 2 }),
	
	// Settings
	taxDeductible: boolean('tax_deductible').default(true),
	requiresReceipt: boolean('requires_receipt').default(false),
	requiresApproval: boolean('requires_approval').default(false),
	
	// Status
	isDefault: boolean('is_default').default(false),
	isActive: boolean('is_active').default(true),
	
	// Timestamps
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/**
 * Expense Attachments Table
 * Multiple attachments per expense
 */
export const expenseAttachments = pgTable('expense_attachments', {
	id: serial('id').primaryKey(),
	expenseId: integer('expense_id').references(() => expenses.id).notNull(),
	
	// File information
	fileName: text('file_name').notNull(),
	fileUrl: text('file_url').notNull(),
	fileType: text('file_type').notNull(),
	fileSize: integer('file_size'),
	
	// OCR data (for receipt scanning)
	ocrData: jsonb('ocr_data').$type<{
		totalAmount?: number;
		vendor?: string;
		date?: string;
		items?: Array<{ description: string; amount: number }>;
	}>(),
	
	// Timestamps
	uploadedAt: timestamp('uploaded_at').defaultNow().notNull(),
});

/**
 * Expense Approval Log Table
 * Track approval history
 */
export const expenseApprovalLog = pgTable('expense_approval_log', {
	id: serial('id').primaryKey(),
	expenseId: integer('expense_id').references(() => expenses.id).notNull(),
	
	// Approval details
	action: text('action').notNull(), // submitted, approved, rejected, updated
	performedBy: text('performed_by').notNull(),
	reason: text('reason'),
	
	// Previous state (for audit trail)
	previousStatus: text('previous_status'),
	newStatus: text('new_status'),
	
	// Timestamp
	performedAt: timestamp('performed_at').defaultNow().notNull(),
});

// Type exports
export type Expense = typeof expenses.$inferSelect;
export type NewExpense = typeof expenses.$inferInsert;

export type ExpenseCategory = typeof expenseCategories.$inferSelect;
export type NewExpenseCategory = typeof expenseCategories.$inferInsert;

export type ExpenseAttachment = typeof expenseAttachments.$inferSelect;
export type NewExpenseAttachment = typeof expenseAttachments.$inferInsert;

export type ExpenseApprovalLog = typeof expenseApprovalLog.$inferSelect;
export type NewExpenseApprovalLog = typeof expenseApprovalLog.$inferInsert;

