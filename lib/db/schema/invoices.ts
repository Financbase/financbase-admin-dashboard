/**
 * Database schema for invoice management
 */

import { pgTable, serial, text, decimal, timestamp, jsonb, integer, boolean, uuid } from 'drizzle-orm/pg-core';

/**
 * Invoices Table
 * Main table for storing invoice data
 */
export const invoices = pgTable('invoices', {
	id: uuid('id').primaryKey().defaultRandom(),
	userId: uuid('user_id').notNull(),
	
	// Invoice identification
	invoiceNumber: text('invoice_number').unique().notNull(),
	reference: text('reference'), // Optional reference number
	
	// Client information
	clientId: uuid('client_id').notNull(), // Foreign key to clients table
	
	// Financial details
	amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
	currency: text('currency').default('USD').notNull(),
	subtotal: decimal('subtotal', { precision: 12, scale: 2 }).notNull(),
	taxRate: decimal('tax_rate', { precision: 5, scale: 2 }).default('0'),
	taxAmount: decimal('tax_amount', { precision: 12, scale: 2 }).default('0'),
	discountAmount: decimal('discount_amount', { precision: 12, scale: 2 }).default('0'),
	total: decimal('total', { precision: 12, scale: 2 }).notNull(),
	
	// Status and dates
	status: text('status').default('draft').notNull(), // draft, sent, viewed, partial, paid, overdue, cancelled
	issueDate: timestamp('issue_date').notNull(),
	dueDate: timestamp('due_date').notNull(),
	paidDate: timestamp('paid_date'),
	sentDate: timestamp('sent_date'),
	
	// Payment tracking
	amountPaid: decimal('amount_paid', { precision: 12, scale: 2 }).default('0'),
	paymentMethod: text('payment_method'), // cash, card, bank_transfer, check, other
	paymentReference: text('payment_reference'),
	
	// Additional details
	notes: text('notes'),
	terms: text('terms'),
	footer: text('footer'),
	
	// Line items are stored in separate table (invoice_line_items)
	
	// Recurring invoice settings
	isRecurring: boolean('is_recurring').default(false).notNull(),
	recurringFrequency: text('recurring_frequency'), // weekly, monthly, quarterly, yearly
	recurringEndDate: timestamp('recurring_end_date'),
	parentInvoiceId: integer('parent_invoice_id'), // For recurring invoices
	
	// Metadata
	metadata: jsonb('metadata').$type<{
		templateId?: string;
		tags?: string[];
		customFields?: Record<string, unknown>;
	}>(),
	
	// Timestamps
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/**
 * Clients Table
 * Stores client/customer information
 */
export const clients = pgTable('clients', {
	id: serial('id').primaryKey(),
	userId: text('user_id').notNull(),
	
	// Basic information
	name: text('name').notNull(),
	email: text('email').notNull(),
	phone: text('phone'),
	company: text('company'),
	
	// Address
	address: text('address'),
	city: text('city'),
	state: text('state'),
	zipCode: text('zip_code'),
	country: text('country'),
	
	// Financial details
	taxId: text('tax_id'),
	currency: text('currency').default('USD'),
	paymentTerms: text('payment_terms'), // net_30, net_60, etc.
	
	// Status
	status: text('status').default('active').notNull(), // active, inactive, archived
	
	// Statistics (denormalized for performance)
	totalInvoiced: decimal('total_invoiced', { precision: 12, scale: 2 }).default('0'),
	totalPaid: decimal('total_paid', { precision: 12, scale: 2 }).default('0'),
	outstandingBalance: decimal('outstanding_balance', { precision: 12, scale: 2 }).default('0'),
	
	// Metadata
	notes: text('notes'),
	tags: jsonb('tags').$type<string[]>(),
	
	// Timestamps
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/**
 * Invoice Payments Table
 * Tracks individual payments against invoices
 */
export const invoicePayments = pgTable('invoice_payments', {
	id: serial('id').primaryKey(),
	invoiceId: integer('invoice_id').references(() => invoices.id).notNull(),
	userId: text('user_id').notNull(),
	
	// Payment details
	amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
	currency: text('currency').default('USD').notNull(),
	paymentMethod: text('payment_method').notNull(),
	reference: text('reference'),
	
	// Payment date
	paymentDate: timestamp('payment_date').notNull(),
	
	// Notes
	notes: text('notes'),
	
	// Timestamps
	createdAt: timestamp('created_at').defaultNow().notNull(),
});

/**
 * Invoice Templates Table
 * Stores reusable invoice templates
 */
export const invoiceTemplates = pgTable('invoice_templates', {
	id: serial('id').primaryKey(),
	userId: text('user_id').notNull(),
	
	// Template details
	name: text('name').notNull(),
	description: text('description'),
	
	// Default values
	terms: text('terms'),
	footer: text('footer'),
	defaultItems: jsonb('default_items').$type<Array<{
		description: string;
		quantity: number;
		unitPrice: number;
	}>>(),
	
	// Settings
	taxRate: decimal('tax_rate', { precision: 5, scale: 2 }).default('0'),
	paymentTerms: text('payment_terms'),
	
	// Status
	isDefault: boolean('is_default').default(false),
	
	// Timestamps
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Type exports
export type Invoice = typeof invoices.$inferSelect;
export type NewInvoice = typeof invoices.$inferInsert;

export type Client = typeof clients.$inferSelect;
export type NewClient = typeof clients.$inferInsert;

export type InvoicePayment = typeof invoicePayments.$inferSelect;
export type NewInvoicePayment = typeof invoicePayments.$inferInsert;

export type InvoiceTemplate = typeof invoiceTemplates.$inferSelect;
export type NewInvoiceTemplate = typeof invoiceTemplates.$inferInsert;

