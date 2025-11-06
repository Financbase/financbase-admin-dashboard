/**
 * Reports API Route
 * Handles report CRUD operations
 */

/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db/connection';
import { reports } from '@/lib/db/schemas/reports.schema';
import { eq, and, desc, sql, isNull } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

// Helper function to get the database connection with user context
async function getDb(userId: string) {
  // Set the user ID for RLS (Row Level Security)
  await db.execute(sql`set local request.jwt.claims.user_id = ${userId}`);
  return db;
}

// Helper function to validate report data
function validateReportData(data: any) {
  if (!data.name || !data.type) {
    return { error: 'Missing required fields: name and type are required' };
  }
  return null;
}

/**
 * @swagger
 * /api/reports:
 *   get:
 *     summary: Get list of reports
 *     description: Retrieves a paginated list of financial reports with optional filtering by type and favorites
 *     tags:
 *       - Analytics
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Filter reports by type
 *       - in: query
 *         name: isFavorite
 *         schema:
 *           type: boolean
 *         description: Return only favorite reports
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Maximum number of reports to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of reports to skip
 *     responses:
 *       200:
 *         description: Reports retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: report_123
 *                       name:
 *                         type: string
 *                         example: Monthly Revenue Report
 *                       type:
 *                         type: string
 *                       isFavorite:
 *                         type: boolean
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                 total:
 *                   type: integer
 *       401:
 *         description: Unauthorized - Authentication required
 *       500:
 *         description: Internal server error
 */
/**
 * GET /api/reports
 * Fetch all reports for the authenticated user
 */
export async function GET(req: Request) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const isFavorite = searchParams.get('isFavorite') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');

    // Get database connection with user context
    const db = await getDb(userId);

    // Build the base query
    let query = db
      .select()
      .from(reports)
      .where(and(
        eq(reports.userId, userId),
        isNull(reports.deletedAt) // Soft delete check
      ))
      .$dynamic();

    // Apply filters if provided
    if (type) {
      query = query.where(eq(reports.type, type));
    }

    if (search) {
      query = query.where(sql`name ILIKE ${`%${search}%`}`);
    }

    // Get total count for pagination
    const totalResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(query.as('filtered_reports'));
    
    const total = totalResult[0]?.count || 0;

    // Apply pagination and ordering
    const result = await query
      .orderBy(desc(reports.updatedAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json({
      data: result,
      total,
      page: Math.floor(offset / limit) + 1,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reports' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/reports
 * Create a new report
 */
export async function POST(req: Request) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      );
    }
    
    const body = await req.json();
    
    // Validate request body
    const validation = validateReportData(body);
    if (validation) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }
    
    // Get database connection with user context
    const db = await getDb(userId);
    
    // Create new report in the database
    const now = new Date();
    const [newReport] = await db.insert(reports).values({
      userId,
      name: body.name,
      description: body.description || '',
      type: body.type,
      config: body.config || {},
      visualizationType: body.visualizationType || 'table',
      chartConfig: body.chartConfig || {},
      isFavorite: body.isFavorite || false,
      isPublic: body.isPublic || false,
      status: 'active',
      createdAt: now,
      updatedAt: now,
    }).returning();
    
    return NextResponse.json(newReport, { status: 201 });
  } catch (error) {
    console.error('Error creating report:', error);
    return NextResponse.json(
      { error: 'Failed to create report' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/reports/:id
 * Update an existing report
 */
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      );
    }
    
    const { id } = params;
    const body = await req.json();
    
    // Get database connection with user context
    const db = await getDb(userId);
    
    // Check if report exists and belongs to user
    const [existingReport] = await db
      .select()
      .from(reports)
      .where(
        and(
          eq(reports.id, parseInt(id)),
          eq(reports.userId, userId),
          isNull(reports.deletedAt)
        )
      )
      .limit(1);
    
    if (!existingReport) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      );
    }
    
    // Prepare update data
    const updateData: any = {
      ...body,
      updatedAt: new Date()
    };
    
    // Update report in database
    const [updatedReport] = await db
      .update(reports)
      .set(updateData)
      .where(
        and(
          eq(reports.id, parseInt(id)),
          eq(reports.userId, userId)
        )
      )
      .returning();
    
    return NextResponse.json(updatedReport);
  } catch (error) {
    console.error('Error updating report:', error);
    return NextResponse.json(
      { error: 'Failed to update report' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/reports/:id
 * Soft delete a report
 */
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      );
    }
    
    const { id } = params;
    
    // Get database connection with user context
    const db = await getDb(userId);
    
    // Check if report exists and belongs to user
    const [existingReport] = await db
      .select()
      .from(reports)
      .where(
        and(
          eq(reports.id, parseInt(id)),
          eq(reports.userId, userId),
          isNull(reports.deletedAt)
        )
      )
      .limit(1);
    
    if (!existingReport) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      );
    }
    
    // Soft delete the report
    await db
      .update(reports)
      .set({ 
        deletedAt: new Date(),
        updatedAt: new Date()
      })
      .where(
        and(
          eq(reports.id, parseInt(id)),
          eq(reports.userId, userId)
        )
      );
    
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting report:', error);
    return NextResponse.json(
      { error: 'Failed to delete report' },
      { status: 500 }
    );
  }
}

