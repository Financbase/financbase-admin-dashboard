import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { invoices } from '@/lib/db/schemas/invoices.schema';
import { createInvoiceSchema } from '@/lib/validation-schemas';
import { ApiErrorHandler } from '@/lib/api-error-handler';
import { eq, count } from 'drizzle-orm';

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

    // Fetch invoices for the authenticated user
    const userInvoices = await db
      .select()
      .from(invoices)
      .where(eq(invoices.userId, userId))
      .limit(limit)
      .offset(offset);

    const totalCount = await db
      .select({ count: count() })
      .from(invoices)
      .where(eq(invoices.userId, userId));

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
    const validatedData = createInvoiceSchema.parse({
      ...body,
      userId // Ensure userId comes from auth, not request body
    });

    // Create the invoice
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
    return ApiErrorHandler.handle(error);
  }
}
