/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { ApiErrorHandler, generateRequestId } from '@/lib/api-error-handler';
import { IntegrationService } from '@/lib/services/integration-service';

/**
 * @swagger
 * /api/integrations:
 *   get:
 *     summary: Get available integrations
 *     description: Retrieves a paginated list of available third-party integrations (accounting software, payment processors, etc.)
 *     tags:
 *       - Integrations
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter integrations by category (accounting, payment, crm, etc.)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for integration name or description
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Maximum number of integrations to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of integrations to skip
 *     responses:
 *       200:
 *         description: Integrations retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     example: integration_123
 *                   name:
 *                     type: string
 *                     example: QuickBooks
 *                   description:
 *                     type: string
 *                   category:
 *                     type: string
 *                     example: accounting
 *                   isOfficial:
 *                     type: boolean
 *                     example: true
 *                   isActive:
 *                     type: boolean
 *                     example: true
 *       401:
 *         description: Unauthorized - Authentication required
 *       500:
 *         description: Internal server error
 */
export async function GET(request: NextRequest) {
  const requestId = generateRequestId();
  try {
    const { userId } = await auth();
    if (!userId) {
      return ApiErrorHandler.unauthorized();
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || undefined;
    const search = searchParams.get('search') || undefined;
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const availableIntegrations = await IntegrationService.getIntegrations({
      category: category && category !== 'all' ? category : undefined,
      search,
      isActive: true,
      limit,
      offset,
    });

    return NextResponse.json(availableIntegrations);
  } catch (error) {
    // Check if it's a database connection error
    if (error instanceof Error && (error.message.includes('DATABASE_URL') || error.message.includes('connection'))) {
      return ApiErrorHandler.databaseError(error, requestId);
    }
    
    return ApiErrorHandler.handle(error, requestId);
  }
}