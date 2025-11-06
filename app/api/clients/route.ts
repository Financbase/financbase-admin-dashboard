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
import { clients } from '@/lib/db/schemas/clients.schema';
import { createClientSchema } from '@/lib/validation-schemas';
import { ApiErrorHandler, generateRequestId } from '@/lib/api-error-handler';
import { eq, count, and, like, or } from 'drizzle-orm';

/**
 * @swagger
 * /api/clients:
 *   get:
 *     summary: Get list of clients
 *     description: Retrieves a paginated list of clients for the authenticated user with optional filtering and search
 *     tags:
 *       - Clients
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
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term to filter clients by name, email, or company
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, suspended]
 *         description: Filter clients by status
 *     responses:
 *       200:
 *         description: Clients retrieved successfully
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
 *                         example: client_123
 *                       name:
 *                         type: string
 *                         example: Acme Corporation
 *                       email:
 *                         type: string
 *                         example: contact@acme.com
 *                       company:
 *                         type: string
 *                         example: Acme Corp
 *                       status:
 *                         type: string
 *                         enum: [active, inactive, suspended]
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 10
 *                     total:
 *                       type: integer
 *                       example: 45
 *                     pages:
 *                       type: integer
 *                       example: 5
 *       401:
 *         description: Unauthorized - Authentication required
 *       500:
 *         description: Internal server error
 */
export async function GET(req: NextRequest) {
  const requestId = generateRequestId();
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
      const searchConditions: ReturnType<typeof like>[] = [];
      searchConditions.push(like(clients.name, `%${search}%`));
      searchConditions.push(like(clients.email, `%${search}%`));
      if (clients.company) {
        searchConditions.push(like(clients.company, `%${search}%`));
      }
      
      if (searchConditions.length === 1) {
        whereConditions.push(searchConditions[0]);
      } else if (searchConditions.length > 1) {
        const orCondition = or(...searchConditions);
        if (orCondition) {
          whereConditions.push(orCondition);
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
    return ApiErrorHandler.handle(error, requestId);
  }
}

/**
 * @swagger
 * /api/clients:
 *   post:
 *     summary: Create a new client
 *     description: Creates a new client for the authenticated user
 *     tags:
 *       - Clients
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *             properties:
 *               name:
 *                 type: string
 *                 example: Acme Corporation
 *               email:
 *                 type: string
 *                 format: email
 *                 example: contact@acme.com
 *               company:
 *                 type: string
 *                 example: Acme Corp
 *               phone:
 *                 type: string
 *                 example: +1-555-0123
 *               address:
 *                 type: string
 *                 example: 123 Main St
 *               city:
 *                 type: string
 *                 example: New York
 *               state:
 *                 type: string
 *                 example: NY
 *               zipCode:
 *                 type: string
 *                 example: "10001"
 *               status:
 *                 type: string
 *                 enum: [active, inactive, suspended]
 *                 default: active
 *     responses:
 *       201:
 *         description: Client created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: client_123
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *       400:
 *         description: Bad request - Invalid input data
 *       401:
 *         description: Unauthorized - Authentication required
 *       500:
 *         description: Internal server error
 */
export async function POST(req: NextRequest) {
  const requestId = generateRequestId();
  try {
    const { userId } = await auth();
    if (!userId) {
      return ApiErrorHandler.unauthorized();
    }

    let body;
    try {
      body = await req.json();
    } catch (error) {
      return ApiErrorHandler.badRequest('Invalid JSON in request body');
    }
    const validatedData = createClientSchema.parse({
      ...body,
      userId // Ensure userId comes from auth, not request body
    });

    // Create the client
    // Convert numeric fields to strings for decimal columns
    const [newClient] = await db
      .insert(clients)
      .values({
        ...validatedData,
        totalInvoiced: validatedData.totalInvoiced?.toString() || '0',
        totalPaid: validatedData.totalPaid?.toString() || '0',
        outstandingBalance: validatedData.outstandingBalance?.toString() || '0',
      })
      .returning();

    return NextResponse.json({
      success: true,
      message: 'Client created successfully',
      data: newClient
    }, { status: 201 });
  } catch (error) {
    return ApiErrorHandler.handle(error, requestId);
  }
}
