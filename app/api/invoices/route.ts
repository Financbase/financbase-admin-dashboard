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
  return withRLS(async (clerkUserId) => {
    try {
    const { searchParams } = new URL(req.url);
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

    return NextResponse.json({
      success: true,
      data: userInvoices,
      pagination: {
        page,
        limit,
        total: totalCount[0]?.count || 0,
        pages: Math.ceil((totalCount[0]?.count || 0) / limit)
      }
    });
    } catch (error) {
      return ApiErrorHandler.handle(error, requestId);
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
  return withRLS(async (clerkUserId) => {
    try {
      let body;
      try {
        body = await req.json();
      } catch (error) {
        return ApiErrorHandler.badRequest('Invalid JSON in request body');
      }
    const validatedData = createInvoiceSchema.parse({
      ...body,
      userId: clerkUserId // Ensure userId comes from auth, not request body
    });

    // Create the invoice - RLS will ensure user can only create invoices for themselves
    const [newInvoice] = await db
      .insert(invoices)
      .values(validatedData)
      .returning();

    return NextResponse.json({
      success: true,
      message: 'Invoice created successfully',
      data: newInvoice
    }, { status: 201 });
    } catch (error) {
      return ApiErrorHandler.handle(error, requestId);
    }
  });
}
