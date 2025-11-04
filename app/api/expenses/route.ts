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

