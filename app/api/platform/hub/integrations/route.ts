import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { integrations } from '@/lib/db/schemas';
import { eq, and, desc, like, or, sql } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';
import { ApiErrorHandler, generateRequestId } from '@/lib/api-error-handler';
import { isAdmin } from '@/lib/auth/financbase-rbac';

/**
 * GET /api/platform/hub/integrations
 * Get available integrations for Platform Hub
 */
export async function GET(request: NextRequest) {
  const requestId = generateRequestId();
  try {
    const { userId } = await auth();
    if (!userId) {
      return ApiErrorHandler.unauthorized();
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const isOfficial = searchParams.get('isOfficial');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build query conditions
    let whereConditions = [eq(integrations.isActive, true)];

    if (category && category !== 'all') {
      whereConditions.push(eq(integrations.category, category));
    }

    if (isOfficial !== null) {
      whereConditions.push(eq(integrations.isOfficial, isOfficial === 'true'));
    }

    if (search) {
      whereConditions.push(
        or(
          like(integrations.name, `%${search}%`),
          like(integrations.description, `%${search}%`)
        )
      );
    }

    // Get integrations
    const availableIntegrations = await db
      .select()
      .from(integrations)
      .where(and(...whereConditions))
      .orderBy(desc(integrations.isOfficial), desc(integrations.createdAt))
      .limit(limit)
      .offset(offset);

    // Get total count for pagination
    const totalCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(integrations)
      .where(and(...whereConditions));

    // Get category statistics
    const categoryStats = await db
      .select({
        category: integrations.category,
        count: sql<number>`count(*)`,
      })
      .from(integrations)
      .where(eq(integrations.isActive, true))
      .groupBy(integrations.category);

    return NextResponse.json({
      integrations: availableIntegrations,
      pagination: {
        limit,
        offset,
        total: totalCount[0]?.count || 0,
        hasMore: (offset + limit) < (totalCount[0]?.count || 0),
      },
      categories: categoryStats,
      metadata: {
        totalIntegrations: totalCount[0]?.count || 0,
        officialIntegrations: availableIntegrations.filter(i => i.isOfficial).length,
        communityIntegrations: availableIntegrations.filter(i => !i.isOfficial).length,
      },
    });
  } catch (error) {
    return ApiErrorHandler.handle(error, requestId);
  }
}

/**
 * POST /api/platform/hub/integrations
 * Create a new integration (admin only)
 */
export async function POST(request: NextRequest) {
  const requestId = generateRequestId();
  try {
    const { userId } = await auth();
    if (!userId) {
      return ApiErrorHandler.unauthorized();
    }

    // Check admin access
    const adminStatus = await isAdmin();
    if (!adminStatus) {
      return ApiErrorHandler.forbidden('Admin access required');
    }

    let body;
    try {
      body = await request.json();
    } catch (error) {
      return ApiErrorHandler.badRequest('Invalid JSON in request body');
    }
    const {
      name,
      slug,
      description,
      category,
      icon,
      color,
      isOfficial = false,
      version = '1.0.0',
      configuration,
      features,
      requirements,
      documentation,
      supportUrl,
    } = body;

    // Validate required fields
    if (!name || !slug || !category) {
      return ApiErrorHandler.badRequest('Name, slug, and category are required');
    }

    // Check if slug already exists
    const existingIntegration = await db
      .select()
      .from(integrations)
      .where(eq(integrations.slug, slug))
      .limit(1);

    if (existingIntegration.length > 0) {
      return ApiErrorHandler.conflict('Integration with this slug already exists');
    }

    // Create new integration
    const newIntegration = await db.insert(integrations).values({
      name,
      slug,
      description,
      category,
      icon,
      color,
      isActive: true,
      isOfficial,
      version,
      configuration: configuration || {},
      features: features || [],
      requirements: requirements || {},
      documentation,
      supportUrl,
    }).returning();

    return NextResponse.json({
      integration: newIntegration[0],
      message: 'Integration created successfully',
    }, { status: 201 });
  } catch (error) {
    return ApiErrorHandler.handle(error, requestId);
  }
}
