/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { z } from 'zod';

// Invoice validation schemas
export const createInvoiceSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  invoiceNumber: z.string().min(1, 'Invoice number is required'),
  reference: z.string().optional(),
  clientId: z.number().optional(),
  clientName: z.string().min(1, 'Client name is required'),
  clientEmail: z.string().email('Valid email is required'),
  clientAddress: z.string().optional(),
  clientPhone: z.string().optional(),
  currency: z.string().default('USD'),
  subtotal: z.number().positive('Subtotal must be positive'),
  taxRate: z.number().min(0).max(1).default(0),
  taxAmount: z.number().min(0).default(0),
  discountAmount: z.number().min(0).default(0),
  total: z.number().positive('Total must be positive'),
  status: z.enum(['draft', 'sent', 'viewed', 'paid', 'overdue', 'cancelled']).default('draft'),
  issueDate: z.string().datetime('Valid issue date is required'),
  dueDate: z.string().datetime('Valid due date is required'),
  paidDate: z.string().datetime().optional(),
  sentDate: z.string().datetime().optional(),
  amountPaid: z.number().min(0).default(0),
  paymentMethod: z.string().optional(),
  paymentReference: z.string().optional(),
  notes: z.string().optional(),
  terms: z.string().optional(),
  footer: z.string().optional(),
  items: z.array(z.object({
    description: z.string().min(1, 'Item description is required'),
    quantity: z.number().positive('Quantity must be positive'),
    unitPrice: z.number().positive('Unit price must be positive'),
    total: z.number().positive('Item total must be positive')
  })).min(1, 'At least one item is required'),
  isRecurring: z.boolean().default(false),
  recurringFrequency: z.string().optional(),
  recurringEndDate: z.string().datetime().optional(),
  parentInvoiceId: z.number().optional(),
  metadata: z.record(z.any()).optional()
});

export const updateInvoiceSchema = createInvoiceSchema.partial().extend({
  id: z.number().positive('Valid invoice ID is required')
});

// Expense validation schemas
export const createExpenseSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  description: z.string().min(1, 'Description is required'),
  amount: z.number().positive('Amount must be positive'),
  currency: z.string().default('USD'),
  date: z.string().datetime('Valid date is required'),
  category: z.string().min(1, 'Category is required'),
  vendor: z.string().optional(),
  paymentMethod: z.string().optional(),
  receiptUrl: z.string().url().optional(),
  receiptFileName: z.string().optional(),
  status: z.enum(['pending', 'approved', 'rejected']).default('pending'),
  approvedBy: z.string().optional(),
  approvedAt: z.string().datetime().optional(),
  rejectedReason: z.string().optional(),
  taxDeductible: z.boolean().default(true),
  taxAmount: z.number().min(0).default(0),
  projectId: z.number().optional(),
  clientId: z.number().optional(),
  billable: z.boolean().default(false),
  isRecurring: z.boolean().default(false),
  recurringFrequency: z.string().optional(),
  recurringEndDate: z.string().datetime().optional(),
  parentExpenseId: z.number().optional(),
  mileage: z.number().min(0).optional(),
  mileageRate: z.number().min(0).optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
  metadata: z.record(z.any()).optional()
});

export const updateExpenseSchema = createExpenseSchema.partial().extend({
  id: z.number().positive('Valid expense ID is required')
});

// Client validation schemas
export const createClientSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  name: z.string().min(1, 'Client name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional(),
  company: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  country: z.string().default('US'),
  taxId: z.string().optional(),
  currency: z.string().default('USD'),
  paymentTerms: z.string().optional(),
  status: z.enum(['active', 'inactive', 'suspended']).default('active'),
  totalInvoiced: z.number().min(0).default(0),
  totalPaid: z.number().min(0).default(0),
  outstandingBalance: z.number().min(0).default(0),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional()
});

export const updateClientSchema = createClientSchema.partial().extend({
  id: z.number().positive('Valid client ID is required')
});

// AI Insights validation schemas
export const aiInsightsResponseSchema = z.object({
  insights: z.array(z.string()),
  recommendations: z.array(z.string()),
  riskAssessment: z.string(),
  forecast: z.object({
    nextMonth: z.number(),
    nextQuarter: z.number(),
    nextYear: z.number()
  })
});

// Blog validation schemas
export const createBlogPostSchema = z.object({
	userId: z.string().min(1, 'User ID is required'),
	title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
	slug: z.string().min(1, 'Slug is required').max(200, 'Slug must be less than 200 characters').regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase alphanumeric with hyphens'),
	excerpt: z.string().max(500, 'Excerpt must be less than 500 characters').optional(),
	content: z.string().min(1, 'Content is required'),
	featuredImage: z.string().url('Featured image must be a valid URL').optional(),
	categoryId: z.number().positive('Category ID must be positive').optional(),
	status: z.enum(['draft', 'published', 'scheduled', 'archived']).default('draft'),
	isFeatured: z.boolean().default(false),
	publishedAt: z.string().datetime().optional(),
	scheduledAt: z.string().datetime().optional(),
});

export const updateBlogPostSchema = createBlogPostSchema.partial().extend({
	id: z.number().positive('Valid blog post ID is required')
});

export const blogCategorySchema = z.object({
	name: z.string().min(1, 'Category name is required').max(100, 'Category name must be less than 100 characters'),
	slug: z.string().min(1, 'Slug is required').max(100, 'Slug must be less than 100 characters').regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase alphanumeric with hyphens'),
	description: z.string().max(500, 'Description must be less than 500 characters').optional(),
	color: z.string().max(50, 'Color must be less than 50 characters').optional(),
});

export const createBlogCategorySchema = blogCategorySchema;
export const updateBlogCategorySchema = blogCategorySchema.partial().extend({
	id: z.number().positive('Valid category ID is required')
});

// Type exports
export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;
export type UpdateInvoiceInput = z.infer<typeof updateInvoiceSchema>;
export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;
export type CreateClientInput = z.infer<typeof createClientSchema>;
export type UpdateClientInput = z.infer<typeof updateClientSchema>;
export type AIInsightsResponse = z.infer<typeof aiInsightsResponseSchema>;
export type CreateBlogPostInput = z.infer<typeof createBlogPostSchema>;
export type UpdateBlogPostInput = z.infer<typeof updateBlogPostSchema>;
export type CreateBlogCategoryInput = z.infer<typeof createBlogCategorySchema>;
export type UpdateBlogCategoryInput = z.infer<typeof updateBlogCategorySchema>;
