/**
 * Bills API Routes
 * RESTful endpoints for bill management, OCR processing, and payment automation
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
import { auditLogger, AuditEventType, RiskLevel, ComplianceFramework } from '@/lib/services/security/audit-logging-service';
import { ApiErrorHandler, generateRequestId } from '@/lib/api-error-handler';

/**
 * @swagger
 * /api/bills:
 *   get:
 *     summary: Get list of bills
 *     description: Retrieves a paginated list of bills with optional filtering by status and vendor
 *     tags:
 *       - Financial
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, received, processing, pending_approval, approved, rejected, paid, overdue, cancelled, disputed]
 *         description: Filter bills by status
 *       - in: query
 *         name: vendorId
 *         schema:
 *           type: string
 *         description: Filter bills by vendor ID
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Maximum number of bills to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of bills to skip
 *     responses:
 *       200:
 *         description: Bills retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 bills:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: bill_123
 *                       vendorId:
 *                         type: string
 *                       amount:
 *                         type: number
 *                         example: 1250.00
 *                       currency:
 *                         type: string
 *                         example: USD
 *                       status:
 *                         type: string
 *                         enum: [draft, received, processing, pending_approval, approved, rejected, paid, overdue, cancelled, disputed]
 *                       dueDate:
 *                         type: string
 *                         format: date-time
 *                       invoiceNumber:
 *                         type: string
 *                         example: INV-2025-001
 *                 total:
 *                   type: integer
 *                   example: 125
 *                 limit:
 *                   type: integer
 *                 offset:
 *                   type: integer
 *       401:
 *         description: Unauthorized - Authentication required
 *       500:
 *         description: Internal server error
 */
// GET /api/bills - Get user's bills with filtering
export async function GET(request: NextRequest) {
  const requestId = generateRequestId();
  try {
    const { userId } = await auth();
    if (!userId) {
      return ApiErrorHandler.unauthorized();
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const vendorId = searchParams.get('vendorId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Query the database using Drizzle ORM
    const bills = await billPayService.getBills(userId, {
      status: status || undefined,
      vendorId: vendorId || undefined,
      limit,
      offset
    });

    return NextResponse.json({
      bills: bills.data,
      total: bills.total,
      limit,
      offset
    });

  } catch (error) {
    return ApiErrorHandler.handle(error, requestId);
  }
}

/**
 * @swagger
 * /api/bills:
 *   post:
 *     summary: Create a new bill
 *     description: Creates a new bill record for processing, OCR extraction, and payment automation
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
 *               - vendorId
 *               - amount
 *               - invoiceNumber
 *             properties:
 *               vendorId:
 *                 type: string
 *                 example: vendor_123
 *               amount:
 *                 type: number
 *                 example: 1250.00
 *               currency:
 *                 type: string
 *                 default: USD
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *               issueDate:
 *                 type: string
 *                 format: date-time
 *               invoiceNumber:
 *                 type: string
 *                 example: INV-2025-001
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *               documentUrl:
 *                 type: string
 *                 format: uri
 *               status:
 *                 type: string
 *                 enum: [draft, received, processing, pending_approval, approved, rejected, paid, overdue, cancelled, disputed]
 *                 default: received
 *     responses:
 *       201:
 *         description: Bill created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 bill:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: bill_123
 *                     invoiceNumber:
 *                       type: string
 *       400:
 *         description: Bad request - Invalid input data
 *       401:
 *         description: Unauthorized - Authentication required
 *       500:
 *         description: Internal server error
 */
// POST /api/bills - Create new bill
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
      vendorId,
      amount,
      currency,
      dueDate,
      issueDate,
      invoiceNumber,
      description,
      category,
      priority = 'medium'
    } = body;

    // Create bill using service
    const bill = await billPayService.createBill(userId, {
      vendorId,
      amount,
      currency,
      dueDate,
      issueDate,
      invoiceNumber,
      description,
      category,
      priority
    });

    await auditLogger.logEvent({
      userId,
      eventType: AuditEventType.API_ACCESS,
      action: 'bill_management',
      entityType: 'bill',
      entityId: bill.id,
      description: `Bill created: ${description} for ${formatCurrency(amount)}`,
      riskLevel: RiskLevel.LOW,
      metadata: { category, priority, vendorId },
      complianceFlags: [ComplianceFramework.SOC2]
    });

    return NextResponse.json({ bill }, { status: 201 });

  } catch (error) {
    return ApiErrorHandler.handle(error, requestId);
  }
}

// Helper function
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
}
