import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { clients } from '@/lib/db/schemas/clients.schema';
import { createClientSchema } from '@/lib/validation-schemas';
import { ApiErrorHandler } from '@/lib/api-error-handler';
import { eq, count, and, like, or } from 'drizzle-orm';

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
    const search = searchParams.get('search');
    const status = searchParams.get('status');

    // Build where conditions
    const whereConditions = [eq(clients.userId, userId)];
    
    if (status) {
      whereConditions.push(eq(clients.status, status as 'active' | 'inactive' | 'suspended'));
    }
    
    if (search) {
      const searchConditions = [
        like(clients.name, `%${search}%`),
        like(clients.email, `%${search}%`),
        clients.company ? like(clients.company, `%${search}%`) : undefined
      ].filter((condition): condition is NonNullable<typeof condition> => condition !== undefined);
      
      if (searchConditions.length > 0) {
        const firstCondition = searchConditions[0];
        if (firstCondition && searchConditions.length === 1) {
          whereConditions.push(firstCondition);
        } else if (searchConditions.length > 1) {
          whereConditions.push(or(...searchConditions));
        }
      }
    }

    // Fetch clients for the authenticated user
    const userClients = await db
      .select()
      .from(clients)
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      .limit(limit)
      .offset(offset);

    const totalCount = await db
      .select({ count: count() })
      .from(clients)
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined);

    return NextResponse.json({
      success: true,
      data: userClients,
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
    const validatedData = createClientSchema.parse({
      ...body,
      userId // Ensure userId comes from auth, not request body
    });

    // Create the client
    const [newClient] = await db
      .insert(clients)
      .values(validatedData)
      .returning();

    return NextResponse.json({
      success: true,
      message: 'Client created successfully',
      data: newClient
    }, { status: 201 });
  } catch (error) {
    return ApiErrorHandler.handle(error);
  }
}
