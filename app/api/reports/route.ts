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

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { reports } from '@/lib/db/schemas/reports.schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import { ApiErrorHandler, generateRequestId } from '@/lib/api-error-handler';
import { withRLS } from '@/lib/api/with-rls';

// Helper function to validate report data
function validateReportData(data: any): { error: string } | null {
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
  const requestId = generateRequestId();
  return withRLS(async (userId) => {
    try {
      const { searchParams } = new URL(req.url);
      const type = searchParams.get('type');
      const isFavorite = searchParams.get('isFavorite') === 'true';
      const limit = parseInt(searchParams.get('limit') || '50');
      const offset = parseInt(searchParams.get('offset') || '0');
      const search = searchParams.get('search');

      // Build where conditions
      const whereConditions = [
        eq(reports.userId, userId)
      ];

      // Apply filters if provided
      if (type) {
        whereConditions.push(eq(reports.type, type));
      }

      if (search) {
        whereConditions.push(sql`${reports.name} ILIKE ${`%${search}%`}`);
      }

      // Get total count for pagination
      const totalResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(reports)
        .where(and(...whereConditions));
      
      const total = Number(totalResult[0]?.count || 0);

      // Fetch reports with pagination and ordering
      const result = await db
        .select()
        .from(reports)
        .where(and(...whereConditions))
        .orderBy(desc(reports.updatedAt))
        .limit(limit)
        .offset(offset);

      return NextResponse.json({
        success: true,
        data: result,
        total,
        page: Math.floor(offset / limit) + 1,
        totalPages: Math.ceil(total / limit),
        requestId
      });
    } catch (error) {
      return ApiErrorHandler.handle(error, requestId);
    }
  });
}

/**
 * POST /api/reports
 * Create a new report
 */
export async function POST(req: Request) {
  const requestId = generateRequestId();
  return withRLS(async (userId) => {
    try {
      let body;
      try {
        body = await req.json();
      } catch (error) {
        return ApiErrorHandler.badRequest('Invalid JSON in request body', requestId);
      }
      
      // Validate request body
      const validation = validateReportData(body);
      if (validation) {
        return ApiErrorHandler.badRequest(validation.error, requestId);
      }
      
      // Create new report in the database
      const now = new Date();
      const [newReport] = await db.insert(reports).values({
        userId,
        name: body.name,
        description: body.description || '',
        type: body.type,
        templateId: body.templateId || undefined,
        parameters: body.parameters || undefined,
        status: body.status || 'pending',
        createdAt: now,
        updatedAt: now,
      }).returning();
      
      return NextResponse.json({
        success: true,
        data: newReport,
        requestId
      }, { status: 201 });
    } catch (error) {
      return ApiErrorHandler.handle(error, requestId);
    }
  });
}

/**
 * PATCH /api/reports/:id
 * Update an existing report
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  const requestId = generateRequestId();
  return withRLS(async (userId) => {
    try {
      const { id } = await Promise.resolve(params);
      let body;
      try {
        body = await req.json();
      } catch (error) {
        return ApiErrorHandler.badRequest('Invalid JSON in request body', requestId);
      }
      
      // Check if report exists and belongs to user
      const [existingReport] = await db
        .select()
        .from(reports)
        .where(
          and(
            eq(reports.id, id),
            eq(reports.userId, userId)
          )
        )
        .limit(1);
      
      if (!existingReport) {
        return ApiErrorHandler.notFound('Report not found', requestId);
      }
      
      // Prepare update data - only allow updating specific fields
      const updateData: Partial<typeof reports.$inferInsert> = {
        name: body.name,
        description: body.description,
        type: body.type,
        templateId: body.templateId,
        parameters: body.parameters,
        status: body.status,
      };
      
      // Update report in database
      const [updatedReport] = await db
        .update(reports)
        .set({
          ...updateData,
          updatedAt: new Date()
        })
        .where(
          and(
            eq(reports.id, id),
            eq(reports.userId, userId)
          )
        )
        .returning();
      
      return NextResponse.json({
        success: true,
        data: updatedReport,
        requestId
      });
    } catch (error) {
      return ApiErrorHandler.handle(error, requestId);
    }
  });
}

/**
 * DELETE /api/reports/:id
 * Soft delete a report
 */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  const requestId = generateRequestId();
  return withRLS(async (userId) => {
    try {
      const { id } = await Promise.resolve(params);
      
      // Check if report exists and belongs to user
      const [existingReport] = await db
        .select()
        .from(reports)
        .where(
          and(
            eq(reports.id, id),
            eq(reports.userId, userId)
          )
        )
        .limit(1);
      
      if (!existingReport) {
        return ApiErrorHandler.notFound('Report not found', requestId);
      }
      
      // Delete the report (hard delete since no soft delete field)
      await db
        .delete(reports)
        .where(
          and(
            eq(reports.id, id),
            eq(reports.userId, userId)
          )
        );
      
      return new NextResponse(null, { status: 204 });
    } catch (error) {
      return ApiErrorHandler.handle(error, requestId);
    }
  });
}

