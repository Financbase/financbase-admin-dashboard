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
  metadata: z.record(z.string(), z.any()).optional()
});

export const updateInvoiceSchema = createInvoiceSchema.partial().extend({
  id: z.number().positive('Valid invoice ID is required')
});

// Expense validation schemas
export const createExpenseSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  description: z.string().optional().default('Expense'),
  amount: z.number().positive('Amount must be positive'),
  currency: z.string().default('USD'),
  date: z.union([
    z.string().datetime('Valid ISO 8601 datetime string is required'),
    z.string().transform((str) => {
      const date = new Date(str);
      if (isNaN(date.getTime())) {
        throw new Error('Invalid date format. Expected ISO 8601 datetime string or valid date string.');
      }
      return date.toISOString();
    })
  ]),
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
  metadata: z.record(z.string(), z.any()).optional()
});

export const updateExpenseSchema = createExpenseSchema.partial().extend({
  id: z.number().positive('Valid expense ID is required')
});

// Budget validation schemas
const baseBudgetSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  name: z.string().min(1, 'Budget name is required').max(200, 'Budget name must be less than 200 characters'),
  category: z.string().min(1, 'Category is required'),
  description: z.string().optional(),
  budgetedAmount: z.number().positive('Budgeted amount must be positive'),
  currency: z.string().default('USD'),
  periodType: z.enum(['monthly', 'yearly']).default('monthly'),
  startDate: z.string().datetime('Valid start date is required'),
  endDate: z.string().datetime('Valid end date is required'),
  alertThresholds: z.array(z.number().min(0).max(200)).default([80, 90, 100]),
  status: z.enum(['active', 'archived', 'paused']).default('active'),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
  metadata: z.record(z.string(), z.any()).optional()
});

export const createBudgetSchema = baseBudgetSchema.refine((data) => {
  const start = new Date(data.startDate);
  const end = new Date(data.endDate);
  return end > start;
}, {
  message: 'End date must be after start date',
  path: ['endDate']
});

export const updateBudgetSchema = baseBudgetSchema.partial().extend({
  id: z.number().positive('Valid budget ID is required')
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
export type CreateBudgetInput = z.infer<typeof createBudgetSchema>;
export type UpdateBudgetInput = z.infer<typeof updateBudgetSchema>;

// HR Contractors validation schemas
export const createContractorSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  organizationId: z.string().uuid('Valid organization ID is required'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional(),
  contractorType: z.enum(['1099', 'w2', 'c2c', 'other']).optional(),
  companyName: z.string().optional(),
  hourlyRate: z.string().optional(),
  monthlyRate: z.string().optional(),
  annualRate: z.string().optional(),
  currency: z.string().optional(),
  paymentTerms: z.enum(['net_15', 'net_30', 'net_45', 'net_60', 'due_on_receipt', 'custom']).optional(),
  customPaymentTerms: z.string().optional(),
  contractStartDate: z.string().datetime('Valid contract start date is required'),
  contractEndDate: z.string().datetime().optional(),
  status: z.enum(['active', 'inactive', 'terminated', 'pending']).optional(),
  location: z.string().optional(),
  timezone: z.string().optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export const updateContractorSchema = createContractorSchema.partial().extend({
  id: z.string().uuid('Valid contractor ID is required'),
});

// Payroll validation schemas
export const createPayrollRunSchema = z.object({
  organizationId: z.string().uuid('Valid organization ID is required'),
  payPeriodStart: z.string().datetime('Valid pay period start date is required'),
  payPeriodEnd: z.string().datetime('Valid pay period end date is required'),
  payDate: z.string().datetime('Valid pay date is required'),
  payFrequency: z.enum(['weekly', 'biweekly', 'semimonthly', 'monthly']),
  notes: z.string().optional(),
});

export const processPayrollSchema = z.object({
  payrollRunId: z.string().uuid('Valid payroll run ID is required'),
  employeeIds: z.array(z.string().uuid()).optional(),
  contractorIds: z.array(z.string().uuid()).optional(),
});

export const createPayrollDeductionSchema = z.object({
  organizationId: z.string().uuid('Valid organization ID is required'),
  employeeId: z.string().uuid().optional(),
  contractorId: z.string().uuid().optional(),
  name: z.string().min(1, 'Deduction name is required'),
  type: z.enum(['401k', '403b', 'health_insurance', 'dental_insurance', 'vision_insurance', 'life_insurance', 'disability_insurance', 'hsa', 'fsa', 'parking', 'transit', 'union_dues', 'garnishment', 'loan', 'other']),
  amountType: z.enum(['fixed', 'percentage']),
  amount: z.string().optional(),
  percentage: z.string().optional(),
  frequency: z.enum(['per_paycheck', 'monthly', 'yearly', 'one_time']).default('per_paycheck'),
  maxAmount: z.string().optional(),
  minAmount: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export const createPayrollTaxSchema = z.object({
  organizationId: z.string().uuid('Valid organization ID is required'),
  name: z.string().min(1, 'Tax name is required'),
  type: z.enum(['federal_income', 'state_income', 'local_income', 'social_security', 'medicare', 'federal_unemployment', 'state_unemployment', 'other']),
  jurisdiction: z.string().optional(),
  rate: z.string().optional(),
  flatAmount: z.string().optional(),
  wageBase: z.string().optional(),
  maxTax: z.string().optional(),
  effectiveDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export const createPayrollBenefitSchema = z.object({
  organizationId: z.string().uuid('Valid organization ID is required'),
  employeeId: z.string().uuid().optional(),
  contractorId: z.string().uuid().optional(),
  name: z.string().min(1, 'Benefit name is required'),
  type: z.enum(['health_insurance', 'dental_insurance', 'vision_insurance', 'life_insurance', 'disability_insurance', 'retirement', 'stock_options', 'tuition', 'wellness', 'other']),
  coverageType: z.enum(['individual', 'family', 'employee_plus_one']).default('individual'),
  employerCost: z.string().default('0'),
  employeeCost: z.string().default('0'),
  frequency: z.enum(['per_paycheck', 'monthly', 'yearly']).default('per_paycheck'),
  enrollmentDate: z.string().datetime().optional(),
  effectiveDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

// Leave management validation schemas
export const createLeaveTypeSchema = z.object({
  organizationId: z.string().uuid('Valid organization ID is required'),
  name: z.string().min(1, 'Leave type name is required'),
  category: z.enum(['vacation', 'sick_leave', 'personal', 'fmla', 'bereavement', 'jury_duty', 'military', 'unpaid', 'other']),
  accrualMethod: z.enum(['none', 'fixed', 'per_hour', 'per_week', 'per_month', 'per_year', 'proportional']).default('none'),
  accrualRate: z.string().optional(),
  accrualPeriod: z.enum(['hourly', 'daily', 'weekly', 'biweekly', 'monthly', 'yearly']).optional(),
  maxAccrual: z.string().optional(),
  initialBalance: z.string().default('0'),
  allowCarryover: z.boolean().default(false),
  maxCarryover: z.string().optional(),
  requiresApproval: z.boolean().default(true),
  advanceNoticeDays: z.number().optional(),
});

export const requestLeaveSchema = z.object({
  employeeId: z.string().uuid('Valid employee ID is required'),
  leaveTypeId: z.string().uuid('Valid leave type ID is required'),
  organizationId: z.string().uuid('Valid organization ID is required'),
  startDate: z.string().datetime('Valid start date is required'),
  endDate: z.string().datetime('Valid end date is required'),
  duration: z.string(),
  durationUnit: z.enum(['hours', 'days']).optional(),
  reason: z.string().optional(),
  notes: z.string().optional(),
});

export const approveLeaveSchema = z.object({
  requestId: z.string().uuid('Valid leave request ID is required'),
  approved: z.boolean(),
  rejectionReason: z.string().optional(),
});

// Attendance validation schemas
export const clockInSchema = z.object({
  employeeId: z.string().uuid().optional(),
  contractorId: z.string().uuid().optional(),
  organizationId: z.string().uuid('Valid organization ID is required'),
  location: z.object({
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    address: z.string().optional(),
    ip: z.string().optional(),
  }).optional(),
  method: z.enum(['web', 'mobile', 'kiosk', 'biometric', 'api', 'manual']).default('web'),
  notes: z.string().optional(),
});

export const clockOutSchema = z.object({
  attendanceRecordId: z.string().uuid('Valid attendance record ID is required'),
  location: z.object({
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    address: z.string().optional(),
    ip: z.string().optional(),
  }).optional(),
  method: z.enum(['web', 'mobile', 'kiosk', 'biometric', 'api', 'manual']).default('web'),
  notes: z.string().optional(),
});

export const createTimeCardSchema = z.object({
  employeeId: z.string().uuid().optional(),
  contractorId: z.string().uuid().optional(),
  organizationId: z.string().uuid('Valid organization ID is required'),
  payPeriodStart: z.string().datetime('Valid pay period start date is required'),
  payPeriodEnd: z.string().datetime('Valid pay period end date is required'),
  payFrequency: z.enum(['weekly', 'biweekly', 'semimonthly', 'monthly']),
  notes: z.string().optional(),
});

export const updateTimeCardSchema = createTimeCardSchema.partial().extend({
  id: z.string().uuid('Valid time card ID is required'),
  status: z.enum(['draft', 'submitted', 'approved', 'rejected', 'paid']).optional(),
});

// Tax validation schemas
export const createTaxObligationSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  name: z.string().min(1, 'Tax obligation name is required'),
  type: z.enum(['federal_income', 'state_income', 'local_income', 'self_employment', 'sales_tax', 'property_tax', 'payroll_tax', 'other']),
  amount: z.number().positive('Amount must be positive'),
  dueDate: z.string().datetime('Valid due date is required'),
  status: z.enum(['pending', 'paid', 'overdue', 'cancelled']).optional(),
  quarter: z.string().optional(), // e.g., "Q1 2025"
  year: z.number().int().min(2000).max(2100),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export const updateTaxObligationSchema = createTaxObligationSchema.partial().extend({
  id: z.string().uuid('Valid tax obligation ID is required'),
});

export const recordTaxPaymentSchema = z.object({
  obligationId: z.string().uuid('Valid tax obligation ID is required'),
  amount: z.number().positive('Payment amount must be positive'),
  paymentDate: z.string().datetime('Valid payment date is required'),
  paymentMethod: z.string().optional(), // e.g., "bank_transfer", "check", "credit_card"
  notes: z.string().optional(),
});

export const createTaxDeductionSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  category: z.string().min(1, 'Category is required'),
  amount: z.number().positive('Amount must be positive'),
  percentage: z.number().min(0).max(100).optional(),
  transactionCount: z.number().int().min(0).optional(),
  year: z.number().int().min(2000).max(2100),
  description: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export const updateTaxDeductionSchema = createTaxDeductionSchema.partial().extend({
  id: z.string().uuid('Valid tax deduction ID is required'),
});

export const createTaxDocumentSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  name: z.string().min(1, 'Document name is required'),
  type: z.enum(['w2', '1099', 'tax_return', 'receipt', 'invoice', 'expense_report', 'other']),
  year: z.number().int().min(2000).max(2100),
  fileUrl: z.string().url('Valid file URL is required'),
  fileSize: z.number().int().positive().optional(),
  fileName: z.string().optional(),
  mimeType: z.string().optional(),
  description: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

// Type exports
export type CreateContractorInput = z.infer<typeof createContractorSchema>;
export type UpdateContractorInput = z.infer<typeof updateContractorSchema>;
export type CreatePayrollRunInput = z.infer<typeof createPayrollRunSchema>;
export type ProcessPayrollInput = z.infer<typeof processPayrollSchema>;
export type CreatePayrollDeductionInput = z.infer<typeof createPayrollDeductionSchema>;
export type CreatePayrollTaxInput = z.infer<typeof createPayrollTaxSchema>;
export type CreatePayrollBenefitInput = z.infer<typeof createPayrollBenefitSchema>;
export type CreateLeaveTypeInput = z.infer<typeof createLeaveTypeSchema>;
export type RequestLeaveInput = z.infer<typeof requestLeaveSchema>;
export type ApproveLeaveInput = z.infer<typeof approveLeaveSchema>;
export type ClockInInput = z.infer<typeof clockInSchema>;
export type ClockOutInput = z.infer<typeof clockOutSchema>;
export type CreateTimeCardInput = z.infer<typeof createTimeCardSchema>;
export type UpdateTimeCardInput = z.infer<typeof updateTimeCardSchema>;
export type CreateTaxObligationInput = z.infer<typeof createTaxObligationSchema>;
export type UpdateTaxObligationInput = z.infer<typeof updateTaxObligationSchema>;
export type RecordTaxPaymentInput = z.infer<typeof recordTaxPaymentSchema>;
export type CreateTaxDeductionInput = z.infer<typeof createTaxDeductionSchema>;
export type UpdateTaxDeductionInput = z.infer<typeof updateTaxDeductionSchema>;
export type CreateTaxDocumentInput = z.infer<typeof createTaxDocumentSchema>;
