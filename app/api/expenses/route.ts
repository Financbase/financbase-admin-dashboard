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
import { expenses } from '@/lib/db/schemas/expenses.schema';
import { createExpenseSchema } from '@/lib/validation-schemas';
import { ApiErrorHandler, generateRequestId } from '@/lib/api-error-handler';
import { withRLS } from '@/lib/api/with-rls';
import { eq, count, and, gte, lte, like } from 'drizzle-orm';

/**
 * @swagger
 * /api/expenses:
 *   get:
 *     summary: Get list of expenses
 *     description: Retrieves a paginated list of expenses with optional filtering by status, category, and date range
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
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, approved, rejected]
 *         description: Filter expenses by approval status
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter expenses by category
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for filtering (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for filtering (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Expenses retrieved successfully
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
 *                         example: expense_123
 *                       amount:
 *                         type: number
 *                         example: 150.00
 *                       category:
 *                         type: string
 *                         example: Office Supplies
 *                       status:
 *                         type: string
 *                         enum: [pending, approved, rejected]
 *                       date:
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
  return withRLS(async (userId, clerkUser, request) => {
    try {

    const { searchParams } = new URL((request || req).url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Build where conditions
    const whereConditions = [eq(expenses.userId, userId)];
    
    if (status) {
      whereConditions.push(eq(expenses.status, status as 'pending' | 'approved' | 'rejected'));
    }
    
    if (category) {
      whereConditions.push(like(expenses.category, `%${category}%`));
    }
    
    if (startDate) {
      whereConditions.push(gte(expenses.date, new Date(startDate)));
    }
    
    if (endDate) {
      whereConditions.push(lte(expenses.date, new Date(endDate)));
    }

    // Fetch expenses for the authenticated user
    const userExpenses = await db
      .select()
      .from(expenses)
      .where(and(...whereConditions))
      .limit(limit)
      .offset(offset);

    const totalCount = await db
      .select({ count: count() })
      .from(expenses)
      .where(and(...whereConditions));

    return NextResponse.json({
      success: true,
      data: userExpenses,
      pagination: {
        page,
        limit,
        total: totalCount[0]?.count || 0,
        pages: Math.ceil((totalCount[0]?.count || 0) / limit)
      },
      requestId
    });
    } catch (error) {
      return ApiErrorHandler.handle(error, requestId);
    }
  });
}

/**
 * @swagger
 * /api/expenses:
 *   post:
 *     summary: Create a new expense
 *     description: Creates a new expense record for the authenticated user
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
 *               - amount
 *               - category
 *               - date
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 150.00
 *               category:
 *                 type: string
 *                 example: Office Supplies
 *               description:
 *                 type: string
 *                 example: Printer paper and ink cartridges
 *               date:
 *                 type: string
 *                 format: date-time
 *               receiptUrl:
 *                 type: string
 *                 format: uri
 *               status:
 *                 type: string
 *                 enum: [pending, approved, rejected]
 *                 default: pending
 *               vendor:
 *                 type: string
 *                 example: Office Depot
 *     responses:
 *       201:
 *         description: Expense created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Expense created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: expense_123
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
  return withRLS<{ success: boolean; message?: string; data: unknown; requestId?: string }>(async (userId, clerkUser, request) => {
    try {
      let body;
      try {
        body = await (request || req).json();
      } catch (error) {
        return ApiErrorHandler.badRequest('Invalid JSON in request body', requestId) as NextResponse<{ success: boolean; message?: string; data: unknown; requestId?: string }>;
      }
    
      // Handle expenseDate as alias for date
      if (body.expenseDate && !body.date) {
        body.date = body.expenseDate;
      }
      
      // Validate and convert date to ISO format if needed
      if (body.date) {
        try {
          // If it's already an ISO string, validate it
          if (typeof body.date === 'string' && body.date.includes('T')) {
            const testDate = new Date(body.date);
            if (isNaN(testDate.getTime())) {
              return ApiErrorHandler.badRequest('Invalid date format. Expected valid ISO 8601 datetime string.', requestId) as NextResponse<{ success: boolean; message?: string; data: unknown; requestId?: string }>;
            }
          } else if (typeof body.date === 'string') {
            // Try to convert plain date string to ISO
            const dateObj = new Date(body.date);
            if (isNaN(dateObj.getTime())) {
              return ApiErrorHandler.badRequest('Invalid date format. Expected valid date string or ISO 8601 datetime.', requestId) as NextResponse<{ success: boolean; message?: string; data: unknown; requestId?: string }>;
            }
            body.date = dateObj.toISOString();
          } else if (body.date instanceof Date) {
            // Already a Date object, convert to ISO
            body.date = body.date.toISOString();
          }
        } catch (error) {
          return ApiErrorHandler.badRequest('Invalid date format. Expected valid date string or ISO 8601 datetime.', requestId) as NextResponse<{ success: boolean; message?: string; data: unknown; requestId?: string }>;
        }
      }
      
      // Validate and convert amount from string to number if needed
      if (typeof body.amount === 'string') {
        const parsedAmount = parseFloat(body.amount);
        if (isNaN(parsedAmount)) {
          return ApiErrorHandler.badRequest('Invalid amount format. Expected a valid number.', requestId) as NextResponse<{ success: boolean; message?: string; data: unknown; requestId?: string }>;
        }
        if (parsedAmount <= 0) {
          return ApiErrorHandler.badRequest('Amount must be a positive number.', requestId) as NextResponse<{ success: boolean; message?: string; data: unknown; requestId?: string }>;
        }
        body.amount = parsedAmount;
      } else if (typeof body.amount !== 'number') {
        return ApiErrorHandler.badRequest('Amount must be a number.', requestId) as NextResponse<{ success: boolean; message?: string; data: unknown; requestId?: string }>;
      } else if (body.amount <= 0) {
        return ApiErrorHandler.badRequest('Amount must be a positive number.', requestId) as NextResponse<{ success: boolean; message?: string; data: unknown; requestId?: string }>;
      }
      
      // Provide default description if missing
      if (!body.description) {
        body.description = 'Expense';
      }
      
      const validatedData = createExpenseSchema.parse({
        ...body,
        userId // Ensure userId comes from auth, not request body
      });

      // Convert date strings to Date objects for database
      // validatedData.date is already an ISO string from schema validation
      let expenseDate: Date;
      try {
        expenseDate = new Date(validatedData.date);
        if (isNaN(expenseDate.getTime())) {
          return ApiErrorHandler.badRequest('Invalid date value. Could not parse date.', requestId) as NextResponse<{ success: boolean; message?: string; data: unknown; requestId?: string }>;
        }
      } catch (error) {
        return ApiErrorHandler.badRequest('Invalid date value. Could not parse date.', requestId) as NextResponse<{ success: boolean; message?: string; data: unknown; requestId?: string }>;
      }

      const expenseData = {
        ...validatedData,
        date: expenseDate,
        approvedAt: validatedData.approvedAt ? (() => {
          try {
            const date = new Date(validatedData.approvedAt);
            return isNaN(date.getTime()) ? undefined : date;
          } catch {
            return undefined;
          }
        })() : undefined,
        recurringEndDate: validatedData.recurringEndDate ? (() => {
          try {
            const date = new Date(validatedData.recurringEndDate);
            return isNaN(date.getTime()) ? undefined : date;
          } catch {
            return undefined;
          }
        })() : undefined,
        // Convert amount to string for decimal column
        amount: validatedData.amount.toString(),
        taxAmount: (validatedData.taxAmount ?? 0).toString(),
        mileage: validatedData.mileage?.toString(),
        mileageRate: validatedData.mileageRate?.toString(),
        // Ensure description is provided
        description: validatedData.description || 'Expense',
      };

      // Create the expense
      const [newExpense] = await db
        .insert(expenses)
        .values(expenseData)
        .returning();

      return NextResponse.json({
        success: true,
        message: 'Expense created successfully',
        data: newExpense,
        requestId
      }, { status: 201 });
    } catch (error) {
      return ApiErrorHandler.handle(error, requestId) as NextResponse<{ success: boolean; message?: string; data: unknown; requestId?: string }>;
    }
  });
}

