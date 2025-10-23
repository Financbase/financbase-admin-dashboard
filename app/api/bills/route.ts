/**
 * Bills API Routes
 * RESTful endpoints for bill management, OCR processing, and payment automation
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { billPayService } from '@/lib/services/bill-pay/bill-pay-service';
import { auditLogger } from '@/lib/services/security/audit-logging-service';

// GET /api/bills - Get user's bills with filtering
export async function GET(request: NextRequest) {
  try {
    const { userId } = getAuth(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const vendorId = searchParams.get('vendorId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // This would query the database using Drizzle ORM
    // For now, return mock data
    const mockBills = [
      {
        id: 'bill_1',
        vendorId: 'vendor_1',
        amount: 1250.00,
        currency: 'USD',
        dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        issueDate: new Date(),
        invoiceNumber: 'INV-2025-001',
        description: 'Monthly software license',
        category: 'software',
        status: 'approved',
        priority: 'medium',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'bill_2',
        vendorId: 'vendor_2',
        amount: 450.00,
        currency: 'USD',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        issueDate: new Date(),
        invoiceNumber: 'OFF-2025-023',
        description: 'Office supplies and equipment',
        category: 'office_supplies',
        status: 'pending_approval',
        priority: 'high',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    const filteredBills = mockBills.filter(bill => {
      if (status && bill.status !== status) return false;
      if (vendorId && bill.vendorId !== vendorId) return false;
      return true;
    });

    return NextResponse.json({
      bills: filteredBills.slice(offset, offset + limit),
      total: filteredBills.length,
      limit,
      offset
    });

  } catch (error) {
    console.error('Failed to fetch bills:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bills' },
      { status: 500 }
    );
  }
}

// POST /api/bills - Create new bill
export async function POST(request: NextRequest) {
  try {
    const { userId } = getAuth(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
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
      priority,
      status: 'draft'
    });

    await auditLogger.logEvent({
      userId,
      eventType: 'bill_created',
      action: 'bill_management',
      entityType: 'bill',
      entityId: bill.id,
      description: `Bill created: ${description} for ${formatCurrency(amount)}`,
      riskLevel: 'low',
      metadata: { category, priority, vendorId },
      complianceFlags: ['soc2']
    });

    return NextResponse.json({ bill }, { status: 201 });

  } catch (error) {
    console.error('Failed to create bill:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create bill' },
      { status: 500 }
    );
  }
}

// Helper function
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
}
