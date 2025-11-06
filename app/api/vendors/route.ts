/**
 * Vendors API Routes
 * Vendor management, payment preferences, and approval settings
 */

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
import { billPayService } from '@/lib/services/bill-pay/bill-pay-service';
import { ApiErrorHandler, generateRequestId } from '@/lib/api-error-handler';

/**
 * @swagger
 * /api/vendors:
 *   get:
 *     summary: Get list of vendors
 *     description: Retrieves a paginated list of vendors with optional filtering by status and category
 *     tags:
 *       - Financial
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, suspended, blacklisted]
 *         description: Filter vendors by status
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter vendors by category
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Maximum number of vendors to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of vendors to skip
 *     responses:
 *       200:
 *         description: Vendors retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 vendors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: vendor_123
 *                       name:
 *                         type: string
 *                         example: Acme Supplies Inc
 *                       email:
 *                         type: string
 *                         format: email
 *                       status:
 *                         type: string
 *                         enum: [active, inactive, suspended, blacklisted]
 *                       paymentTerms:
 *                         type: string
 *                         example: Net 30
 *                 total:
 *                   type: integer
 *       401:
 *         description: Unauthorized - Authentication required
 *       500:
 *         description: Internal server error
 */
// GET /api/vendors - Get user's vendors
export async function GET(request: NextRequest) {
  const requestId = generateRequestId();
  try {
    const { userId } = await auth();
    if (!userId) {
      return ApiErrorHandler.unauthorized();
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Use real service method instead of mock data
    const vendors = await billPayService.getVendors(userId, {
      status: status || undefined,
      category: category || undefined,
      limit,
      offset
    });

    return NextResponse.json({
      vendors: vendors.data,
      total: vendors.total,
      limit,
      offset
    });

  } catch (error) {
    return ApiErrorHandler.handle(error, requestId);
  }
}

/**
 * @swagger
 * /api/vendors:
 *   post:
 *     summary: Create a new vendor
 *     description: Creates a new vendor record with payment preferences and approval settings
 *     tags:
 *       - Financial
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
 *             properties:
 *               name:
 *                 type: string
 *                 example: Acme Supplies Inc
 *               email:
 *                 type: string
 *                 format: email
 *                 example: contact@acme.com
 *               phone:
 *                 type: string
 *                 example: +1-555-0123
 *               address:
 *                 type: string
 *               city:
 *                 type: string
 *               state:
 *                 type: string
 *               zipCode:
 *                 type: string
 *               taxId:
 *                 type: string
 *                 example: 12-3456789
 *               paymentTerms:
 *                 type: string
 *                 example: Net 30
 *               category:
 *                 type: string
 *                 example: supplier
 *               paymentMethods:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: [check, ach]
 *               autoPay:
 *                 type: boolean
 *                 default: false
 *               approvalRequired:
 *                 type: boolean
 *                 default: true
 *               approvalThreshold:
 *                 type: number
 *                 default: 1000.00
 *     responses:
 *       201:
 *         description: Vendor created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 vendor:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: vendor_123
 *                     name:
 *                       type: string
 *       400:
 *         description: Bad request - Invalid input data
 *       401:
 *         description: Unauthorized - Authentication required
 *       500:
 *         description: Internal server error
 */
// POST /api/vendors - Create new vendor
export async function POST(request: NextRequest) {
  const requestId = generateRequestId();
  try {
    const { userId } = await auth();
    if (!userId) {
      return ApiErrorHandler.unauthorized();
    }

    let body;
    try {
      body = await request.json();
    } catch (error) {
      return ApiErrorHandler.badRequest('Invalid JSON in request body');
    }
    const {
      name,
      email,
      phone,
      address,
      taxId,
      paymentTerms,
      category,
      paymentMethods,
      autoPay,
      approvalRequired,
      approvalThreshold
    } = body;

    if (!name || !email) {
      return ApiErrorHandler.badRequest('Name and email are required');
    }

    // Create vendor using service
    const vendor = await billPayService.addVendor(userId, {
      name,
      email,
      phone,
      address,
      taxId,
      paymentTerms,
      category,
      paymentMethods,
      autoPay,
      approvalRequired,
      approvalThreshold
    });

    return NextResponse.json({ vendor }, { status: 201 });

  } catch (error) {
    return ApiErrorHandler.handle(error, requestId);
  }
}
