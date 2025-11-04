/**
 * Bills and Bill Pay Database Schemas
 * Database schema definitions for bills, vendors, payments, and approval workflows
 */

/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */


import { pgTable, text, integer, decimal, timestamp, boolean, jsonb, uuid, varchar } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Bills table
export const bills = pgTable('bills', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull(),
  vendorId: uuid('vendor_id').references(() => vendors.id),
  documentId: uuid('document_id'),

  // Bill details
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }).notNull().default('USD'),
  dueDate: timestamp('due_date').notNull(),
  issueDate: timestamp('issue_date').notNull(),
  invoiceNumber: varchar('invoice_number', { length: 100 }),
  description: text('description').notNull(),
  category: varchar('category', { length: 50 }).notNull(),

  // Status and workflow
  status: varchar('status', { length: 20 }).notNull().default('draft'),
  priority: varchar('priority', { length: 10 }).notNull().default('medium'),
  paymentMethod: varchar('payment_method', { length: 50 }),
  scheduledDate: timestamp('scheduled_date'),
  paidDate: timestamp('paid_date'),

  // Approval workflow
  approvedBy: text('approved_by'),
  approvedAt: timestamp('approved_at'),

  // Metadata and audit
  metadata: jsonb('metadata').$defaultFn(() => ({})),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

// Vendors table
export const vendors = pgTable('vendors', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull(),

  // Vendor details
  name: text('name').notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 20 }),
  taxId: varchar('tax_id', { length: 50 }),

  // Address
  address: jsonb('address').$defaultFn(() => ({})),

  // Payment preferences
  paymentTerms: integer('payment_terms').notNull().default(30),
  category: varchar('category', { length: 50 }).notNull().default('other'),
  autoPay: boolean('auto_pay').notNull().default(false),
  approvalRequired: boolean('approval_required').notNull().default(true),
  approvalThreshold: decimal('approval_threshold', { precision: 10, scale: 2 }).notNull().default('1000'),

  // Payment methods
  paymentMethods: jsonb('payment_methods').$defaultFn(() => []),

  // Status
  status: varchar('status', { length: 20 }).notNull().default('active'),

  // Audit
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

// Payments table
export const payments = pgTable('payments', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull(),
  billId: uuid('bill_id').references(() => bills.id),
  vendorId: uuid('vendor_id').references(() => vendors.id),

  // Payment details
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }).notNull().default('USD'),
  paymentMethod: varchar('payment_method', { length: 50 }).notNull(),

  // Processor details
  processorReference: varchar('processor_reference', { length: 255 }),
  status: varchar('status', { length: 20 }).notNull().default('pending'),
  fees: decimal('fees', { precision: 10, scale: 2 }),

  // Timing
  scheduledDate: timestamp('scheduled_date'),
  processedDate: timestamp('processed_date'),

  // Exchange rate for international payments
  exchangeRate: decimal('exchange_rate', { precision: 10, scale: 4 }),

  // Metadata
  metadata: jsonb('metadata').$defaultFn(() => ({})),

  // Audit
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

// Document processing table
export const documents = pgTable('documents', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull(),

  // File details
  fileName: varchar('file_name', { length: 255 }).notNull(),
  fileSize: integer('file_size').notNull(),
  mimeType: varchar('mime_type', { length: 100 }).notNull(),
  pageCount: integer('page_count').default(1),

  // Processing details
  documentType: varchar('document_type', { length: 20 }),
  status: varchar('status', { length: 20 }).notNull().default('processing'),

  // Extracted data
  extractedData: jsonb('extracted_data').$defaultFn(() => ({})),
  confidence: decimal('confidence', { precision: 3, scale: 2 }),

  // Processing metadata
  ocrText: text('ocr_text'),
  processingTime: integer('processing_time'), // milliseconds
  aiModel: varchar('ai_model', { length: 50 }),
  aiProvider: varchar('ai_provider', { length: 50 }),

  // Audit
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

// Approval workflows table
export const approvalWorkflows = pgTable('approval_workflows', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull(),

  // Workflow details
  name: text('name').notNull(),
  description: text('description'),
  status: varchar('status', { length: 20 }).notNull().default('active'),

  // Conditions
  amountThreshold: decimal('amount_threshold', { precision: 10, scale: 2 }).notNull().default('1000'),
  vendorCategories: jsonb('vendor_categories').$defaultFn(() => []),
  requiredApprovers: jsonb('required_approvers').$defaultFn(() => []),

  // Audit
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

// Bill approvals table
export const billApprovals = pgTable('bill_approvals', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull(),
  billId: uuid('bill_id').references(() => bills.id),
  workflowId: uuid('workflow_id').references(() => approvalWorkflows.id),

  // Approval state
  currentStep: integer('current_step').notNull().default(0),
  status: varchar('status', { length: 20 }).notNull().default('pending'),

  // Initiation
  initiatedBy: text('initiated_by').notNull(),
  initiatedAt: timestamp('initiated_at').notNull().defaultNow(),

  // Completion
  completedAt: timestamp('completed_at'),

  // Steps (stored as JSON for flexibility)
  steps: jsonb('steps').$defaultFn(() => []),

  // Audit
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

// Relations
export const billsRelations = relations(bills, ({ one, many }) => ({
  vendor: one(vendors, {
    fields: [bills.vendorId],
    references: [vendors.id]
  }),
  document: one(documents, {
    fields: [bills.documentId],
    references: [documents.id]
  }),
  payments: many(payments),
  approvals: many(billApprovals)
}));

export const vendorsRelations = relations(vendors, ({ many }) => ({
  bills: many(bills),
  payments: many(payments)
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  bill: one(bills, {
    fields: [payments.billId],
    references: [bills.id]
  }),
  vendor: one(vendors, {
    fields: [payments.vendorId],
    references: [vendors.id]
  })
}));

export const documentsRelations = relations(documents, ({ one }) => ({
  bill: one(bills, {
    fields: [documents.id],
    references: [bills.documentId]
  })
}));

export const approvalWorkflowsRelations = relations(approvalWorkflows, ({ many }) => ({
  approvals: many(billApprovals)
}));

export const billApprovalsRelations = relations(billApprovals, ({ one }) => ({
  bill: one(bills, {
    fields: [billApprovals.billId],
    references: [bills.id]
  }),
  workflow: one(approvalWorkflows, {
    fields: [billApprovals.workflowId],
    references: [approvalWorkflows.id]
  })
}));
