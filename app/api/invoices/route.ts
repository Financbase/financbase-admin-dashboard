/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { invoices } from '@/lib/db/schemas/invoices.schema';
import { createInvoiceSchema } from '@/lib/validation-schemas';
import { ApiErrorHandler, generateRequestId } from '@/lib/api-error-handler';
import { eq, count } from 'drizzle-orm';
import { withRLS } from '@/lib/api/with-rls';
import { createSuccessResponse, type StandardApiResponse } from '@/lib/api/standard-response';

/**
 * @swagger
 * /api/invoices:
 *   get:
 *     summary: Get list of invoices
 *     description: Retrieves a paginated list of invoices for the authenticated user. Uses Row Level Security (RLS) to ensure users can only access their own invoices.
 *     tags:
 *       - Financial
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Invoices retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: invoice_123
 *                       invoiceNumber:
 *                         type: string
 *                         example: INV-2025-001
 *                       clientId:
 *                         type: string
 *                       amount:
 *                         type: number
 *                         example: 1250.00
 *                       status:
 *                         type: string
 *                         enum: [draft, sent, paid, overdue, cancelled]
 *                       dueDate:
 *                         type: string
 *                         format: date-time
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     pages:
 *                       type: integer
 *       401:
 *         description: Unauthorized - Authentication required
 *       500:
 *         description: Internal server error
 */
export async function GET(req: NextRequest) {
  const requestId = generateRequestId();
  // Using withRLS wrapper automatically sets RLS context
  // RLS policies will ensure users can only see their own invoices
  return withRLS<StandardApiResponse<unknown>>(async (clerkUserId, clerkUser, request) => {
    try {
    const { searchParams } = new URL((request || req).url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    // Fetch invoices - RLS will automatically filter to user's own invoices
    // Note: If invoices table has user_id column, RLS policies should reference it
    const userInvoices = await db
      .select()
      .from(invoices)
      .where(eq(invoices.userId, clerkUserId))
      .limit(limit)
      .offset(offset);

    const totalCount = await db
      .select({ count: count() })
      .from(invoices)
      .where(eq(invoices.userId, clerkUserId));

    return createSuccessResponse(
      userInvoices,
      200,
      {
        requestId,
        pagination: {
          page,
          limit,
          total: totalCount[0]?.count || 0,
          totalPages: Math.ceil((totalCount[0]?.count || 0) / limit),
        },
      }
    );
    } catch (error) {
      return ApiErrorHandler.handle(error, requestId) as NextResponse<StandardApiResponse<unknown>>;
    }
  });
}

/**
 * @swagger
 * /api/invoices:
 *   post:
 *     summary: Create a new invoice
 *     description: Creates a new invoice for the authenticated user. Uses Row Level Security (RLS) to ensure invoices are associated with the correct user.
 *     tags:
 *       - Financial
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - clientId
 *               - amount
 *               - invoiceNumber
 *             properties:
 *               clientId:
 *                 type: string
 *                 example: client_123
 *               invoiceNumber:
 *                 type: string
 *                 example: INV-2025-001
 *               amount:
 *                 type: number
 *                 example: 1250.00
 *               currency:
 *                 type: string
 *                 default: USD
 *               description:
 *                 type: string
 *                 example: Monthly consulting services
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *               status:
 *                 type: string
 *                 enum: [draft, sent, paid, overdue, cancelled]
 *                 default: draft
 *     responses:
 *       201:
 *         description: Invoice created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: invoice_123
 *                     invoiceNumber:
 *                       type: string
 *                     amount:
 *                       type: number
 *       400:
 *         description: Bad request - Invalid input data
 *       401:
 *         description: Unauthorized - Authentication required
 *       500:
 *         description: Internal server error
 */
export async function POST(req: NextRequest) {
  const requestId = generateRequestId();
  // Using withRLS wrapper automatically sets RLS context
  return withRLS<StandardApiResponse<unknown>>(async (clerkUserId, clerkUser, request) => {
    try {
      let body;
      try {
        body = await (request || req).json();
      } catch (error) {
        return ApiErrorHandler.badRequest('Invalid JSON in request body', requestId) as NextResponse<StandardApiResponse<unknown>>;
      }
    // Validate numeric fields
    const validateNumericField = (value: any, fieldName: string, allowNegative = false): number => {
      if (value === undefined || value === null || value === '') {
        return 0;
      }
      const num = typeof value === 'string' ? parseFloat(value) : Number(value);
      if (isNaN(num)) {
        throw new Error(`Invalid ${fieldName} format. Expected a valid number.`);
      }
      if (!allowNegative && num < 0) {
        throw new Error(`${fieldName} must be a non-negative number.`);
      }
      return num;
    };

    // Validate date fields
    const validateDateField = (value: any, fieldName: string, required = false): Date | undefined => {
      if (!value) {
        if (required) {
          throw new Error(`${fieldName} is required.`);
        }
        return undefined;
      }
      try {
        const date = new Date(value);
        if (isNaN(date.getTime())) {
          throw new Error(`Invalid ${fieldName} format. Expected valid date string or ISO 8601 datetime.`);
        }
        return date;
      } catch (error) {
        if (error instanceof Error) {
          throw error;
        }
        throw new Error(`Invalid ${fieldName} format. Expected valid date string or ISO 8601 datetime.`);
      }
    };

    // Validate clientId if provided
    let parsedClientId: number | undefined;
    if (body.clientId) {
      parsedClientId = parseInt(String(body.clientId), 10);
      if (isNaN(parsedClientId)) {
        return ApiErrorHandler.badRequest('Invalid clientId format. Expected a valid integer.', requestId) as NextResponse<StandardApiResponse<unknown>>;
      }
    }

    // Validate parentInvoiceId if provided
    let parsedParentInvoiceId: number | undefined;
    if (body.parentInvoiceId) {
      parsedParentInvoiceId = parseInt(String(body.parentInvoiceId), 10);
      if (isNaN(parsedParentInvoiceId)) {
        return ApiErrorHandler.badRequest('Invalid parentInvoiceId format. Expected a valid integer.', requestId) as NextResponse<StandardApiResponse<unknown>>;
      }
    }

    // Validate numeric amounts
    let subtotal: number;
    let taxRate: number;
    let taxAmount: number;
    let discountAmount: number;
    let total: number;
    let amountPaid: number;

    try {
      subtotal = validateNumericField(body.subtotal, 'subtotal');
      taxRate = validateNumericField(body.taxRate, 'taxRate');
      taxAmount = validateNumericField(body.taxAmount, 'taxAmount');
      discountAmount = validateNumericField(body.discountAmount, 'discountAmount');
      total = validateNumericField(body.total, 'total');
      amountPaid = validateNumericField(body.amountPaid, 'amountPaid');
    } catch (error) {
      if (error instanceof Error) {
        return ApiErrorHandler.badRequest(error.message, requestId) as NextResponse<StandardApiResponse<unknown>>;
      }
      return ApiErrorHandler.badRequest('Invalid numeric field format.', requestId) as NextResponse<StandardApiResponse<unknown>>;
    }

    // Validate date fields
    let issueDate: Date;
    let dueDate: Date;
    let paidDate: Date | undefined;
    let sentDate: Date | undefined;
    let recurringEndDate: Date | undefined;

    try {
      issueDate = validateDateField(body.issueDate, 'issueDate') || new Date();
      dueDate = validateDateField(body.dueDate, 'dueDate') || new Date();
      paidDate = validateDateField(body.paidDate, 'paidDate');
      sentDate = validateDateField(body.sentDate, 'sentDate');
      recurringEndDate = validateDateField(body.recurringEndDate, 'recurringEndDate');
    } catch (error) {
      if (error instanceof Error) {
        return ApiErrorHandler.badRequest(error.message, requestId) as NextResponse<StandardApiResponse<unknown>>;
      }
      return ApiErrorHandler.badRequest('Invalid date field format.', requestId) as NextResponse<StandardApiResponse<unknown>>;
    }

    // Validate status enum
    const validStatuses = ['draft', 'sent', 'viewed', 'paid', 'overdue', 'cancelled'];
    const status = body.status || 'draft';
    if (!validStatuses.includes(status)) {
      return ApiErrorHandler.badRequest(`Invalid status. Must be one of: ${validStatuses.join(', ')}.`, requestId) as NextResponse<StandardApiResponse<unknown>>;
    }

    // Validate items array
    if (!Array.isArray(body.items)) {
      return ApiErrorHandler.badRequest('Items must be an array.', requestId) as NextResponse<StandardApiResponse<unknown>>;
    }

    // Transform form data to match database schema
    const invoiceData = {
      userId: clerkUserId,
      invoiceNumber: body.invoiceNumber || `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      reference: body.reference,
      clientId: parsedClientId,
      clientName: body.clientName || '',
      clientEmail: body.clientEmail || '',
      clientAddress: body.clientAddress,
      clientPhone: body.clientPhone,
      currency: body.currency || 'USD',
      subtotal: String(subtotal),
      taxRate: String(taxRate / 100), // Convert percentage to decimal
      taxAmount: String(taxAmount),
      discountAmount: String(discountAmount),
      total: String(total),
      status: status as 'draft' | 'sent' | 'viewed' | 'paid' | 'overdue' | 'cancelled',
      issueDate,
      dueDate,
      paidDate,
      sentDate,
      amountPaid: String(amountPaid),
      paymentMethod: body.paymentMethod,
      paymentReference: body.paymentReference,
      notes: body.notes,
      terms: body.terms,
      footer: body.footer,
      items: body.items || [],
      isRecurring: body.isRecurring || false,
      recurringFrequency: body.recurringFrequency,
      recurringEndDate,
      parentInvoiceId: parsedParentInvoiceId,
      metadata: body.metadata,
    };

    // Basic validation
    if (!invoiceData.clientName || !invoiceData.clientEmail) {
      return ApiErrorHandler.badRequest('Client name and email are required', requestId) as NextResponse<StandardApiResponse<unknown>>;
    }

    if (!invoiceData.items || invoiceData.items.length === 0) {
      return ApiErrorHandler.badRequest('At least one invoice item is required', requestId) as NextResponse<StandardApiResponse<unknown>>;
    }

    // Create the invoice - RLS will ensure user can only create invoices for themselves
    const [newInvoice] = await db
      .insert(invoices)
      .values(invoiceData)
      .returning();

    return createSuccessResponse(
      newInvoice,
      201,
      { requestId }
    );
    } catch (error) {
      return ApiErrorHandler.handle(error, requestId) as NextResponse<StandardApiResponse<unknown>>;
    }
  });
}
