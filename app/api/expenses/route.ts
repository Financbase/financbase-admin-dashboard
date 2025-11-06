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
import { ApiErrorHandler } from '@/lib/api-error-handler';
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
  try {
    const { userId } = await auth();
    if (!userId) {
      return ApiErrorHandler.unauthorized();
    }

    const { searchParams } = new URL(req.url);
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
      }
    });
  } catch (error) {
    return ApiErrorHandler.handle(error);
  }
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
  try {
    const { userId } = await auth();
    if (!userId) {
      return ApiErrorHandler.unauthorized();
    }

    const body = await req.json();
    const validatedData = createExpenseSchema.parse({
      ...body,
      userId // Ensure userId comes from auth, not request body
    });

    // Create the expense
    const [newExpense] = await db
      .insert(expenses)
      .values(validatedData)
      .returning();

    return NextResponse.json({
      success: true,
      message: 'Expense created successfully',
      data: newExpense
    }, { status: 201 });
  } catch (error) {
    return ApiErrorHandler.handle(error);
  }
}

