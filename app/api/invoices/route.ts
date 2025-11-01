import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { invoices } from '@/lib/db/schemas/invoices.schema';
import { createInvoiceSchema } from '@/lib/validation-schemas';
import { ApiErrorHandler } from '@/lib/api-error-handler';
import { eq, count } from 'drizzle-orm';
import { withRLS } from '@/lib/api/with-rls';

export async function GET(req: NextRequest) {
  // Using withRLS wrapper automatically sets RLS context
  // RLS policies will ensure users can only see their own invoices
  return withRLS(async (clerkUserId) => {
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
  });
}

export async function POST(req: NextRequest) {
  // Using withRLS wrapper automatically sets RLS context
  return withRLS(async (clerkUserId) => {
    const body = await req.json();
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
  });
}
