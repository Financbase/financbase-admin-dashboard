/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

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

    // Set search_path to include financbase schema for schema-qualified tables
    // This ensures queries can find tables in the financbase schema
    try {
      await db.execute(sql`SET search_path TO financbase, public`);
    } catch (error) {
      // If setting search_path fails, continue anyway (might not have permission)
      // The query will fail if the table doesn't exist in the current search_path
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
      const searchCondition = or(
          like(integrations.name, `%${search}%`),
          like(integrations.description, `%${search}%`)
      );
      if (searchCondition) {
        whereConditions.push(searchCondition);
      }
    }

    // Get integrations using raw SQL with schema qualification
    // Neon HTTP connections don't persist search_path, so we must use schema-qualified queries
    // Use sql template with proper parameterization - build conditions as separate sql fragments
    const conditions: ReturnType<typeof sql>[] = [sql`is_active = true`];
    
    if (category && category !== 'all') {
      conditions.push(sql`category = ${category}`);
    }
    if (isOfficial !== null) {
      conditions.push(sql`is_official = ${isOfficial === 'true'}`);
    }
    if (search) {
      const searchPattern = `%${search}%`;
      conditions.push(sql`(name LIKE ${searchPattern} OR description LIKE ${searchPattern})`);
    }
    
    // Combine conditions with AND
    const whereClause = conditions.reduce((acc, condition, index) => {
      return index === 0 ? condition : sql`${acc} AND ${condition}`;
    });
    
    // Get integrations - handle missing table gracefully
    let availableIntegrations: any[] = [];
    let totalCount = 0;
    let categoryStats: any[] = [];
    
    try {
      const integrationsResult = await db.execute(sql`
        SELECT id, name, slug, description, category, icon, color, is_active, is_official, version, 
               configuration, features, requirements, documentation, support_url, created_at, updated_at
        FROM financbase.financbase_integrations
        WHERE ${whereClause}
        ORDER BY is_official DESC, created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `) as any;
      
      // Handle different result formats from db.execute
      // Neon HTTP driver returns { rows: [...] } format, Neon Serverless returns array directly
      if (Array.isArray(integrationsResult)) {
        availableIntegrations = integrationsResult;
      } else if (integrationsResult?.rows && Array.isArray(integrationsResult.rows)) {
        availableIntegrations = integrationsResult.rows;
      } else {
        availableIntegrations = [];
      }

      // Get total count for pagination
      const totalCountResult = await db.execute(sql`
        SELECT COUNT(*) as count
        FROM financbase.financbase_integrations
        WHERE ${whereClause}
      `) as any;
      
      // Handle different result formats
      if (Array.isArray(totalCountResult) && totalCountResult[0]?.count) {
        totalCount = Number(totalCountResult[0].count);
      } else if (totalCountResult?.rows?.[0]?.count) {
        totalCount = Number(totalCountResult.rows[0].count);
      } else if (totalCountResult?.[0]?.count) {
        totalCount = Number(totalCountResult[0].count);
      }

      // Get category statistics
      const categoryStatsResult = await db.execute(sql`
        SELECT category, COUNT(*) as count
        FROM financbase.financbase_integrations
        WHERE is_active = true
        GROUP BY category
      `) as any;
      
      // Handle different result formats
      let categoryStatsArray: any[] = [];
      if (Array.isArray(categoryStatsResult)) {
        categoryStatsArray = categoryStatsResult;
      } else if (categoryStatsResult?.rows && Array.isArray(categoryStatsResult.rows)) {
        categoryStatsArray = categoryStatsResult.rows;
      }
      
      categoryStats = categoryStatsArray.map((row: any) => ({
        category: row.category,
        count: Number(row.count || 0),
      }));
    } catch (error: any) {
      // If table doesn't exist, return empty results instead of error
      if (error?.code === '42P01' || error?.message?.includes('does not exist')) {
        availableIntegrations = [];
        totalCount = 0;
        categoryStats = [];
      } else {
        throw error;
      }
    }

    return NextResponse.json({
      integrations: availableIntegrations,
      pagination: {
        limit,
        offset,
        total: totalCount,
        hasMore: (offset + limit) < totalCount,
      },
      categories: categoryStats,
      metadata: {
        totalIntegrations: totalCount,
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

    // Set search_path to include financbase schema for schema-qualified tables
    try {
      await db.execute(sql`SET search_path TO financbase, public`);
    } catch (error) {
      // If setting search_path fails, continue anyway
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

    // Check if slug already exists using raw SQL with schema qualification
    try {
      const existingResult = await db.execute(sql`
        SELECT id, name, slug FROM financbase.financbase_integrations WHERE slug = ${slug} LIMIT 1
      `) as any;
      
      // Handle different result formats from db.execute
      // Neon HTTP driver returns { rows: [...] } format
      let existingIntegrations: any[] = [];
      if (Array.isArray(existingResult)) {
        existingIntegrations = existingResult;
      } else if (existingResult?.rows && Array.isArray(existingResult.rows)) {
        existingIntegrations = existingResult.rows;
      } else if (existingResult && typeof existingResult === 'object' && 'length' in existingResult) {
        // Handle array-like objects
        existingIntegrations = Array.from(existingResult);
      }
      
      if (existingIntegrations && existingIntegrations.length > 0) {
        return ApiErrorHandler.conflict('Integration with this slug already exists');
      }
    } catch (error: any) {
      // If table doesn't exist, we can't check for duplicates
      // But we should still try to create it (will fail if table doesn't exist)
      if (error?.code === '42P01' || error?.message?.includes('does not exist')) {
        // Table doesn't exist - can't check for duplicates, but will fail on insert anyway
        // Continue to insert attempt
      } else {
        throw error;
      }
    }

    // Create new integration using raw SQL with schema qualification
    const insertResult = await db.execute(sql`
      INSERT INTO financbase.financbase_integrations 
      (name, slug, description, category, icon, color, is_active, is_official, version, 
       configuration, features, requirements, documentation, support_url)
      VALUES (${name}, ${slug}, ${description || null}, ${category}, ${icon || null}, ${color || null}, 
              true, ${isOfficial}, ${version}, 
              ${JSON.stringify(configuration || {})}, 
              ${JSON.stringify(features || [])}, 
              ${JSON.stringify(requirements || {})}, 
              ${documentation || null}, ${supportUrl || null})
      RETURNING id, name, slug, description, category, icon, color, is_active, is_official, 
                version, configuration, features, requirements, documentation, support_url, 
                created_at, updated_at
    `) as any;
    
    // Handle different result formats from db.execute
    let newIntegration: any = null;
    if (Array.isArray(insertResult) && insertResult.length > 0) {
      newIntegration = insertResult[0];
    } else if (insertResult?.rows && Array.isArray(insertResult.rows) && insertResult.rows.length > 0) {
      newIntegration = insertResult.rows[0];
    } else if (insertResult && typeof insertResult === 'object' && 'length' in insertResult && (insertResult as any).length > 0) {
      newIntegration = (insertResult as any)[0];
    }

    if (!newIntegration) {
      return ApiErrorHandler.handle(new Error('Failed to create integration'), requestId);
    }

    return NextResponse.json({
      integration: newIntegration,
      message: 'Integration created successfully',
    }, { status: 201 });
  } catch (error) {
    return ApiErrorHandler.handle(error, requestId);
  }
}
