/**
 * Bills API Routes
 * RESTful endpoints for bill management, OCR processing, and payment automation
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { billPayService } from '@/lib/services/bill-pay/bill-pay-service';
import { auditLogger, AuditEventType, RiskLevel, ComplianceFramework } from '@/lib/services/security/audit-logging-service';
import { ApiErrorHandler, generateRequestId } from '@/lib/api-error-handler';

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
